import { query } from "../_generated/server";

export const latest = query({
  args: {},
  handler: async () => {
    return "1.15.0";
  },
});
