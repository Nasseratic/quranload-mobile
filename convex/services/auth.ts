import { getAuthUserId } from "@convex-dev/auth/server";
import { mutation, query } from "../_generated/server";
import { v } from "convex/values";
import { ConvexError } from "convex/values";

// Get current authenticated user
export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return null;
    }

    const user = await ctx.db.get(userId);
    if (!user) {
      return null;
    }

    // Get user profile
    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();

    // Get user's team memberships
    const teamMemberships = await ctx.db
      .query("teamMemberships")
      .withIndex("by_user", (q) => q.eq("userId", userId))
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
          studentCount: 0,
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
      id: userId,
      fullName: profile?.fullName ?? user.name ?? "",
      emailAddress: user.email ?? "",
      phoneNumber: profile?.phoneNumber ?? "",
      gender: profile?.gender ?? "",
      dateOfBirth: profile?.dateOfBirth ? new Date(profile.dateOfBirth) : new Date(),
      teams: teams.filter((t) => t !== null),
      roles: profile?.roles ?? ["Student"],
      username: user.email ?? "",
      percentageOfAcceptedOrSubmittedLessons: 0,
    };
  },
});

// Create or update user profile after registration
export const createUserProfile = mutation({
  args: {
    fullName: v.string(),
    phoneNumber: v.optional(v.string()),
    gender: v.optional(v.string()),
    dateOfBirth: v.optional(v.string()),
    role: v.optional(v.union(v.literal("Student"), v.literal("Teacher"))),
  },
  handler: async (ctx, { fullName, phoneNumber, gender, dateOfBirth, role }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new ConvexError("Not authenticated");
    }

    // Check if profile exists
    const existingProfile = await ctx.db
      .query("userProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();

    if (existingProfile) {
      // Update existing profile
      await ctx.db.patch(existingProfile._id, {
        fullName,
        phoneNumber,
        gender,
        dateOfBirth,
        roles: role ? [role] : existingProfile.roles,
      });
    } else {
      // Create new profile
      await ctx.db.insert("userProfiles", {
        userId,
        fullName,
        phoneNumber,
        gender,
        dateOfBirth,
        roles: [role ?? "Student"],
      });
    }

    return { success: true };
  },
});

// Update user profile
export const updateProfile = mutation({
  args: {
    fullName: v.string(),
    emailAddress: v.string(),
    phoneNumber: v.string(),
  },
  handler: async (ctx, { fullName, phoneNumber }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new ConvexError("Not authenticated");
    }

    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();

    if (!profile) {
      // Create profile if it doesn't exist
      await ctx.db.insert("userProfiles", {
        userId,
        fullName,
        phoneNumber,
        roles: ["Student"],
      });
    } else {
      await ctx.db.patch(profile._id, {
        fullName,
        phoneNumber,
      });
    }

    return { message: "Profile updated successfully" };
  },
});

// Check if user is authenticated
export const isAuthenticated = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    return userId !== null;
  },
});
