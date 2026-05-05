"use client";

import { useEffect, useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useStore } from "@/store/useStore";
import { Button } from "@/components/ui/Button";
import { Play, Pause, RotateCcw, X, Timer } from "lucide-react";
import { formatTime } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface PomodoroTimerProps {
  roomId: string;
  userId: string;
}

const FOCUS_DURATION = 25 * 60; // 25 minutes
const BREAK_DURATION = 5 * 60; // 5 minutes

export function PomodoroTimer({ roomId, userId }: PomodoroTimerProps) {
  const { isFocusMode, setIsFocusMode, theme } = useStore();
  const [now, setNow] = useState(Date.now());

  const room = useQuery(api.rooms.getWithParticipants, { roomId: roomId as Id<"rooms"> });
  const updatePomodoro = useMutation(api.rooms.updatePomodoro);

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  const playNotificationSound = () => {
    const audio = new Audio("/notification.mp3");
    audio.play().catch(() => {});
  };

  const state = room?.pomodoroState ?? {
    isRunning: false,
    isFocusMode: true,
    timeRemaining: FOCUS_DURATION,
    totalDuration: FOCUS_DURATION,
  };

  const elapsed = state.isRunning && state.startedAt ? Math.floor((now - state.startedAt) / 1000) : 0;
  const localTime = Math.max(0, state.timeRemaining - elapsed);
  const isRunning = state.isRunning;
  const isBreak = !state.isFocusMode;
  const totalDuration = state.totalDuration || (isBreak ? BREAK_DURATION : FOCUS_DURATION);

  useEffect(() => {
    if (!isRunning || localTime > 0 || !room) return;
    const rollForward = async () => {
      playNotificationSound();
      const nextIsBreak = !isBreak;
      const duration = nextIsBreak ? BREAK_DURATION : FOCUS_DURATION;
      await updatePomodoro({
        roomId: roomId as Id<"rooms">,
        actorUserId: userId as Id<"users">,
        pomodoroState: {
          isRunning: false,
          isFocusMode: !nextIsBreak,
          timeRemaining: duration,
          totalDuration: duration,
        },
      });
    };
    void rollForward();
  }, [isRunning, localTime, room, isBreak, roomId, updatePomodoro]);

  const handleStart = async () => {
    const newState = {
      isRunning: true,
      isFocusMode: !isBreak,
      timeRemaining: localTime,
      totalDuration: isBreak ? BREAK_DURATION : FOCUS_DURATION,
      startedAt: Date.now(),
    };
    await updatePomodoro({ roomId: roomId as Id<"rooms">, actorUserId: userId as Id<"users">, pomodoroState: newState });
  };

  const handlePause = async () => {
    const newState = {
      isRunning: false,
      isFocusMode: !isBreak,
      timeRemaining: localTime,
      totalDuration: isBreak ? BREAK_DURATION : FOCUS_DURATION,
      pausedAt: Date.now(),
    };
    await updatePomodoro({ roomId: roomId as Id<"rooms">, actorUserId: userId as Id<"users">, pomodoroState: newState });
  };

  const handleReset = async () => {
    const duration = isBreak ? BREAK_DURATION : FOCUS_DURATION;
    const newState = {
      isRunning: false,
      isFocusMode: !isBreak,
      timeRemaining: duration,
      totalDuration: duration,
    };
    await updatePomodoro({ roomId: roomId as Id<"rooms">, actorUserId: userId as Id<"users">, pomodoroState: newState });
  };

  const handleToggleMode = async () => {
    const newIsBreak = !isBreak;
    const duration = newIsBreak ? BREAK_DURATION : FOCUS_DURATION;
    const newState = {
      isRunning: false,
      isFocusMode: !newIsBreak,
      timeRemaining: duration,
      totalDuration: duration,
    };
    await updatePomodoro({ roomId: roomId as Id<"rooms">, actorUserId: userId as Id<"users">, pomodoroState: newState });
  };
  const progress = ((totalDuration - localTime) / totalDuration) * 100;

  return (
    <>
      {!isFocusMode && (
        <div className="absolute top-4 right-4 z-10">
          <button
            onClick={() => setIsFocusMode(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all"
          >
            <Timer className="w-4 h-4 text-gray-900 dark:text-white" />
            <span className="text-xs font-semibold font-mono text-gray-900 dark:text-white">
              {formatTime(localTime)}
            </span>
            {isRunning && (
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            )}
          </button>
        </div>
      )}

      <AnimatePresence>
        {isFocusMode && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={`absolute inset-0 z-50 flex flex-col items-center justify-center ${
              theme === "dark" ? "bg-gray-950" : "bg-gray-50"
            }`}
          >
            <button
              onClick={() => setIsFocusMode(false)}
              className="absolute top-6 right-6 w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 flex items-center justify-center transition-all"
            >
              <X className="w-6 h-6 text-gray-900 dark:text-white" />
            </button>

            <div className="text-center">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="mb-8"
              >
                <span
                  className={`text-[120px] sm:text-[180px] font-semibold tabular-nums tracking-tighter ${
                    isBreak ? "text-orange-500" : "text-gray-900 dark:text-white"
                  }`}
                >
                  {formatTime(localTime)}
                </span>
              </motion.div>

              <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
                {isBreak ? "Break time" : "Stay focused"}
              </p>

              <div className="w-80 h-2 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden mb-8 mx-auto">
                <motion.div
                  className={`h-full ${isBreak ? "bg-orange-500" : "bg-gray-900 dark:bg-white"}`}
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 1 }}
                />
              </div>

              <div className="flex items-center justify-center gap-4">
                {isRunning ? (
                  <Button
                    variant="secondary"
                    size="lg"
                    onClick={handlePause}
                    className="gap-2"
                  >
                    <Pause className="w-5 h-5" />
                    Pause
                  </Button>
                ) : (
                  <Button
                    size="lg"
                    onClick={handleStart}
                    className="gap-2"
                  >
                    <Play className="w-5 h-5" />
                    Start
                  </Button>
                )}

                <Button
                  variant="ghost"
                  size="lg"
                  onClick={handleReset}
                  className="gap-2"
                >
                  <RotateCcw className="w-5 h-5" />
                  Reset
                </Button>
              </div>

              <div className="mt-8">
                <button
                  onClick={handleToggleMode}
                  className="text-sm text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white underline"
                >
                  Switch to {isBreak ? "focus mode" : "break mode"}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
