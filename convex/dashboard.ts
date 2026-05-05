import { query } from "./_generated/server";
import { v } from "convex/values";

export const getOverview = query({
  args: { accountId: v.string() },
  handler: async (ctx, args) => {
    const participantRows = await ctx.db
      .query("studySessionParticipants")
      .withIndex("by_account_id", (q) => q.eq("accountId", args.accountId))
      .collect();

    const sessionIds = Array.from(new Set(participantRows.map((x) => x.sessionId.toString())));
    const sessions: {
      _id: Id<"studySessions">;
      endedAt: number;
      durationSec: number;
      [key: string]: any;
    }[] = [];
    for (const id of sessionIds) {
      const s = await ctx.db.get(id as Id<"studySessions">);
      if (s) sessions.push(s);
    }

    const totalSessions = sessions.length;
    const totalFocusSec = sessions.reduce((a, s) => a + s.durationSec, 0);
    const todosDone = participantRows.reduce((a, p) => a + p.todoCompleted, 0);
    const todosTotal = participantRows.reduce((a, p) => a + p.todoTotal, 0);
    const completionRate = todosTotal > 0 ? (todosDone / todosTotal) * 100 : 0;

    sessions.sort((a, b) => b.endedAt - a.endedAt);
    return {
      totalSessions,
      totalFocusSec,
      todosDone,
      todosTotal,
      completionRate,
      recentSessions: sessions.slice(0, 10),
    };
  },
});
import { Id } from "./_generated/dataModel";
