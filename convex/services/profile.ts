import { mutation, query } from "../_generated/server";
import { v } from "convex/values";
import { ConvexError } from "convex/values";

// Simple hash function for passwords (same as auth.ts)
function hashPassword(password: string): string {
  return Buffer.from(password).toString("base64");
}

function verifyPassword(password: string, hash: string): boolean {
  return hashPassword(password) === hash;
}

// Get user profile by ID
export const getProfile = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, { userId }) => {
    const user = await ctx.db.get(userId);

    if (!user) {
      throw new ConvexError("User not found");
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

        // Count students in team
        const studentCount = (
          await ctx.db
            .query("teamMemberships")
            .withIndex("by_team", (q) => q.eq("teamId", team._id))
            .collect()
        ).length;

        return {
          id: team._id,
          name: team.name,
          fee: team.fee,
          studentCount,
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
      percentageOfAcceptedOrSubmittedLessons: 0, // TODO: Calculate
    };
  },
});

// Update user profile
export const updateProfile = mutation({
  args: {
    userId: v.id("users"),
    fullName: v.string(),
    emailAddress: v.string(),
    phoneNumber: v.string(),
  },
  handler: async (ctx, { userId, fullName, emailAddress, phoneNumber }) => {
    const user = await ctx.db.get(userId);

    if (!user) {
      throw new ConvexError("User not found");
    }

    // Check if email is being changed and if it's already taken
    if (emailAddress.toLowerCase() !== user.email) {
      const existingUser = await ctx.db
        .query("users")
        .withIndex("by_email", (q) => q.eq("email", emailAddress.toLowerCase()))
        .first();

      if (existingUser) {
        throw new ConvexError("Email already in use");
      }
    }

    await ctx.db.patch(userId, {
      fullName,
      email: emailAddress.toLowerCase(),
      phoneNumber,
    });

    return { message: "Profile updated successfully" };
  },
});

// Change password
export const changePassword = mutation({
  args: {
    userId: v.id("users"),
    currentPassword: v.string(),
    newPassword: v.string(),
    confirmNewPassword: v.string(),
  },
  handler: async (ctx, { userId, currentPassword, newPassword, confirmNewPassword }) => {
    if (newPassword !== confirmNewPassword) {
      throw new ConvexError("New passwords do not match");
    }

    const user = await ctx.db.get(userId);

    if (!user) {
      throw new ConvexError("User not found");
    }

    if (!verifyPassword(currentPassword, user.passwordHash)) {
      throw new ConvexError("Current password is incorrect");
    }

    await ctx.db.patch(userId, {
      passwordHash: hashPassword(newPassword),
    });

    return { message: "Password changed successfully" };
  },
});

// Get subscription/payment history
export const getSubscriptions = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, { userId }) => {
    const subscriptions = await ctx.db
      .query("subscriptions")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    return {
      pager: {
        currentPageIndex: 0,
        pageSize: subscriptions.length,
        totalRecordCount: subscriptions.length,
        pageCount: 1,
      },
      list: subscriptions.map((sub) => ({
        id: sub._id,
        amount: sub.amount,
        status: sub.status,
        paymentDate: sub.paymentDate,
        expiryDate: sub.expiryDate,
        teamId: sub.teamId,
      })),
    };
  },
});

// Cancel subscription (unsubscribe from team)
export const cancelSubscription = mutation({
  args: {
    userId: v.id("users"),
    teamId: v.id("teams"),
  },
  handler: async (ctx, { userId, teamId }) => {
    const membership = await ctx.db
      .query("teamMemberships")
      .withIndex("by_user_team", (q) => q.eq("userId", userId).eq("teamId", teamId))
      .first();

    if (!membership) {
      throw new ConvexError("Membership not found");
    }

    await ctx.db.patch(membership._id, {
      isActive: false,
    });

    return { message: "Subscription cancelled" };
  },
});

// Get student statistics
export const getStudentStats = query({
  args: {
    userId: v.id("users"),
    teamId: v.id("teams"),
  },
  handler: async (ctx, { userId, teamId }) => {
    // Get all lessons for this student in this team
    const lessons = await ctx.db
      .query("lessons")
      .withIndex("by_student", (q) => q.eq("studentId", userId))
      .filter((q) => q.eq(q.field("teamId"), teamId))
      .collect();

    // Get all submissions for these lessons
    const submissions = await Promise.all(
      lessons.map((lesson) =>
        ctx.db
          .query("submissions")
          .withIndex("by_lesson", (q) => q.eq("lessonId", lesson._id))
          .first()
      )
    );

    const validSubmissions = submissions.filter((s) => s !== null);

    // Calculate statistics
    const totalRecordingHours =
      validSubmissions.reduce((acc, s) => acc + (s?.recordingDuration ?? 0), 0) / 3600;

    const totalNumberOfPagesRead = lessons.reduce((acc, l) => {
      if (l.startPage && l.endPage) {
        return acc + (l.endPage - l.startPage + 1);
      }
      return acc;
    }, 0);

    const sortedSubmissions = validSubmissions
      .filter((s) => s !== null)
      .sort((a, b) => a!.submittedAt - b!.submittedAt);

    return {
      firstSubmission: sortedSubmissions[0]?.submittedAt
        ? new Date(sortedSubmissions[0].submittedAt).toISOString()
        : null,
      lastSubmission: sortedSubmissions[sortedSubmissions.length - 1]?.submittedAt
        ? new Date(sortedSubmissions[sortedSubmissions.length - 1]!.submittedAt).toISOString()
        : null,
      assignmentVelocities: validSubmissions.map((s) => ({
        lessonId: s!._id,
        submissionDate: new Date(s!.submittedAt).toISOString(),
        averagePageDuration: 0,
        totalNumberOfPagesRead: 0,
        totalRecordingHours: (s?.recordingDuration ?? 0) / 3600,
      })),
      todaySpendMinutes: 0, // Would need more complex calculation
      totalRecordingHours,
      totalNumberOfPagesRead,
      averageTimePerPage: totalNumberOfPagesRead > 0 ? totalRecordingHours / totalNumberOfPagesRead : 0,
    };
  },
});

// Get teacher statistics
export const getTeacherStats = query({
  args: {
    userId: v.id("users"),
    teamIds: v.array(v.id("teams")),
  },
  handler: async (ctx, { userId, teamIds }) => {
    let totalSubmissions = 0;
    let totalRejections = 0;
    let totalMissed = 0;
    let totalApprovedMinutes = 0;
    let totalApprovedPages = 0;

    for (const teamId of teamIds) {
      const lessons = await ctx.db
        .query("lessons")
        .withIndex("by_team", (q) => q.eq("teamId", teamId))
        .collect();

      for (const lesson of lessons) {
        if (lesson.status === "submitted" || lesson.status === "accepted" || lesson.status === "rejected") {
          totalSubmissions++;
        }
        if (lesson.status === "rejected") {
          totalRejections++;
        }
        if (lesson.status === "accepted") {
          const submission = await ctx.db
            .query("submissions")
            .withIndex("by_lesson", (q) => q.eq("lessonId", lesson._id))
            .first();

          if (submission) {
            totalApprovedMinutes += (submission.recordingDuration ?? 0) / 60;
          }

          if (lesson.startPage && lesson.endPage) {
            totalApprovedPages += lesson.endPage - lesson.startPage + 1;
          }
        }
      }
    }

    return {
      totalSubmissions,
      totalRejections,
      totalMissed,
      totalApprovedMinutes,
      totalApprovedPages,
    };
  },
});
