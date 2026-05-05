import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

// Get todos for room
export const getTodos = query({
  args: { roomId: v.id("rooms") },
  handler: async (ctx, args) => {
    const todos = await ctx.db
      .query("todos")
      .withIndex("by_room", (q) => q.eq("roomId", args.roomId))
      .collect();

    return todos;
  },
});

// Add todo
export const add = mutation({
  args: {
    roomId: v.id("rooms"),
    text: v.string(),
    userId: v.optional(v.id("users")), // null = shared
    actorUserId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const actor = await ctx.db.get(args.actorUserId);
    if (!actor || actor.roomId !== args.roomId || actor.leftAt) throw new Error("Unauthorized");
    if (args.userId && args.userId !== args.actorUserId) throw new Error("Cannot create todo for another user");
    await ctx.db.insert("todos", {
      roomId: args.roomId,
      userId: args.userId,
      text: args.text,
      isCompleted: false,
      createdAt: Date.now(),
    });
  },
});

// Toggle todo completion
export const toggleComplete = mutation({
  args: {
    todoId: v.id("todos"),
    actorUserId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const todo = await ctx.db.get(args.todoId);
    if (!todo) return;
    const actor = await ctx.db.get(args.actorUserId);
    if (!actor || actor.roomId !== todo.roomId || actor.leftAt) throw new Error("Unauthorized");
    if (todo.userId && todo.userId !== args.actorUserId) throw new Error("Unauthorized todo edit");

    await ctx.db.patch(args.todoId, {
      isCompleted: !todo.isCompleted,
      completedAt: !todo.isCompleted ? Date.now() : undefined,
    });
  },
});

// Get completion stats
export const getStats = query({
  args: { roomId: v.id("rooms") },
  handler: async (ctx, args) => {
    const todos = await ctx.db
      .query("todos")
      .withIndex("by_room", (q) => q.eq("roomId", args.roomId))
      .collect();

    const users = await ctx.db
      .query("users")
      .withIndex("by_room", (q) => q.eq("roomId", args.roomId))
      .collect();

    const stats: Record<string, { total: number; completed: number; name: string }> = {};

    // Initialize stats for all users
    for (const user of users) {
      stats[user._id.toString()] = { total: 0, completed: 0, name: user.name };
    }
    stats["shared"] = { total: 0, completed: 0, name: "Shared" };

    // Count todos
    for (const todo of todos) {
      const key = todo.userId?.toString() || "shared";
      stats[key].total++;
      if (todo.isCompleted) {
        stats[key].completed++;
      }
    }

    return stats;
  },
});
