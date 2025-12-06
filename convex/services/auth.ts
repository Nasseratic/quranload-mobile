import { mutation, query } from "../_generated/server";
import { v } from "convex/values";
import { ConvexError } from "convex/values";

// Simple hash function for passwords (in production, use bcrypt via an action)
// For now, we'll use a simple base64 encoding as a placeholder
// In production, you should use proper password hashing via a Convex action
function hashPassword(password: string): string {
  // This is a placeholder - in production use bcrypt via action
  return Buffer.from(password).toString("base64");
}

function verifyPassword(password: string, hash: string): boolean {
  return hashPassword(password) === hash;
}

function generateToken(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

function generateCode(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

// Sign in - returns access token and refresh token
export const signIn = mutation({
  args: {
    email: v.string(),
    password: v.string(),
  },
  handler: async (ctx, { email, password }) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", email.toLowerCase()))
      .first();

    if (!user) {
      throw new ConvexError("Invalid email or password");
    }

    if (!verifyPassword(password, user.passwordHash)) {
      throw new ConvexError("Invalid email or password");
    }

    if (!user.emailConfirmed) {
      throw new ConvexError("Please confirm your email before signing in");
    }

    // Generate new tokens
    const accessToken = generateToken();
    const refreshToken = generateToken();
    const refreshTokenExpiry = Date.now() + 30 * 24 * 60 * 60 * 1000; // 30 days

    // Update user with new refresh token
    await ctx.db.patch(user._id, {
      refreshToken,
      refreshTokenExpiry,
    });

    return {
      accessToken,
      refreshToken,
      userId: user._id,
    };
  },
});

// Refresh token
export const refreshToken = mutation({
  args: {
    refreshToken: v.string(),
  },
  handler: async (ctx, { refreshToken }) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_refreshToken", (q) => q.eq("refreshToken", refreshToken))
      .first();

    if (!user) {
      throw new ConvexError("Invalid refresh token");
    }

    if (user.refreshTokenExpiry && user.refreshTokenExpiry < Date.now()) {
      throw new ConvexError("Refresh token expired");
    }

    // Generate new tokens
    const newAccessToken = generateToken();
    const newRefreshToken = generateToken();
    const refreshTokenExpiry = Date.now() + 30 * 24 * 60 * 60 * 1000; // 30 days

    await ctx.db.patch(user._id, {
      refreshToken: newRefreshToken,
      refreshTokenExpiry,
    });

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    };
  },
});

// Sign up / Register
export const signUp = mutation({
  args: {
    email: v.string(),
    password: v.string(),
    confirmPassword: v.string(),
    firstName: v.string(),
    lastName: v.string(),
  },
  handler: async (ctx, { email, password, confirmPassword, firstName, lastName }) => {
    if (password !== confirmPassword) {
      throw new ConvexError("Passwords do not match");
    }

    const normalizedEmail = email.toLowerCase();

    // Check if user already exists
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", normalizedEmail))
      .first();

    if (existingUser) {
      throw new ConvexError("Email already registered");
    }

    const emailConfirmationCode = generateCode();

    // Create user
    await ctx.db.insert("users", {
      email: normalizedEmail,
      username: normalizedEmail,
      passwordHash: hashPassword(password),
      fullName: `${firstName} ${lastName}`,
      roles: ["Student"],
      emailConfirmed: false,
      emailConfirmationCode,
    });

    // In production, send email with confirmation code here
    // For now, we'll return the code (remove in production!)
    return { message: "Registration successful. Please check your email to confirm your account." };
  },
});

// Forgot password
export const forgotPassword = mutation({
  args: {
    email: v.string(),
  },
  handler: async (ctx, { email }) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", email.toLowerCase()))
      .first();

    if (!user) {
      // Don't reveal if user exists
      return { message: "If an account exists, a password reset email has been sent." };
    }

    const resetCode = generateCode();
    const resetExpiry = Date.now() + 60 * 60 * 1000; // 1 hour

    await ctx.db.patch(user._id, {
      passwordResetCode: resetCode,
      passwordResetExpiry: resetExpiry,
    });

    // In production, send email with reset code here
    return { message: "If an account exists, a password reset email has been sent." };
  },
});

// Reset password
export const resetPassword = mutation({
  args: {
    email: v.string(),
    code: v.string(),
    password: v.string(),
    confirmPassword: v.string(),
  },
  handler: async (ctx, { email, code, password, confirmPassword }) => {
    if (password !== confirmPassword) {
      throw new ConvexError("Passwords do not match");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", email.toLowerCase()))
      .first();

    if (!user) {
      throw new ConvexError("Invalid reset code");
    }

    if (user.passwordResetCode !== code) {
      throw new ConvexError("Invalid reset code");
    }

    if (user.passwordResetExpiry && user.passwordResetExpiry < Date.now()) {
      throw new ConvexError("Reset code expired");
    }

    await ctx.db.patch(user._id, {
      passwordHash: hashPassword(password),
      passwordResetCode: undefined,
      passwordResetExpiry: undefined,
    });

    return { message: "Password reset successful" };
  },
});

// Confirm email
export const confirmEmail = mutation({
  args: {
    userId: v.string(),
    code: v.string(),
  },
  handler: async (ctx, { userId, code }) => {
    const user = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("_id"), userId))
      .first();

    if (!user) {
      throw new ConvexError("Invalid user");
    }

    if (user.emailConfirmationCode !== code) {
      throw new ConvexError("Invalid confirmation code");
    }

    await ctx.db.patch(user._id, {
      emailConfirmed: true,
      emailConfirmationCode: undefined,
    });

    return { message: "Email confirmed successfully" };
  },
});

// Resend confirmation email
export const resendConfirmationEmail = mutation({
  args: {
    email: v.string(),
  },
  handler: async (ctx, { email }) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", email.toLowerCase()))
      .first();

    if (!user) {
      // Don't reveal if user exists
      return { message: "If an account exists, a confirmation email has been sent." };
    }

    if (user.emailConfirmed) {
      return { message: "Email already confirmed" };
    }

    const newCode = generateCode();

    await ctx.db.patch(user._id, {
      emailConfirmationCode: newCode,
    });

    // In production, send email with confirmation code here
    return { message: "If an account exists, a confirmation email has been sent." };
  },
});

// Get current user by token (for session validation)
export const getCurrentUser = query({
  args: {
    refreshToken: v.string(),
  },
  handler: async (ctx, { refreshToken }) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_refreshToken", (q) => q.eq("refreshToken", refreshToken))
      .first();

    if (!user) {
      return null;
    }

    if (user.refreshTokenExpiry && user.refreshTokenExpiry < Date.now()) {
      return null;
    }

    // Get user's team memberships
    const teamMemberships = await ctx.db
      .query("teamMemberships")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    // Get teams with organization info
    const teams = await Promise.all(
      teamMemberships.map(async (membership) => {
        const team = await ctx.db.get(membership.teamId);
        if (!team) return null;

        const organization = await ctx.db.get(team.organizationId);

        return {
          id: team._id,
          name: team.name,
          fee: team.fee,
          studentCount: 0, // Would need separate count query
          organizationName: organization?.name ?? "",
          organizationLogo: organization?.logo,
          duration: team.duration,
          description: team.description ?? "",
          isActive: membership.isActive,
          isAllowedtoViewContents: membership.isAllowedToViewContents,
        };
      })
    );

    return {
      id: user._id,
      fullName: user.fullName,
      emailAddress: user.email,
      phoneNumber: user.phoneNumber ?? "",
      gender: user.gender ?? "",
      dateOfBirth: user.dateOfBirth ? new Date(user.dateOfBirth) : new Date(),
      teams: teams.filter((t) => t !== null),
      roles: user.roles,
      username: user.username ?? user.email,
      percentageOfAcceptedOrSubmittedLessons: 0, // Would need calculation
    };
  },
});
