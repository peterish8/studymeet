import { query } from "./_generated/server";
import { v } from "convex/values";

export const getMe = query({
  args: { accountId: v.optional(v.string()) },
  handler: async (ctx, args) => {
    if (!args.accountId) return null;
    return await ctx.db
      .query("profiles")
      .withIndex("by_account_id", (q) => q.eq("accountId", args.accountId!))
      .unique();
  },
});

