import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const upsertProfileFromGoogle = mutation({
  args: {
    accountId: v.string(),
    email: v.optional(v.string()),
    name: v.string(),
    avatarUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const existing = await ctx.db
      .query("profiles")
      .withIndex("by_account_id", (q) => q.eq("accountId", args.accountId))
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, {
        email: args.email,
        name: args.name,
        avatarUrl: args.avatarUrl,
        updatedAt: now,
      });
      return existing._id;
    }

    return await ctx.db.insert("profiles", {
      accountId: args.accountId,
      email: args.email,
      name: args.name,
      avatarUrl: args.avatarUrl,
      createdAt: now,
      updatedAt: now,
    });
  },
});

