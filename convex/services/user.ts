import { mutation, query } from "../_generated/server";
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
    teamId: v.optional(v.string()), // Backward compatibility: single team
    teamIds: v.optional(v.array(v.string())), // Multiple teams
  },
  handler: async (ctx, args) => {
    const { teamId, teamIds, ...userInfoArgs } = args;

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

    // Combine teamId and teamIds into a single list (deduplicated)
    const allTeamIds = [
      ...(teamId ? [teamId] : []),
      ...(teamIds ?? []),
    ].filter((id, index, arr) => arr.indexOf(id) === index);

    // Populate userTeam for all teams (many-to-many: user can be in multiple teams)
    await Promise.all(
      allTeamIds.map(async (tid) => {
        const existingUserTeam = await ctx.db
          .query("userTeam")
          .withIndex("by_userId_teamId", (q) =>
            q.eq("userId", args.userId).eq("teamId", tid)
          )
          .unique();

        if (!existingUserTeam) {
          await ctx.db.insert("userTeam", { userId: args.userId, teamId: tid });
        }
      })
    );
  },
});
