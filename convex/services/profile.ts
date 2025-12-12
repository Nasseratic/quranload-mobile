import { mutation, query } from "../_generated/server";
import { v, ConvexError } from "convex/values";

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

    // Get user profile from userProfiles table
    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();

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
      fullName: profile?.fullName ?? user.name ?? "",
      emailAddress: user.email ?? "",
      phoneNumber: profile?.phoneNumber ?? "",
      gender: profile?.gender ?? "",
      dateOfBirth: profile?.dateOfBirth ? new Date(profile.dateOfBirth) : new Date(),
      teams: teams.filter((t) => t !== null),
      roles: profile?.roles ?? ["Student"],
      username: user.email ?? "",
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
  handler: async (ctx, { userId, fullName, phoneNumber }) => {
    const user = await ctx.db.get(userId);

    if (!user) {
      throw new ConvexError("User not found");
    }

    // Get or create user profile
    const existingProfile = await ctx.db
      .query("userProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();

    if (existingProfile) {
      await ctx.db.patch(existingProfile._id, {
        fullName,
        phoneNumber,
      });
    } else {
      await ctx.db.insert("userProfiles", {
        userId,
        fullName,
        phoneNumber,
        roles: ["Student"],
      });
    }

    return { message: "Profile updated successfully" };
  },
});

// Change password - Note: With Convex Auth, password changes should be handled through auth reset flows
export const changePassword = mutation({
  args: {
    userId: v.id("users"),
    currentPassword: v.string(),
    newPassword: v.string(),
    confirmNewPassword: v.string(),
  },
  handler: async (ctx, { userId, newPassword, confirmNewPassword }) => {
    if (newPassword !== confirmNewPassword) {
      throw new ConvexError("New passwords do not match");
    }

    const user = await ctx.db.get(userId);

    if (!user) {
      throw new ConvexError("User not found");
    }

    // Note: With Convex Auth, password changes are handled through the auth system
    // This mutation is kept for API compatibility but may need adjustment
    throw new ConvexError("Password changes should be done through the password reset flow");
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
  handler: async (ctx, { teamIds }) => {
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
