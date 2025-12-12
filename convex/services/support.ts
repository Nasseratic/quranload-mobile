import { mutation } from "../_generated/server";
import { contactSupportInfo } from "../schema";

export const saveContactSupportInfo = mutation({
  args: contactSupportInfo,
  handler: async (ctx, args) => {
    ctx.db.insert("contactSupportInfo", args);
  },
});
