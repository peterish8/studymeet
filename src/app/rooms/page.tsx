"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useStore } from "@/store/useStore";
import { getAccountIdFromStorage } from "@/lib/auth";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { Users, DoorOpen } from "lucide-react";

export default function RoomsPage() {
  const router = useRouter();
  const { theme, userName, setUserName, accountId } = useStore();
  const [nameInput, setNameInput] = useState(userName);
  const [error, setError] = useState("");
  const joinRoom = useMutation(api.rooms.join);
  const rooms = useQuery((api as any).rooms.getOpenRooms, {}) as any[] | undefined;

  const joinByCode = async (code: string) => {
    if (!nameInput.trim()) {
      setError("Please enter your name first.");
      return;
    }
    try {
      const result = await joinRoom({
        code,
        userName: nameInput.trim(),
        theme,
        accountId: accountId ?? getAccountIdFromStorage() ?? undefined,
      });
      setUserName(nameInput.trim());
      router.push(`/room/${result.roomId}?userId=${result.userId}`);
    } catch (err: any) {
      setError(err?.message || "Unable to join room.");
    }
  };

  return (
    <main className={theme === "dark" ? "dark" : ""}>
      <div className="min-h-screen bg-canvas px-5 py-6 text-ink dark:bg-cursor-bg dark:text-ink-dark-primary">
        <div className="mx-auto max-w-7xl">
          <header className="mb-6 flex items-center justify-between rounded-xl border border-divider-hairline bg-white px-5 py-4 shadow-soft dark:border-cursor-border dark:bg-cursor-surface">
            <div>
              <h1 className="font-display text-display-md">Rooms</h1>
              <p className="text-caption text-ink-muted dark:text-ink-dark-secondary">Join available sessions or head back to dashboard.</p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={() => router.push("/app")}>
                Dashboard
              </Button>
              <ThemeToggle />
            </div>
          </header>

          <section className="mb-4 rounded-xl border border-divider-hairline bg-white p-5 shadow-soft dark:border-cursor-border dark:bg-cursor-surface">
            <Input label="Your name" value={nameInput} onChange={(e) => setNameInput(e.target.value)} isPill={false} />
            {error ? <p className="mt-2 text-caption text-accent-red">{error}</p> : null}
          </section>

          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {rooms?.length ? (
              rooms.map((room) => (
                <article key={room._id} className="rounded-xl border border-divider-hairline bg-white p-5 shadow-soft dark:border-cursor-border dark:bg-cursor-surface">
                  <div className="mb-4 flex items-start justify-between">
                    <div>
                      <h3 className="text-body-strong">{room.name || "Untitled study room"}</h3>
                      <p className="mt-1 font-mono text-caption tracking-widest text-primary">{room.code}</p>
                    </div>
                    <span className="rounded-pill bg-primary/10 px-3 py-1 text-caption-strong text-primary">Waiting</span>
                  </div>
                  <div className="mb-4 flex items-center gap-2 text-caption text-ink-muted dark:text-ink-dark-secondary">
                    <Users className="h-4 w-4" />
                    {room.activeCount}/2 participants
                  </div>
                  <Button className="w-full gap-2" onClick={() => joinByCode(room.code)}>
                    <DoorOpen className="h-4 w-4" />
                    Join room
                  </Button>
                </article>
              ))
            ) : (
              <div className="rounded-xl border border-divider-hairline bg-white p-6 text-caption text-ink-muted shadow-soft dark:border-cursor-border dark:bg-cursor-surface dark:text-ink-dark-secondary">
                No open rooms right now. Create one from dashboard.
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
