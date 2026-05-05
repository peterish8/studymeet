"use client";

import { useEffect, useState, useRef } from "react";
import { useSearchParams, useParams, useRouter } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useStore } from "@/store/useStore";
import { Whiteboard } from "@/components/Whiteboard";
import { VideoCall } from "@/components/VideoCall";
import { PomodoroTimer } from "@/components/PomodoroTimer";
import { Sidebar } from "@/components/Sidebar";
import { AhaButton } from "@/components/AhaButton";
import { SessionSummary } from "@/components/SessionSummary";
import { FloatingTodos } from "@/components/FloatingTodos";
import { FloatingNotes } from "@/components/FloatingNotes";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { Button } from "@/components/ui/Button";
import { formatTime } from "@/lib/utils";
import { Sparkles, Menu, X, DoorOpen, Focus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function RoomPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const roomId = params.id as string;
  const userId = searchParams.get("userId");
  const whiteboardContainerRef = useRef<HTMLDivElement>(null);

  const { theme, isSidebarOpen, setIsSidebarOpen, isFocusLock, toggleFocusLock } = useStore();
  const [showSummary, setShowSummary] = useState(false);
  const [sessionStartTime] = useState(Date.now());
  const [tick, setTick] = useState(0);
  const [codeCopied, setCodeCopied] = useState(false);

  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, []);

  const room = useQuery(api.rooms.getWithParticipants, { roomId: roomId as Id<"rooms"> });
  const user = useQuery(api.users.get, userId ? { userId: userId as Id<"users"> } : "skip");
  const otherUser = room?.participants?.find((p: any) => p._id !== userId);

  const leaveRoom = useMutation(api.rooms.leave);
  const updateTheme = useMutation(api.users.updateTheme);
  const addReaction = useMutation(api.reactions.add);
  const finalizeRoomSession = useMutation(api.sessions.finalizeRoomSession);
  const recentReactions = useQuery(api.reactions.getRecent, { roomId: roomId as Id<"rooms"> });

  const handleReaction = async (emoji: string) => {
    if (!userId || !user) return;
    await addReaction({
      roomId: roomId as Id<"rooms">,
      userId: userId as Id<"users">,
      actorUserId: userId as Id<"users">,
      userName: user.name,
      emoji,
    });
  };

  // Sync theme with user preference
  useEffect(() => {
    if (userId && theme) {
      updateTheme({ actorUserId: userId as Id<"users">, userId: userId as Id<"users">, theme });
    }
  }, [theme, userId, updateTheme]);

  // Handle leave
  const handleLeave = async () => {
    if (userId && roomId) {
      await leaveRoom({ roomId: roomId as Id<"rooms">, userId: userId as Id<"users"> });
      await finalizeRoomSession({ roomId: roomId as Id<"rooms">, actorUserId: userId as Id<"users"> });
      setShowSummary(true);
    }
  };

  if (!room || !user) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${theme === "dark" ? "dark bg-gray-950" : "bg-gray-50"}`}>
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-gray-900 border-t-transparent rounded-full animate-spin dark:border-white" />
          <p className="text-sm text-gray-600 dark:text-gray-400">Loading your room...</p>
        </div>
      </div>
    );
  }

  const copyCode = () => {
    navigator.clipboard.writeText(room?.code ?? "");
    setCodeCopied(true);
    setTimeout(() => setCodeCopied(false), 2000);
  };

  return (
    <div className={`min-h-screen flex flex-col ${theme === "dark" ? "dark bg-gray-950" : "bg-gray-50"} transition-colors duration-300`}>
      <nav className="z-50 flex h-14 items-center justify-between border-b border-gray-200 bg-white px-4 backdrop-blur-xl dark:border-gray-800 dark:bg-gray-900">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded bg-gray-900 dark:bg-white">
            <Sparkles className="w-4 h-4 text-white dark:text-gray-900" />
          </div>
          <div>
            <h1 className="text-sm font-semibold text-gray-900 dark:text-white">
              {room.name || "Study Session"}
            </h1>
            <div className="flex items-center gap-2">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Code: {room.code}
              </p>
              <button
                onClick={copyCode}
                className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                {codeCopied ? "Copied!" : "Copy"}
              </button>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant={isFocusLock ? "primary" : "ghost"}
            size="sm"
            onClick={toggleFocusLock}
            className="gap-2"
            isPill={false}
          >
            <Focus className="w-4 h-4" />
            {!isFocusLock && <span className="hidden sm:inline">Focus</span>}
          </Button>

          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-800">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            <span className="text-xs font-medium text-gray-700 dark:text-gray-300 font-mono">
              {formatTime(tick)}
            </span>
          </div>

          <ThemeToggle size="sm" />

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            isPill={false}
          >
            {isSidebarOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </Button>

          <Button variant="ghost" size="sm" onClick={handleLeave} className="text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400" isPill={false}>
            <DoorOpen className="w-4 h-4" />
          </Button>
        </div>
      </nav>

      <div className="flex-1 flex overflow-hidden">
        <main className="flex-1 relative flex flex-col transition-all duration-300">
          <div ref={whiteboardContainerRef} className="flex-1 relative bg-white dark:bg-gray-900">
            <Whiteboard roomId={roomId} userId={userId || ""} />
            <PomodoroTimer roomId={roomId} userId={userId || ""} />
            
            {/* Floating Sticky Notes - Click anywhere to add */}
            {room?.status === "active" && (
              <FloatingNotes 
                roomId={roomId} 
                userId={userId || ""} 
                userName={user.name}
                containerRef={whiteboardContainerRef}
              />
            )}
          </div>

          {/* Floating Reactions */}
          <AnimatePresence>
            {recentReactions?.slice(-5).map((r: any) => (
              <motion.div
                key={r._id}
                initial={{ opacity: 1, y: 0, x: "50vw" }}
                animate={{ opacity: 0, y: -120 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 2 }}
                className="absolute bottom-20 pointer-events-none text-3xl z-20"
              >
                {r.emoji}
              </motion.div>
            ))}
          </AnimatePresence>

          {!isFocusLock && (
            <>
              <VideoCall roomId={roomId} userId={userId || ""} otherUserId={otherUser?._id} />
              <div className="pointer-events-none fixed bottom-5 left-1/2 z-20 flex -translate-x-1/2 items-center gap-3 rounded-full border border-gray-200 bg-white/90 px-6 py-3 shadow-lg backdrop-blur-xl dark:border-gray-700 dark:bg-gray-900/90">
                <div className="pointer-events-auto">
                  <AhaButton roomId={roomId} userId={userId || ""} userName={user.name} />
                </div>
                <div className="h-6 w-px bg-gray-200 dark:bg-gray-700" />
                {["👍", "💡", "😵", "🔥"].map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => handleReaction(emoji)}
                    className="pointer-events-auto flex h-10 w-10 items-center justify-center rounded-full text-lg transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </>
          )}
        </main>

        <AnimatePresence>
          {isSidebarOpen && (
            <motion.aside
              initial={{ x: 320 }}
              animate={{ x: 0 }}
              exit={{ x: 320 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="fixed right-0 top-14 bottom-0 w-80 bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-800 overflow-y-auto z-40 lg:static lg:top-auto lg:bottom-auto lg:flex-shrink-0"
            >
              <Sidebar roomId={roomId} userId={userId || ""} user={user} otherUser={otherUser} />
            </motion.aside>
          )}
        </AnimatePresence>
      </div>

      {/* Session Summary Modal */}
      {showSummary && (
        <SessionSummary
          roomId={roomId}
          sessionStartTime={sessionStartTime}
          onClose={() => router.push("/")}
        />
      )}

      {/* Floating Todos Widget - Draggable */}
      {room?.status === "active" && userId && (
        <FloatingTodos
          roomId={roomId}
          userId={userId}
          userName={user.name}
        />
      )}
    </div>
  );
}
