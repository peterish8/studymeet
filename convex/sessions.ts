import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { Id } from "./_generated/dataModel";

async function ensureMember(
  ctx: any,
  roomId: Id<"rooms">,
  actorUserId: Id<"users">
) {
  const user = await ctx.db.get(actorUserId);
  if (!user || user.roomId !== roomId || user.leftAt) {
    throw new Error("Unauthorized room access");
  }
  return user;
}

export const finalizeRoomSession = mutation({
  args: {
    roomId: v.id("rooms"),
    actorUserId: v.id("users"),
  },
  handler: async (ctx, args) => {
    await ensureMember(ctx, args.roomId, args.actorUserId);

    const room = await ctx.db.get(args.roomId);
    if (!room) throw new Error("Room not found");
    if (room.finalizedAt) return null;

    const users = await ctx.db
      .query("users")
      .withIndex("by_room", (q) => q.eq("roomId", args.roomId))
      .collect();
    const todos = await ctx.db
      .query("todos")
      .withIndex("by_room", (q) => q.eq("roomId", args.roomId))
      .collect();
    const aha = await ctx.db
      .query("ahaMoments")
      .withIndex("by_room", (q) => q.eq("roomId", args.roomId))
      .collect();
    const notes = await ctx.db
      .query("sessionNotes")
      .withIndex("by_room", (q) => q.eq("roomId", args.roomId))
      .collect();

    const endedAt = room.endedAt ?? Date.now();
    const durationSec = Math.max(0, Math.floor((endedAt - room.createdAt) / 1000));
    const participantIds = users.map((u) => u._id);
    const participantAccountIds = users
      .map((u) => u.accountId)
      .filter((x): x is string => Boolean(x));

    const sessionId = await ctx.db.insert("studySessions", {
      roomId: args.roomId,
      roomCode: room.code,
      roomName: room.name,
      startedAt: room.createdAt,
      endedAt,
      durationSec,
      participantIds,
      participantAccountIds,
      ahaCount: aha.length,
      todosCompleted: todos.filter((t) => t.isCompleted).length,
      todosTotal: todos.length,
      pomodoroRounds: 0,
      notesUpdatedCount: notes.length,
    });

    for (const u of users) {
      const mine = todos.filter((t) => t.userId?.toString() === u._id.toString());
      await ctx.db.insert("studySessionParticipants", {
        sessionId,
        userId: u._id,
        accountId: u.accountId,
        name: u.name,
        joinedAt: u.joinedAt,
        leftAt: u.leftAt,
        todoTotal: mine.length,
        todoCompleted: mine.filter((t) => t.isCompleted).length,
      });
    }

    await ctx.db.patch(args.roomId, { finalizedAt: Date.now() });
    return sessionId;
  },
});

export const listForAccount = query({
  args: {
    accountId: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const participantRows = await ctx.db
      .query("studySessionParticipants")
      .withIndex("by_account_id", (q) => q.eq("accountId", args.accountId))
      .collect();

    const uniqueSessionIds = Array.from(new Set(participantRows.map((x) => x.sessionId.toString())));
    const sessions = [];
    for (const id of uniqueSessionIds) {
      const session = await ctx.db.get(id as Id<"studySessions">);
      if (session) sessions.push(session);
    }
    sessions.sort((a, b) => b.endedAt - a.endedAt);
    return sessions.slice(0, args.limit ?? 20);
  },
});

export const getDetail = query({
  args: {
    sessionId: v.id("studySessions"),
    accountId: v.string(),
  },
  handler: async (ctx, args) => {
    const session = await ctx.db.get(args.sessionId);
    if (!session || !session.participantAccountIds.includes(args.accountId)) {
      throw new Error("Session not found");
    }
    const participants = await ctx.db
      .query("studySessionParticipants")
      .withIndex("by_session", (q) => q.eq("sessionId", args.sessionId))
      .collect();
    return { session, participants };
  },
});
