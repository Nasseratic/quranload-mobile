import { mutation } from "../_generated/server";
import { userInfo } from "../schema";

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
