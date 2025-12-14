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
  args: userInfo,
  handler: async (ctx, args) => {
    const existingUserInfo = await ctx.db
      .query("userInfo")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .unique();

    if (!existingUserInfo) {
      await ctx.db.insert("userInfo", args);
      return;
    }

    // Rate limiting: Only update if lastSeen is older than 5 minutes
    const FIVE_MINUTES = 5 * 60 * 1000;
    const timeSinceLastUpdate = args.lastSeen - existingUserInfo.lastSeen;

    if (timeSinceLastUpdate < FIVE_MINUTES) {
      // Skip update if last seen was updated recently
      return;
    }

    await ctx.db.patch(existingUserInfo._id, args);
  },
});
