import { mutation, query, action } from "../_generated/server";
import { v } from "convex/values";
import { contactSupportInfo, userInfo } from "../schema";

/**
 * export const updateGithubOwner = internalMutation({
  // ...args
  handler: async (ctx, args) => {
    const existingOwner = await ctx.db
      .query("githubOwners")
      .filter((q) => q.eq(q.field("name"), args.name))
      .unique();

    if (!existingOwner) {
      await ctx.db.insert("githubOwners", args)
      return;
    }

    await ctx.db.patch(existingOwner._id, args)
  },
});
 */

export const updateUserInfo = mutation({
  args: {
    ...userInfo,
    teamIds: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const { teamIds, ...userInfoArgs } = args;

    const existingUserInfo = await ctx.db
      .query("userInfo")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .unique();

    if (!existingUserInfo) {
      await ctx.db.insert("userInfo", userInfoArgs);
    } else {
      // Rate limiting: Only update if lastSeen is older 1 day
      const ONE_DAY = 24 * 60 * 60 * 1000;
      const timeSinceLastUpdate = args.lastSeen - existingUserInfo.lastSeen;

      if (timeSinceLastUpdate >= ONE_DAY) {
        await ctx.db.patch(existingUserInfo._id, userInfoArgs);
      }
    }

    // Populate userTeam for all teams (many-to-many: user can be in multiple teams)
    if (teamIds?.length) {
      const existingUserTeams = await ctx.db
        .query("userTeam")
        .withIndex("by_userId", (q) => q.eq("userId", args.userId))
        .collect();

      const existingTeamIds = new Set(existingUserTeams.map((ut) => ut.teamId));

      await Promise.all(
        teamIds
          .filter((teamId) => !existingTeamIds.has(teamId))
          .map((teamId) => ctx.db.insert("userTeam", { userId: args.userId, teamId }))
      );
    }
  },
});

export const getUserAuthToken = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const userInfoRecord = await ctx.db
          .query("userInfo")
          .withIndex("by_userId", (q) => q.eq("userId", args.userId))
          .unique();
    return {
      token: userInfoRecord?.authToken || null
    };
  },
});
