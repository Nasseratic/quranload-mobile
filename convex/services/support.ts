import { mutation, query } from "../_generated/server";
import { v } from "convex/values";
import { contactSupportInfo } from "../schema";

export const saveContactInfo = mutation({
  args: contactSupportInfo,
  handler: async (ctx, args) => {
    ctx.db.insert("contactSupportInfo", args);
  },
});
