// import { query } from "../_generated/server";
//
// export const ffs = query({
//   args: {},
//   handler: async (ctx) => {
//     const featureFlags = await ctx.db.query("featureFlags").order("desc").take(100);
//     type FeatureFlagName = (typeof featureFlags)[number]["name"];
//     return Object.fromEntries(featureFlags.map((ff) => [ff.name, ff.enabled])) as Record<
//       FeatureFlagName,
//       boolean
//     >;
//   },
// });
