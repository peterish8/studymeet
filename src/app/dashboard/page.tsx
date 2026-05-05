"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useStore } from "@/store/useStore";
import { getAccountIdFromStorage } from "@/lib/auth";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { formatDuration } from "@/lib/utils";

export default function DashboardPage() {
  const router = useRouter();
  const { accountId, setAccountId } = useStore();

  useEffect(() => {
    if (!accountId) {
      const stored = getAccountIdFromStorage();
      if (stored) setAccountId(stored);
    }
  }, [accountId, setAccountId]);

  const effectiveAccountId = accountId ?? getAccountIdFromStorage();
  const profile = useQuery(api.profiles.getMe, { accountId: effectiveAccountId ?? undefined });
  const overview = useQuery(
    api.dashboard.getOverview,
    effectiveAccountId ? { accountId: effectiveAccountId } : "skip"
  );

  if (!effectiveAccountId) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-canvas px-4">
        <div className="rounded-xl border border-divider-hairline bg-white p-6 text-center">
          <h1 className="text-display-md mb-2">Sign in to access dashboard</h1>
          <p className="text-caption text-ink-muted mb-4">
            You can still use rooms as guest from the app screen.
          </p>
          <button onClick={() => router.push("/app")} className="rounded-lg bg-primary px-4 py-2 text-white">
            Go to app
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-canvas px-5 py-6">
      <div className="mx-auto max-w-6xl">
        <header className="mb-6 flex items-center justify-between rounded-xl border border-divider-hairline bg-white p-5">
          <div>
            <p className="text-caption text-ink-muted">Signed in as</p>
            <h1 className="text-display-md">{profile?.name ?? "Student"} Dashboard</h1>
          </div>
          <div className="flex items-center gap-2">
            <button className="rounded-lg border px-3 py-2 text-caption" onClick={() => router.push("/app")}>
              App
            </button>
            <ThemeToggle />
          </div>
        </header>

        <section className="grid gap-4 md:grid-cols-4">
          <Card title="Sessions" value={overview?.totalSessions ?? 0} />
          <Card title="Focus Time" value={`${Math.floor((overview?.totalFocusSec ?? 0) / 3600)}h`} />
          <Card title="Todos Done" value={overview?.todosDone ?? 0} />
          <Card title="Completion" value={`${Math.round(overview?.completionRate ?? 0)}%`} />
        </section>

        <section className="mt-6 rounded-xl border border-divider-hairline bg-white p-5">
          <h2 className="text-body-strong mb-4">Recent sessions</h2>
          <div className="space-y-3">
            {overview?.recentSessions?.length ? (
              overview.recentSessions.map((s) => (
                <div key={s._id} className="rounded-lg border border-divider-hairline p-3">
                  <p className="text-body-strong">{s.roomName || "Untitled session"}</p>
                  <p className="text-caption text-ink-muted">
                    {new Date(s.endedAt).toLocaleString()} · {s.todosCompleted}/{s.todosTotal} todos
                  </p>
                  <p className="text-caption text-ink-muted">
                    Duration: {formatDuration(s.startedAt, s.endedAt)}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-caption text-ink-muted">No completed sessions yet.</p>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}

function Card({ title, value }: { title: string; value: string | number }) {
  return (
    <article className="rounded-xl border border-divider-hairline bg-white p-5">
      <p className="text-caption text-ink-muted">{title}</p>
      <p className="text-display-md mt-1">{value}</p>
    </article>
  );
}

