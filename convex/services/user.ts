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
  args: userInfo,
  handler: async (ctx, args) => {
    const existingUserInfo = await ctx.db
      .query("userInfo")
      .filter((q) => q.eq(q.field("userId"), args.userId))
      .unique();
    if (!existingUserInfo) {
      await ctx.db.insert("userInfo", args);
      return;
    }
    await ctx.db.patch(existingUserInfo._id, args);
  },
});

export const getUserAuthToken = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const userInfoRecord = await ctx.db
          .query("userInfo")
          .filter((q) => q.eq(q.field("userId"), args.userId))
          .unique();

    return {
      token: userInfoRecord?.authToken || null
    };
  },
});
