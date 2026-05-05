"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useStore } from "@/store/useStore";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { getAccountIdFromStorage } from "@/lib/auth";
import { Clock3, Plus, ArrowRightLeft, LayoutDashboard, Users, Video } from "lucide-react";

export default function AppDashboardPage() {
  const router = useRouter();
  const { theme, userName, setUserName, accountId, setAccountId } = useStore();
  const [nameInput, setNameInput] = useState(userName);
  const [roomName, setRoomName] = useState("");
  const [roomCode, setRoomCode] = useState("");
  const [error, setError] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [isJoining, setIsJoining] = useState(false);

  const createRoom = useMutation(api.rooms.create);
  const joinRoom = useMutation(api.rooms.join);

  useEffect(() => {
    if (!accountId) {
      const stored = getAccountIdFromStorage();
      if (stored) setAccountId(stored);
    }
  }, [accountId, setAccountId]);

  const handleCreate = async () => {
    if (!nameInput.trim()) {
      setError("Enter your name first");
      return;
    }
    setError("");
    setIsCreating(true);
    try {
      const result = await createRoom({
        creatorName: nameInput.trim(),
        roomName: roomName.trim() || undefined,
        theme,
        accountId: accountId ?? undefined,
      });
      setUserName(nameInput.trim());
      router.push(`/room/${result.roomId}?userId=${result.userId}`);
    } catch {
      setError("Unable to create room right now.");
    } finally {
      setIsCreating(false);
    }
  };

  const handleJoin = async () => {
    if (!nameInput.trim()) {
      setError("Enter your name first");
      return;
    }
    if (roomCode.trim().length !== 6) {
      setError("Room code must be 6 characters.");
      return;
    }
    setError("");
    setIsJoining(true);
    try {
      const result = await joinRoom({
        userName: nameInput.trim(),
        code: roomCode.trim().toUpperCase(),
        theme,
        accountId: accountId ?? undefined,
      });
      setUserName(nameInput.trim());
      router.push(`/room/${result.roomId}?userId=${result.userId}`);
    } catch (err: any) {
      setError(err?.message || "Unable to join room.");
    } finally {
      setIsJoining(false);
    }
  };

  return (
    <main className={theme === "dark" ? "dark" : ""}>
      <div className="min-h-screen bg-canvas px-5 py-6 text-ink dark:bg-cursor-bg dark:text-ink-dark-primary">
        <div className="mx-auto max-w-7xl">
          <header className="mb-6 flex items-center justify-between rounded-xl border border-divider-hairline bg-white px-5 py-4 shadow-soft dark:border-cursor-border dark:bg-cursor-surface">
            <div>
              <p className="text-caption text-ink-muted dark:text-ink-dark-tertiary">Welcome back</p>
              <h1 className="font-display text-display-md">Study Dashboard</h1>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={() => router.push("/rooms")}>
                Rooms
              </Button>
              <Button variant="ghost" size="sm" onClick={() => router.push("/dashboard")}>
                Dashboard
              </Button>
              {!accountId && (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() =>
                    router.push(
                      `/auth/callback?accountId=${encodeURIComponent(`acct_${Date.now()}`)}&name=${encodeURIComponent(
                        nameInput.trim() || "Student"
                      )}`
                    )
                  }
                >
                  Sign in
                </Button>
              )}
              <ThemeToggle />
            </div>
          </header>

          <div className="grid gap-4 lg:grid-cols-12">
            <section className="rounded-xl border border-divider-hairline bg-white p-5 shadow-soft dark:border-cursor-border dark:bg-cursor-surface lg:col-span-5">
              <div className="mb-4 flex items-center gap-2">
                <LayoutDashboard className="h-5 w-5 text-primary" />
                <h2 className="text-body-strong">Create a study room</h2>
              </div>
              <div className="space-y-3">
                <Input value={nameInput} onChange={(e) => setNameInput(e.target.value)} label="Your name" isPill={false} />
                <Input value={roomName} onChange={(e) => setRoomName(e.target.value)} label="Session name (optional)" isPill={false} />
                <Button className="h-11 w-full gap-2 rounded-lg font-semibold" onClick={handleCreate} disabled={isCreating}>
                  <Plus className="h-4 w-4" />
                  {isCreating ? "Creating..." : "Create room"}
                </Button>
              </div>
            </section>

            <section className="rounded-xl border border-divider-hairline bg-white p-5 shadow-soft dark:border-cursor-border dark:bg-cursor-surface lg:col-span-4">
              <div className="mb-4 flex items-center gap-2">
                <ArrowRightLeft className="h-5 w-5 text-primary" />
                <h2 className="text-body-strong">Join with code</h2>
              </div>
              <div className="space-y-3">
                <Input value={roomCode} onChange={(e) => setRoomCode(e.target.value)} label="Room code" maxLength={6} className="font-mono uppercase tracking-widest" isPill={false} />
                <Button variant="secondary" className="h-11 w-full rounded-lg font-semibold" onClick={handleJoin} disabled={isJoining}>
                  {isJoining ? "Joining..." : "Join now"}
                </Button>
                {error ? <p className="text-caption text-accent-red">{error}</p> : null}
              </div>
            </section>

            <section className="rounded-xl border border-divider-hairline bg-white p-5 shadow-soft dark:border-cursor-border dark:bg-cursor-surface lg:col-span-3">
              <h2 className="mb-4 text-body-strong">Quick stats</h2>
              <div className="space-y-3">
                <div className="rounded-lg bg-surface-muted p-3 dark:bg-cursor-elevated">
                  <p className="text-caption text-ink-muted dark:text-ink-dark-tertiary">Session mode</p>
                  <p className="mt-1 text-body-strong">1-on-1 private rooms</p>
                </div>
                <div className="rounded-lg bg-surface-muted p-3 dark:bg-cursor-elevated">
                  <p className="text-caption text-ink-muted dark:text-ink-dark-tertiary">Realtime stack</p>
                  <p className="mt-1 text-body-strong">Convex + WebRTC</p>
                </div>
              </div>
            </section>
          </div>

          <section className="mt-4 grid gap-4 md:grid-cols-3">
            {[
              { icon: Video, title: "Call", copy: "Instant video and voice controls" },
              { icon: Clock3, title: "Focus", copy: "Synced pomodoro with fullscreen mode" },
              { icon: Users, title: "Accountability", copy: "Shared tasks, notes, and summary" },
            ].map((item) => (
              <div key={item.title} className="rounded-xl border border-divider-hairline bg-white p-5 shadow-soft dark:border-cursor-border dark:bg-cursor-surface">
                <item.icon className="h-5 w-5 text-primary" />
                <h3 className="mt-3 text-body-strong">{item.title}</h3>
                <p className="mt-1 text-caption text-ink-muted dark:text-ink-dark-secondary">{item.copy}</p>
              </div>
            ))}
          </section>
        </div>
      </div>
    </main>
  );
}
