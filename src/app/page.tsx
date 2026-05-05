"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { AnimatePresence, motion, useReducedMotion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useRouter } from "next/navigation";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import {
  ArrowRight, Video, Pencil, Clock, CheckCircle2, Timer, Check, Users,
  Mic, PhoneOff, VideoOff, Play, Pause, RotateCcw, Zap, PictureInPicture2,
  FileText, Lightbulb, Lock, BarChart3, Copy, CheckCheck, Github,
} from "lucide-react";

/* ─── Float wrapper ───────────────────────────────────────────────── */
function Float({ children, y = 8, duration = 4.5, delay = 0 }: {
  children: React.ReactNode; y?: number; duration?: number; delay?: number;
}) {
  return (
    <motion.div
      animate={{ y: [0, -y, 0] }}
      transition={{ duration, delay, repeat: Infinity, ease: "easeInOut" }}
    >
      {children}
    </motion.div>
  );
}

/* ─── Tilt-on-hover wrapper — spring physics ─────────────────────── */
function TiltCard({ children, className }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const rotX = useMotionValue(0);
  const rotY = useMotionValue(0);

  const springCfg = { stiffness: 260, damping: 22, mass: 0.6 };
  const springX = useSpring(rotX, springCfg);
  const springY = useSpring(rotY, springCfg);
  const boxShadow = useTransform(
    [springX, springY],
    ([rx, ry]: number[]) => {
      const dist = Math.sqrt(rx * rx + ry * ry);
      const t = Math.min(dist / 16, 1);
      return `0 ${8 + t * 24}px ${24 + t * 40}px rgba(59,130,246,${0.06 + t * 0.14}), 0 4px 12px rgba(0,0,0,${0.05 + t * 0.07})`;
    }
  );

  const onMove = useCallback((e: React.MouseEvent) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    rotX.set(y * 16);
    rotY.set(-x * 16);
  }, [rotX, rotY]);

  const onLeave = useCallback(() => {
    rotX.set(0);
    rotY.set(0);
  }, [rotX, rotY]);

  return (
    <motion.div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      className={className}
      style={{
        rotateX: springX,
        rotateY: springY,
        transformPerspective: 900,
        transformStyle: "preserve-3d",
        boxShadow,
      }}
    >
      {children}
    </motion.div>
  );
}

/* ─── HOW IT WORKS: mini preview widgets ─────────────────────────── */
function RoomCodeWidget() {
  const code = ["4", "7", "2", "8", "9", "1"];
  const [active, setActive] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setActive(a => (a + 1) % 6), 1200);
    return () => clearInterval(t);
  }, []);
  return (
    <div className="space-y-3 pt-1">
      <p className="font-mono text-[9px] uppercase tracking-[0.22em] text-[#9ca3af]">Your room code</p>
      <div className="flex items-center gap-1.5">
        {code.map((d, i) => (
          <motion.div key={i}
            animate={{
              borderColor: active === i ? "#3b82f6" : "rgba(219,234,254,0.9)",
              backgroundColor: active === i ? "#eff6ff" : "#fafcff",
              scale: active === i ? 1.08 : 1,
              color: active === i ? "#1d4ed8" : "#374151",
            }}
            transition={{ duration: 0.25 }}
            className="flex h-9 w-9 items-center justify-center rounded-[8px] border font-mono text-[15px] font-bold"
          >
            {d}
          </motion.div>
        ))}
      </div>
      <div className="flex items-center gap-2 rounded-[9px] border border-[#dbeafe] bg-[#f0f7ff] px-3 py-2">
        <div className="h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[#3b82f6]" />
        <span className="truncate font-mono text-[10px] text-[#3b82f6]">ms.app/room/472891</span>
      </div>
    </div>
  );
}

function ShareWidget() {
  return (
    <div className="space-y-2 pt-1">
      <motion.div
        initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2, duration: 0.4 }}
        className="ml-auto w-fit max-w-[85%] rounded-[12px] rounded-tr-[4px] bg-[#3b82f6] px-3 py-2 shadow-[0_2px_12px_rgba(59,130,246,0.3)]"
      >
        <p className="text-[11px] font-medium text-white">Hey! Join my study room 📚</p>
        <p className="mt-0.5 font-mono text-[10px] text-white/65">Code: 472-891</p>
      </motion.div>
      <motion.div
        initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 1.0, duration: 0.4 }}
        className="w-fit max-w-[80%] rounded-[12px] rounded-tl-[4px] border border-[#bbf7d0] bg-[#f0fdf4] px-3 py-2"
      >
        <p className="text-[11px] font-medium text-[#16a34a]">✓ Alex joined the room!</p>
      </motion.div>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        transition={{ delay: 1.6, duration: 0.3 }}
        className="flex items-center gap-1.5 pl-1"
      >
        <motion.div
          animate={{ scale: [1, 1.4, 1], opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 1.8, repeat: Infinity }}
          className="h-1.5 w-1.5 rounded-full bg-[#22c55e]"
        />
        <span className="text-[10px] text-[#6b7280]">2 people in room · syncing live</span>
      </motion.div>
    </div>
  );
}

function PomodoroRing() {
  const r = 26;
  const circ = 2 * Math.PI * r;
  return (
    <div className="flex items-center gap-4 pt-1">
      <div className="relative flex-shrink-0">
        <svg width="68" height="68" viewBox="0 0 68 68">
          <circle cx="34" cy="34" r={r} fill="none" stroke="#dbeafe" strokeWidth="5" />
          <motion.circle
            cx="34" cy="34" r={r} fill="none"
            stroke="url(#timerGrad)" strokeWidth="5" strokeLinecap="round"
            strokeDasharray={circ}
            initial={{ strokeDashoffset: circ }}
            animate={{ strokeDashoffset: circ * 0.28 }}
            transition={{ duration: 1.8, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
            style={{ transformOrigin: "34px 34px", rotate: "-90deg" }}
          />
          <defs>
            <linearGradient id="timerGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#3b82f6" />
              <stop offset="100%" stopColor="#6366f1" />
            </linearGradient>
          </defs>
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-mono text-[12px] font-bold text-[#3b82f6]">18:06</span>
        </div>
      </div>
      <div>
        <p className="text-[12px] font-bold text-[#0f0f0f] dark:text-white/85">Pomodoro 2 / 4</p>
        <p className="mt-0.5 text-[10px] text-[#9ca3af]">Alex is focused too</p>
        <div className="mt-2.5 flex gap-1">
          {[1, 2, 3, 4].map(i => (
            <motion.div key={i}
              initial={{ scaleX: 0 }} animate={{ scaleX: 1 }}
              transition={{ delay: 0.5 + i * 0.1, duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="h-[5px] w-5 origin-left rounded-full"
              style={{ background: i <= 2 ? "linear-gradient(90deg,#3b82f6,#6366f1)" : "#e5e7eb" }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── Thin gradient accent line on cards ─────────────────────────── */
function AccentLine({ color = "from-[#3b82f6] to-[#6366f1]" }: { color?: string }) {
  return <div className={`absolute inset-x-0 top-0 h-[2.5px] rounded-t-[24px] bg-gradient-to-r ${color}`} />;
}

/* ─── WIDGET: Sticky Note ─────────────────────────────────────────── */
function StickyNote() {
  return (
    <div className="absolute left-[2%] top-[12%] hidden lg:block">
      <Float y={10} duration={4.5} delay={0}>
        <motion.div
          initial={{ opacity: 0, scale: 0.8, x: -20 }}
          animate={{ opacity: 1, scale: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
          style={{ rotate: "-5deg" }}
        >
          <TiltCard className="w-[195px] rounded-[18px] bg-[#fef08a] p-4 shadow-[0_8px_32px_rgba(0,0,0,0.14)] dark:bg-[#3d3a0a]">
            <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 h-5 w-5 rounded-full bg-[#ef4444] shadow-md" />
            <p className="mt-1 text-[13px] italic leading-[1.7] text-[#6b5e00] dark:text-[#fef08a]/80" style={{ fontFamily: "Georgia, serif" }}>
              Take notes to keep track of crucial details, and accomplish more tasks with ease.
            </p>
          </TiltCard>
        </motion.div>
      </Float>
    </div>
  );
}

/* ─── WIDGET: Checkbox Card ───────────────────────────────────────── */
function CheckboxCard() {
  return (
    <div className="absolute right-[3%] top-[46%] hidden lg:block">
      <Float y={7} duration={3.8} delay={0.8}>
        <motion.div
          initial={{ opacity: 0, scale: 0.6, x: 20 }}
          animate={{ opacity: 1, scale: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          <TiltCard className="flex h-[72px] w-[72px] cursor-pointer items-center justify-center rounded-[20px] bg-white shadow-[0_8px_28px_rgba(0,0,0,0.14)] dark:bg-[#1a1a28]">
            <motion.div
              whileHover={{ rotate: 15, scale: 1.15 }}
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#3b82f6] shadow-[0_0_18px_rgba(59,130,246,0.45)]"
            >
              <Check className="h-5 w-5 text-white" strokeWidth={3} />
            </motion.div>
          </TiltCard>
        </motion.div>
      </Float>
    </div>
  );
}

/* ─── WIDGET: App Logo ────────────────────────────────────────────── */
function AppLogo() {
  return (
    <div className="absolute left-[3%] top-[46%] hidden lg:block">
      <Float y={8} duration={4} delay={0.2}>
        <motion.div
          initial={{ opacity: 0, scale: 0.6, x: -20 }}
          animate={{ opacity: 1, scale: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
        >
          <TiltCard className="flex h-[80px] w-[80px] cursor-pointer items-center justify-center rounded-[22px] bg-white p-2 shadow-[0_12px_40px_rgba(0,0,0,0.16)] dark:bg-[#1a1a28]">
            <motion.div whileHover={{ rotate: 12, scale: 1.1 }} className="h-full w-full">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo.png" alt="Meet&Study" className="h-full w-full rounded-[14px] object-contain" />
            </motion.div>
          </TiltCard>
        </motion.div>
      </Float>
    </div>
  );
}

/* ─── WIDGET: Reminders Card ──────────────────────────────────────── */
function RemindersCard() {
  return (
    <div className="absolute right-[2%] top-[10%] hidden lg:block">
      <Float y={10} duration={4.2} delay={0.5}>
        <motion.div
          initial={{ opacity: 0, scale: 0.85, x: 20 }}
          animate={{ opacity: 1, scale: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.55, ease: [0.22, 1, 0.36, 1] }}
          style={{ rotate: "4deg" }}
        >
          <TiltCard className="w-[212px] rounded-[20px] border border-[#dbeafe] bg-gradient-to-b from-white to-[#f8fbff] p-4 shadow-[0_12px_36px_rgba(59,130,246,0.16)] dark:bg-[#1a1a28]">
            <div className="flex items-start justify-between">
              <p className="text-[13px] font-bold text-[#0f0f0f] dark:text-white/85">Reminders</p>
              <span className="text-[10px] text-[#9ca3af]">Sessions</span>
            </div>
            <div className="my-3 flex h-11 w-11 items-center justify-center rounded-full border-[2.5px] border-[#ef4444] bg-[#fff5f5]">
              <Clock className="h-4.5 w-4.5 text-[#ef4444]" />
            </div>
            <p className="text-[12px] font-semibold text-[#0f0f0f] dark:text-white/75">Focus Session</p>
            <p className="mt-0.5 text-[11px] text-[#9ca3af]">Study sprint with buddy</p>
            <div className="mt-3 flex items-center gap-1.5 rounded-lg border border-[#bfdbfe] bg-[#eff6ff] px-2 py-1.5 dark:bg-[#1e3a5f]">
              <Clock className="h-3 w-3 text-[#3b82f6]" />
              <span className="text-[11px] font-semibold text-[#3b82f6]">25:00 – 50:00</span>
            </div>
          </TiltCard>
        </motion.div>
      </Float>
    </div>
  );
}

/* ─── WIDGET: Tasks Card ──────────────────────────────────────────── */
function TasksCard() {
  const tasks = [
    { label: "Research Chapter 4", color: "#ef4444", pct: 60, avatars: ["#4f46e5", "#ec4899"] },
    { label: "Write Summary Notes", color: "#22c55e", pct: 85, avatars: ["#f59e0b", "#3b82f6"] },
  ];
  return (
    <div className="absolute bottom-[16%] right-[2%] hidden lg:block">
      <Float y={8} duration={5} delay={1}>
        <motion.div
          initial={{ opacity: 0, y: 20, x: 20 }}
          animate={{ opacity: 1, y: 0, x: 0 }}
          transition={{ duration: 0.5, delay: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          <TiltCard className="w-[312px] rounded-[20px] border border-[#dbeafe] bg-gradient-to-b from-white to-[#f8fbff] p-5 shadow-[0_12px_36px_rgba(59,130,246,0.16)] dark:bg-[#1a1a28]">
            <div className="mb-4 flex items-center justify-between">
              <p className="text-[14px] font-bold text-[#0f0f0f] dark:text-white/85">Today&apos;s tasks</p>
              <span className="rounded-full bg-[#e0f2fe] px-2.5 py-1 text-[10px] font-semibold text-[#0369a1]">2 active</span>
            </div>
            <div className="space-y-4">
              {tasks.map((t, i) => (
                <div key={t.label}>
                  <div className="mb-1.5 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-md text-[10px] font-bold text-white" style={{ background: t.color }}>
                        {i + 1}
                      </span>
                      <span className="text-[12px] font-medium text-[#1f2937] dark:text-white/70">{t.label}</span>
                    </div>
                    <div className="flex -space-x-1.5">
                      {t.avatars.map((c, j) => (
                        <div key={j} className="h-5 w-5 rounded-full border-2 border-white dark:border-[#1a1a28]" style={{ background: c }} />
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-[5px] overflow-hidden rounded-full bg-[#f3f4f6] dark:bg-white/10">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${t.pct}%` }}
                        transition={{ delay: 1.2 + i * 0.2, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
                        className="h-full rounded-full"
                        style={{ background: t.color }}
                      />
                    </div>
                    <span className="text-[10px] font-semibold text-[#6b7280]">{t.pct}%</span>
                  </div>
                </div>
              ))}
            </div>
          </TiltCard>
        </motion.div>
      </Float>
    </div>
  );
}

/* ─── WIDGET: Tools Card ──────────────────────────────────────────── */
function ToolsCard() {
  const tools = [
    { icon: Video, color: "#4285f4", bg: "#e8f0fe", label: "Video" },
    { icon: Pencil, color: "#7c3aed", bg: "#ede9fe", label: "Draw" },
    { icon: Timer, color: "#0ea5e9", bg: "#e0f2fe", label: "Timer" },
  ];
  return (
    <div className="absolute bottom-[14%] left-[2%] hidden lg:block">
      <Float y={9} duration={5.5} delay={1.5}>
        <motion.div
          initial={{ opacity: 0, y: 20, x: -20 }}
          animate={{ opacity: 1, y: 0, x: 0 }}
          transition={{ duration: 0.5, delay: 0.65, ease: [0.22, 1, 0.36, 1] }}
        >
          <TiltCard className="w-[230px] rounded-[18px] bg-white p-5 shadow-[0_8px_36px_rgba(0,0,0,0.13)] dark:bg-[#1a1a28]">
            <p className="text-[13px] font-bold text-[#0f0f0f] dark:text-white/85">Built-in tools</p>
            <p className="mb-4 mt-0.5 text-[11px] text-[#9ca3af]">Everything you need, zero setup</p>
            <div className="flex gap-3">
              {tools.map(({ icon: Icon, color, bg, label }, i) => (
                <motion.div key={label}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 1.0 + i * 0.1, type: "spring", stiffness: 400, damping: 18 }}
                  whileHover={{ y: -5, scale: 1.14 }}
                  className="flex flex-col items-center gap-1.5"
                >
                  <div className="flex h-[48px] w-[48px] items-center justify-center rounded-[12px] shadow-[0_2px_10px_rgba(0,0,0,0.08)]" style={{ background: bg }}>
                    <Icon className="h-5 w-5" style={{ color }} />
                  </div>
                  <span className="text-[10px] font-medium text-[#6b7280]">{label}</span>
                </motion.div>
              ))}
            </div>
          </TiltCard>
        </motion.div>
      </Float>
    </div>
  );
}

/* ─── Stagger variants ────────────────────────────────────────────── */
const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.09, delayChildren: 0.05 } },
};
const item = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
};

/* ─── PAGE ────────────────────────────────────────────────────────── */
export default function Home() {
  const router  = useRouter();
  const reduced = useReducedMotion();
  const [scrolled, setScrolled] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [mouseInHero, setMouseInHero] = useState(false);
  const heroRef = useRef<HTMLElement>(null);

  // Video call controls state
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);
  const [callActive, setCallActive] = useState(true);
  const [rejoinCountdown, setRejoinCountdown] = useState(5);
  const [roomCopied, setRoomCopied] = useState(false);
  const [roomCopyError, setRoomCopyError] = useState(false);
  const roomCodeDigits = ["4", "8", "2", "9", "1", "7"];
  const roomCode = roomCodeDigits.join("");

  // Pomodoro timer state
  const [timerRunning, setTimerRunning] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(25 * 60);
  const [timerSession, setTimerSession] = useState(2);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Handle end call with auto-rejoin
  const handleEndCall = () => {
    setCallActive(false);
    setRejoinCountdown(5);
    
    const countdown = setInterval(() => {
      setRejoinCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(countdown);
          setCallActive(true);
          return 5;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleCopyRoomCode = async () => {
    let copied = false;
    try {
      await navigator.clipboard.writeText(roomCode);
      copied = true;
    } catch {
      try {
        const fallback = document.createElement("textarea");
        fallback.value = roomCode;
        fallback.setAttribute("readonly", "");
        fallback.style.position = "fixed";
        fallback.style.left = "-9999px";
        document.body.appendChild(fallback);
        fallback.select();
        fallback.setSelectionRange(0, roomCode.length);
        copied = document.execCommand("copy");
        document.body.removeChild(fallback);
      } catch {
        copied = false;
      }
    }

    if (!copied) {
      setRoomCopyError(true);
      window.setTimeout(() => setRoomCopyError(false), 1600);
      return;
    }

    setRoomCopyError(false);
    setRoomCopied(true);
    window.setTimeout(() => setRoomCopied(false), 1400);
  };

  // Pomodoro timer effect
  useEffect(() => {
    if (timerRunning && timerSeconds > 0) {
      timerRef.current = setInterval(() => {
        setTimerSeconds((prev) => prev - 1);
      }, 1000);
    } else if (timerSeconds === 0) {
      setTimerRunning(false);
      setTimerSession((prev) => prev + 1);
      setTimerSeconds(25 * 60);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [timerRunning, timerSeconds]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleHeroMouseMove = useCallback((e: React.MouseEvent<HTMLElement>) => {
    const rect = heroRef.current?.getBoundingClientRect();
    if (rect) setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  }, []);

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#F5F5F7] text-[#0f0f0f] dark:bg-[#09090F] dark:text-white">

      {/* Dot grid — light */}
      <div aria-hidden className="pointer-events-none fixed inset-0 z-0"
        style={{ backgroundImage: "radial-gradient(circle, #c8c8c8 1.2px, transparent 1.2px)", backgroundSize: "28px 28px", opacity: 0.5 }} />
      {/* Dot grid — dark */}
      <div aria-hidden className="pointer-events-none fixed inset-0 z-0 hidden dark:block"
        style={{ backgroundImage: "radial-gradient(circle, #3b3656 1.2px, transparent 1.2px)", backgroundSize: "28px 28px", opacity: 0.6 }} />

      {/* ── NAV — floating pill ───────────────────────────────── */}
      <div className="fixed inset-x-0 top-4 z-50 flex justify-center px-4">
        <motion.nav
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
          className={[
            "w-full max-w-[900px] md:w-[720px] lg:w-[800px]",
            "rounded-[24px] md:rounded-[28px]",
            "border border-white/40 dark:border-white/[0.12]",
            "bg-white/50 dark:bg-black/40",
            "backdrop-blur-md",
            "shadow-[0_8px_32px_rgba(0,0,0,0.12),0_2px_8px_rgba(0,0,0,0.08),inset_0_1px_0_rgba(255,255,255,0.4)]",
            "dark:shadow-[0_8px_32px_rgba(0,0,0,0.4),0_2px_8px_rgba(0,0,0,0.2),inset_0_1px_0_rgba(255,255,255,0.05)]",
            "transition-all duration-500 ease-out",
            scrolled && "shadow-[0_12px_40px_rgba(59,130,246,0.15),0_4px_12px_rgba(0,0,0,0.1)]",
          ].join(" ")}
        >
        {/* Dynamic Island inner glow */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-[24px] md:rounded-[28px]"
          style={{ 
            background: "linear-gradient(180deg, rgba(255,255,255,0.2) 0%, transparent 50%)",
            opacity: 0.5 
          }}
        />

        <div className="relative flex h-[52px] items-center justify-between gap-2 pl-4 pr-3 md:gap-4 md:pl-5 md:pr-4 lg:gap-6 lg:pl-6 lg:pr-5">

          {/* Logo */}
          <motion.div
            whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            onClick={() => router.push("/")}
            className="group flex cursor-pointer items-center gap-2 flex-shrink-0 px-2"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo.png" alt="Meet&Study"
              className="h-7 w-7 rounded-lg object-contain transition-all duration-300 group-hover:drop-shadow-[0_0_10px_rgba(59,130,246,0.5)]"
            />
            <span className="font-display text-[15px] font-bold tracking-tight text-[#0f0f0f] dark:text-white/90 hidden sm:block">
              Meet&Study
            </span>
          </motion.div>

          {/* Nav links — truly centered */}
          <div className="hidden items-center justify-center gap-0.5 md:flex">
            {["Features", "How it works", "Rooms", "About"].map((label) => (
              <motion.button
                key={label}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={label === "Rooms" ? () => router.push("/rooms") : undefined}
                className="whitespace-nowrap rounded-lg px-2.5 py-2 text-[13px] font-medium text-[#6b7280] transition-all hover:bg-black/5 hover:text-[#0f0f0f] dark:text-white/50 dark:hover:bg-white/10 dark:hover:text-white/90 lg:px-3.5"
              >
                {label}
              </motion.button>
            ))}
          </div>

          {/* CTA cluster */}
          <div className="flex items-center justify-end gap-1.5 flex-shrink-0">
            <motion.button
              whileHover={{ scale: 1.02, backgroundColor: "rgba(0,0,0,0.06)" }}
              whileTap={{ scale: 0.97 }}
              onClick={() => router.push("/rooms")}
              className="hidden sm:block whitespace-nowrap rounded-lg px-3 py-2 text-[13px] font-semibold text-[#374151] transition-all dark:text-white/60 dark:hover:bg-white/10 dark:hover:text-white/90 lg:px-4"
            >
              Sign in
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.03, boxShadow: "0 4px 20px rgba(59,130,246,0.4)" }}
              whileTap={{ scale: 0.97 }}
              onClick={() => router.push("/app")}
              className="whitespace-nowrap rounded-lg bg-[#3b82f6] px-3.5 py-2 text-[13px] font-semibold text-white shadow-[0_2px_8px_rgba(59,130,246,0.3)] transition-all lg:px-4"
            >
              Get started
            </motion.button>
            <div className="flex items-center">
              <ThemeToggle variant="navbar" size="sm" />
            </div>
          </div>
        </div>
        </motion.nav>
      </div>

      {/* ══════════════════════════════════════════════════════════
          HERO — centered layout: content middle, widgets at all 4 corners
      ══════════════════════════════════════════════════════════ */}
      <section
        ref={heroRef}
        onMouseMove={handleHeroMouseMove}
        onMouseEnter={() => setMouseInHero(true)}
        onMouseLeave={() => setMouseInHero(false)}
        className="relative z-10 flex min-h-[92vh] flex-col items-center justify-center overflow-hidden"
      >
        {/* Cursor spotlight */}
        {!reduced && mouseInHero && (
          <div
            aria-hidden
            className="pointer-events-none absolute z-0 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full"
            style={{
              left: mousePos.x,
              top: mousePos.y,
              background: "radial-gradient(circle, rgba(59,130,246,0.10) 0%, rgba(99,102,241,0.05) 40%, transparent 70%)",
              transition: "left 0.08s ease, top 0.08s ease",
            }}
          />
        )}

        {/* Ambient center glow */}
        <div aria-hidden className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="h-[500px] w-[700px] rounded-full bg-[#3b82f6]/[0.04] blur-[100px]" />
        </div>
        {/* Bottom fade */}
        <div aria-hidden className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#F5F5F7] via-transparent to-transparent dark:from-[#09090F] dark:via-transparent dark:to-transparent" />
        {/* Blue bottom wash */}
        <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-[280px] bg-gradient-to-t from-[#3b82f6]/[0.055] to-transparent" />

        {/* Widgets — 4 corners */}
        {!reduced && (
          <>
            <StickyNote />
            <RemindersCard />
            <AppLogo />
            <CheckboxCard />
            <TasksCard />
            <ToolsCard />
          </>
        )}

        {/* Center text content */}
        <div className="relative z-10 flex flex-col items-center px-6 pb-24 text-center">

          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
            className="mb-7"
          >
            <div className="inline-flex items-center gap-3 rounded-[10px] border border-black/[0.07] bg-white px-4 py-2 text-[12px] font-semibold text-[#374151] shadow-[0_2px_12px_rgba(0,0,0,0.06)] dark:border-white/[0.08] dark:bg-white/[0.05] dark:text-white/50">
              <div className="relative flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-md bg-[#dcfce7] dark:bg-[#22c55e]/15">
                <motion.span
                  animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
                  transition={{ repeat: Infinity, duration: 2.4, ease: "easeInOut" }}
                  className="absolute h-full w-full rounded-md bg-[#22c55e]/25"
                />
                <span className="relative h-2 w-2 rounded-full bg-[#22c55e] shadow-[0_0_5px_rgba(34,197,94,0.8)]" />
              </div>
              No sign-up required — open in seconds
            </div>
          </motion.div>

          {/* Headlines */}
          <h1 className="text-center">
            <motion.span
              initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.22, ease: [0.22, 1, 0.36, 1] }}
              className="block font-display text-[36px] font-bold leading-[1.1] tracking-[-0.03em] text-[#0f0f0f] dark:text-white/85 md:text-[50px] lg:text-[60px]"
            >
              Think, plan, and study
            </motion.span>
            <motion.span
              initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.34, ease: [0.22, 1, 0.36, 1] }}
              className="relative block font-display text-[58px] font-extrabold leading-[0.95] tracking-[-0.05em] text-[#3b82f6] md:text-[80px] lg:text-[100px]"
            >
              Together.
              <motion.svg viewBox="0 0 320 18" className="absolute -bottom-1 left-0 w-full" fill="none" aria-hidden>
                <motion.path
                  d="M4 14 Q80 4 160 12 Q240 20 316 8"
                  stroke="#3b82f6" strokeWidth="4" strokeLinecap="round" opacity="0.35"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 0.35 }}
                  transition={{ delay: 0.95, duration: 0.8, ease: "easeOut" }}
                />
              </motion.svg>
            </motion.span>
          </h1>

          {/* Sub */}
          <motion.p
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.44, ease: [0.22, 1, 0.36, 1] }}
            className="mt-7 max-w-[440px] text-center text-[15px] leading-relaxed text-[#6b7280] dark:text-white/40"
          >
            A premium 1-on-1 study room — whiteboard, pomodoro, todos, video, and real-time sync.
          </motion.p>

          {/* CTA row */}
          <motion.div
            initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.54, ease: [0.22, 1, 0.36, 1] }}
            className="mt-9 mb-12 flex flex-wrap items-center justify-center gap-3"
          >
            <motion.button
              whileHover={{ scale: 1.05, boxShadow: "0 12px 36px rgba(59,130,246,0.45)" }}
              whileTap={{ scale: 0.96 }}
              onClick={() => router.push("/app")}
              className="inline-flex items-center gap-2.5 rounded-[14px] bg-[#3b82f6] px-8 py-3.5 text-[15px] font-semibold text-white shadow-[0_4px_20px_rgba(59,130,246,0.32)]"
            >
              Enter the app
              <motion.span animate={{ x: [0, 5, 0] }} transition={{ repeat: Infinity, duration: 1.6, ease: "easeInOut" }}>
                <ArrowRight className="h-4.5 w-4.5" />
              </motion.span>
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
              onClick={() => router.push("/rooms")}
              className="inline-flex items-center gap-2 rounded-[14px] border border-black/[0.08] bg-white px-6 py-3.5 text-[15px] font-medium text-[#374151] shadow-sm hover:bg-[#f8f9fa] dark:border-white/[0.08] dark:bg-white/[0.05] dark:text-white/60 dark:hover:bg-white/[0.08]"
            >
              Browse rooms
            </motion.button>
          </motion.div>
        </div>

        {/* Stats ribbon — fixed at bottom of hero */}
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.7 }}
          className="absolute inset-x-0 bottom-0 z-10 w-full border-y border-black/[0.06] bg-white/80 backdrop-blur-sm dark:border-white/[0.05] dark:bg-[#09090F]/85"
        >
          <div className="flex w-full flex-wrap items-center justify-center gap-6 px-6 py-3.5 md:justify-between md:gap-10 md:px-10">
            {[
              { label: "1-on-1 Study Rooms", icon: "🎯" },
              { label: "No sign-up needed", icon: "⚡" },
              { label: "Realtime sync", icon: "🔄" },
              { label: "Free forever", icon: "🆓" },
              { label: "Built-in Pomodoro", icon: "⏱" },
              { label: "Live whiteboard", icon: "✏️" },
            ].map(({ label, icon }) => (
              <span key={label} className="flex items-center gap-1.5 font-mono text-[11px] text-[#9ca3af] tracking-wide dark:text-white/25">
                <span>{icon}</span> {label}
              </span>
            ))}
          </div>
        </motion.div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          BENTO FEATURES
      ══════════════════════════════════════════════════════════ */}
      <section className="relative z-10 overflow-hidden px-5 py-24">
        {/* Blue soft blurry gradient corners */}
        <div aria-hidden className="pointer-events-none absolute -left-32 top-0 h-[600px] w-[600px] rounded-full bg-[#3b82f6]/[0.12] blur-[180px]" />
        <div aria-hidden className="pointer-events-none absolute -right-32 bottom-0 h-[500px] w-[500px] rounded-full bg-[#6366f1]/[0.15] blur-[150px]" />
        <div aria-hidden className="pointer-events-none absolute left-1/2 top-1/2 h-[800px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#60a5fa]/[0.08] blur-[200px]" />
        <div className="mx-auto max-w-5xl relative">
          <motion.div initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="mb-14 text-center"
          >
            <span className="inline-block rounded-[8px] border border-[#3b82f6]/20 bg-[#eff6ff] px-3.5 py-1 text-[11px] font-bold uppercase tracking-[0.14em] text-[#3b82f6] dark:bg-[#1e3a5f]/60">
              Everything in one room
            </span>
            <h2 className="mt-4 font-display text-[34px] font-extrabold tracking-[-0.03em] text-[#0f0f0f] dark:text-white/90 sm:text-[44px]">
              Built for real study sessions
            </h2>
            <p className="mx-auto mt-3 max-w-md text-[15px] text-[#6b7280] dark:text-white/35">
              No tabs. No switching apps. Every tool you need, live in one shared room.
            </p>
          </motion.div>

          <motion.div variants={container} initial="hidden" whileInView="show"
            viewport={{ once: true, margin: "-60px" }}
            className="grid grid-cols-1 gap-4 md:grid-cols-3"
          >
            {/* Video Call */}
            <motion.div variants={item} whileHover={{ y: -8, scale: 1.01, boxShadow: "0 24px 56px rgba(59,130,246,0.15), 0 8px 24px rgba(0,0,0,0.1)" }} whileTap={{ scale: 0.99 }}
              className="group relative overflow-hidden rounded-[24px] border border-black/[0.06] bg-white/80 p-7 shadow-[0_4px_24px_rgba(0,0,0,0.07)] backdrop-blur-sm md:col-span-2 dark:border-white/[0.06] dark:bg-white/[0.05]"
            >
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-[#3b82f6]/5 via-transparent to-[#6366f1]/5 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
              <AccentLine />
              <div className="flex items-start justify-between relative">
                <div>
                  <div className="inline-flex h-10 w-10 items-center justify-center rounded-[12px] bg-[#eff6ff] dark:bg-[#3b82f6]/10">
                    <Video className="h-5 w-5 text-[#3b82f6]" />
                  </div>
                  <h3 className="mt-4 text-[18px] font-bold text-[#0f0f0f] dark:text-white/85">Video Call</h3>
                  <p className="mt-1.5 max-w-xs text-[13px] leading-relaxed text-[#6b7280] dark:text-white/35">
                    P2P video that launches in one click. No account, no installs — just share a code and you&apos;re live.
                  </p>
                </div>
                <span className="rounded-[6px] bg-[#dcfce7] px-2.5 py-1 text-[10px] font-bold text-[#16a34a] dark:bg-[#22c55e]/10 dark:text-[#4ade80]">LIVE</span>
              </div>
              {/* Video tiles */}
              <div className="mt-6 flex h-[160px] gap-2.5 relative">
                {/* Call ended overlay */}
                {!callActive && (
                  <motion.div 
                    initial={{ opacity: 0, backdropFilter: "blur(0px)" }} 
                    animate={{ opacity: 1, backdropFilter: "blur(4px)" }}
                    className="absolute inset-0 z-20 flex flex-col items-center justify-center rounded-[14px] bg-black/70"
                  >
                    <motion.div
                      initial={{ scale: 0, y: 10 }} animate={{ scale: 1, y: 0 }}
                      transition={{ type: "spring", stiffness: 200, damping: 15 }}
                      className="flex flex-col items-center gap-3"
                    >
                      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/10">
                        <PhoneOff className="h-6 w-6 text-[#ef4444]" />
                      </div>
                      <div className="flex flex-col items-center gap-1 text-center">
                        <span className="text-white font-bold text-[15px]">Call ended</span>
                        <span className="text-white/70 text-[12px] font-medium">Reconnecting in <span className="text-white tabular-nums">{rejoinCountdown}</span>s...</span>
                      </div>
                      
                      {/* Loading spinner ring */}
                      <motion.svg className="h-5 w-5 text-[#3b82f6]" viewBox="0 0 24 24"
                        animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      >
                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" fill="none" strokeOpacity="0.25" />
                        <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" fill="none" strokeLinecap="round" />
                      </motion.svg>
                    </motion.div>
                  </motion.div>
                )}
                {/* You — speaking */}
                <div className="relative flex flex-1 flex-col items-center justify-center gap-2.5 rounded-[14px] bg-[#0f172a] p-3 overflow-hidden transition-all">
                  {camOn && (
                    <motion.img 
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                      src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=400&fit=crop"
                      alt="You"
                      className="absolute inset-0 h-full w-full object-cover"
                    />
                  )}
                  {camOn && <div className="absolute inset-0 bg-black/20" />}
                  
                  <div className="relative z-10 flex flex-1 items-center justify-center">
                    {!camOn && (
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#1e293b] text-[16px] font-bold text-white shadow-inner">
                        <VideoOff className="h-5 w-5 text-white/50" />
                      </div>
                    )}
                  </div>
                  
                  <div className="relative z-10 w-full flex items-end justify-between mt-auto">
                    <div className="flex items-center gap-1.5 rounded-md bg-black/50 px-2 py-1 backdrop-blur-md">
                      <span className={`h-1.5 w-1.5 rounded-full ${micOn ? 'bg-[#22c55e]' : 'bg-[#ef4444]'} ${micOn ? 'shadow-[0_0_4px_rgba(34,197,94,0.8)]' : ''}`} />
                      <span className="text-[10px] font-medium text-white/90">You · {micOn ? 'Speaking' : 'Muted'}</span>
                    </div>
                    {micOn && (
                      <div className="flex h-3 items-end gap-[2px] rounded-md bg-black/50 px-1.5 py-1 backdrop-blur-md">
                        {[4, 7, 10, 8, 12].map((h, i) => (
                          <motion.div key={i}
                            animate={{ height: [`${h}px`, `${Math.min(h * 1.8, 14)}px`, `${h}px`] }}
                            transition={{ duration: 0.5 + i * 0.07, delay: i * 0.06, repeat: Infinity, ease: "easeInOut" }}
                            className="w-[2px] rounded-full bg-[#3b82f6]"
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                {/* Alex — listening */}
                <div className="relative flex flex-1 flex-col items-center justify-center gap-2.5 rounded-[14px] bg-[#0d1117] p-3 overflow-hidden">
                  <motion.img 
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=400&fit=crop"
                    alt="Alex"
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/20" />
                  
                  <div className="relative z-10 flex flex-1 items-center justify-center" />
                  
                  <div className="relative z-10 w-full flex items-end justify-between mt-auto">
                    <div className="flex items-center gap-1.5 rounded-md bg-black/50 px-2 py-1 backdrop-blur-md">
                      <span className="h-1.5 w-1.5 rounded-full bg-[#22c55e]" />
                      <span className="text-[10px] font-medium text-white/90">Alex</span>
                    </div>
                  </div>
                </div>
              </div>
              {/* Call controls */}
              <div className="mt-4 flex items-center justify-center gap-2.5">
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.92 }}
                  onClick={() => setMicOn(!micOn)}
                  className={`flex h-11 w-11 items-center justify-center rounded-full transition-colors ${micOn ? "bg-black/5 hover:bg-black/10 dark:bg-white/10 dark:hover:bg-white/20 text-[#374151] dark:text-white" : "bg-[#ef4444] text-white shadow-[0_4px_12px_rgba(239,68,68,0.4)]"}`}
                  title={micOn ? "Mute" : "Unmute"}
                >
                  <Mic className="h-[18px] w-[18px]" />
                </motion.button>
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.92 }}
                  onClick={() => setCamOn(!camOn)}
                  className={`flex h-11 w-11 items-center justify-center rounded-full transition-colors ${camOn ? "bg-black/5 hover:bg-black/10 dark:bg-white/10 dark:hover:bg-white/20 text-[#374151] dark:text-white" : "bg-[#ef4444] text-white shadow-[0_4px_12px_rgba(239,68,68,0.4)]"}`}
                  title={camOn ? "Turn off camera" : "Turn on camera"}
                >
                  {camOn ? <Video className="h-[18px] w-[18px]" /> : <VideoOff className="h-[18px] w-[18px]" />}
                </motion.button>
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.92 }}
                  onClick={handleEndCall}
                  className="ml-2 flex h-11 w-16 items-center justify-center rounded-[14px] bg-[#ef4444] text-white shadow-[0_4px_12px_rgba(239,68,68,0.4)] transition-colors hover:bg-[#dc2626]"
                  title="End Call"
                >
                  <PhoneOff className="h-[18px] w-[18px]" />
                </motion.button>
              </div>
            </motion.div>

            {/* Pomodoro */}
            <motion.div variants={item} whileHover={{ y: -8, scale: 1.02, boxShadow: "0 24px 56px rgba(245,158,11,0.15), 0 8px 24px rgba(0,0,0,0.1)" }} whileTap={{ scale: 0.98 }}
              className="group relative overflow-hidden rounded-[24px] border border-black/[0.06] bg-white/80 p-7 shadow-[0_4px_24px_rgba(0,0,0,0.07)] backdrop-blur-sm dark:border-white/[0.06] dark:bg-white/[0.05]"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-[#f59e0b]/5 via-transparent to-[#ef4444]/5 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
              <AccentLine color="from-[#f59e0b] to-[#ef4444]" />
              <div className="inline-flex h-10 w-10 items-center justify-center rounded-[12px] bg-[#fff7ed] dark:bg-[#f59e0b]/10 group-hover:scale-110 transition-transform duration-300">
                <Timer className="h-5 w-5 text-[#f59e0b]" />
              </div>
              <h3 className="mt-4 text-[18px] font-bold text-[#0f0f0f] dark:text-white/85">Pomodoro</h3>
              <p className="mt-1.5 text-[13px] leading-relaxed text-[#6b7280] dark:text-white/35">
                Shared focus timer. Both of you see the same countdown.
              </p>
              <motion.div className="mt-6 flex flex-col items-center rounded-[16px] bg-[#0f0f0f] py-6 dark:bg-black/40 group-hover:bg-[#1a1a2e] transition-colors duration-300 shadow-inner" whileHover={{ scale: 1.02 }}>
                <div className="flex items-center gap-2 mb-2">
                  <span className="flex h-2 w-2 items-center justify-center">
                    <span className={`absolute h-2 w-2 rounded-full ${timerRunning ? 'bg-[#f59e0b] animate-ping opacity-75' : 'bg-white/20'}`}></span>
                    <span className={`relative inline-flex rounded-full h-1.5 w-1.5 ${timerRunning ? 'bg-[#f59e0b]' : 'bg-white/40'}`}></span>
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-white/50">{timerRunning ? 'Focusing' : 'Paused'}</span>
                </div>
                <motion.span className="font-mono text-[40px] font-bold tabular-nums text-white"
                  animate={{ opacity: timerRunning ? [1, 0.8, 1] : 1 }} transition={{ duration: 2, repeat: Infinity }}
                >{formatTime(timerSeconds)}</motion.span>
                <div className="mt-3 h-1.5 w-32 overflow-hidden rounded-full bg-white/10 relative">
                  <motion.div
                    animate={{ width: `${(timerSeconds / (25 * 60)) * 100}%` }}
                    transition={{ duration: 1, ease: "linear" }}
                    className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-[#f59e0b] to-[#ef4444]"
                  />
                </div>
                <span className="mt-2.5 text-[10px] font-medium text-white/40 tracking-wider">Session {timerSession} of 4</span>
                <div className="mt-5 flex items-center gap-3">
                  <motion.button
                    whileHover={{ scale: 1.1, backgroundColor: "rgba(255,255,255,0.15)" }} whileTap={{ scale: 0.9 }}
                    onClick={() => setTimerRunning(!timerRunning)}
                    className={`flex h-10 w-10 items-center justify-center rounded-full transition-colors ${timerRunning ? 'bg-white/10 text-white/90' : 'bg-[#f59e0b] text-white shadow-[0_2px_10px_rgba(245,158,11,0.3)]'}`}
                    title={timerRunning ? "Pause Timer" : "Start Timer"}
                  >
                    {timerRunning ? <Pause className="h-[18px] w-[18px] fill-current" /> : <Play className="h-[18px] w-[18px] fill-current ml-0.5" />}
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.1, backgroundColor: "rgba(255,255,255,0.15)" }} whileTap={{ scale: 0.9 }}
                    onClick={() => { setTimerSeconds(25 * 60); setTimerRunning(false); }}
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-white/5 text-white/70 hover:text-white transition-colors"
                    title="Reset Timer"
                  >
                    <RotateCcw className="h-[16px] w-[16px]" />
                  </motion.button>
                </div>
              </motion.div>
            </motion.div>

            {/* Whiteboard */}
            <motion.div variants={item} whileHover={{ y: -8, scale: 1.02, boxShadow: "0 24px 56px rgba(139,92,246,0.15), 0 8px 24px rgba(0,0,0,0.1)" }} whileTap={{ scale: 0.98 }}
              className="group relative overflow-hidden rounded-[24px] border border-black/[0.06] bg-white/80 p-7 shadow-[0_4px_24px_rgba(0,0,0,0.07)] backdrop-blur-sm dark:border-white/[0.06] dark:bg-white/[0.05]"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-[#8b5cf6]/5 via-transparent to-[#ec4899]/5 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
              <AccentLine color="from-[#8b5cf6] to-[#ec4899]" />
              <div className="inline-flex h-10 w-10 items-center justify-center rounded-[12px] bg-[#f5f3ff] dark:bg-[#8b5cf6]/10 group-hover:scale-110 transition-transform duration-300">
                <Pencil className="h-5 w-5 text-[#8b5cf6]" />
              </div>
              <h3 className="mt-4 text-[18px] font-bold text-[#0f0f0f] dark:text-white/85">Whiteboard</h3>
              <p className="mt-1.5 text-[13px] leading-relaxed text-[#6b7280] dark:text-white/35">
                Real-time canvas. Draw, diagram, and think together.
              </p>
              {/* Mind-map canvas */}
              <div className="mt-5 overflow-hidden rounded-[16px] border border-[#e5e7eb] bg-[#fafafa] px-3 py-4 dark:border-white/[0.07] dark:bg-white/[0.03]">
                <svg viewBox="0 0 210 130" className="w-full">
                  {/* Branch lines */}
                  <motion.path d="M 105 65 L 40 25" stroke="#c4b5fd" strokeWidth="1.5" strokeLinecap="round" fill="none"
                    initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.5, delay: 0.2 }} />
                  <motion.path d="M 105 65 L 170 25" stroke="#c4b5fd" strokeWidth="1.5" strokeLinecap="round" fill="none"
                    initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.5, delay: 0.4 }} />
                  <motion.path d="M 105 72 L 40 108" stroke="#c4b5fd" strokeWidth="1.5" strokeLinecap="round" fill="none"
                    initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.5, delay: 0.6 }} />
                  <motion.path d="M 105 72 L 170 108" stroke="#c4b5fd" strokeWidth="1.5" strokeLinecap="round" fill="none"
                    initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.5, delay: 0.8 }} />

                  {/* Center node */}
                  <motion.ellipse cx="105" cy="68" rx="26" ry="17"
                    fill="#ede9fe" stroke="#8b5cf6" strokeWidth="1.5"
                    initial={{ scale: 0 }} animate={{ scale: 1 }}
                    style={{ transformOrigin: "105px 68px" }}
                    transition={{ type: "spring", stiffness: 260, damping: 18, delay: 0.05 }} />
                  <text x="105" y="72" textAnchor="middle" fontSize="8.5" fontWeight="700" fill="#6d28d9">Ch. 4</text>

                  {/* F = ma */}
                  <motion.ellipse cx="40" cy="22" rx="26" ry="14"
                    fill="#fdf4ff" stroke="#d946ef" strokeWidth="1.5"
                    initial={{ scale: 0 }} animate={{ scale: 1 }}
                    style={{ transformOrigin: "40px 22px" }}
                    transition={{ type: "spring", stiffness: 260, damping: 18, delay: 0.65 }} />
                  <motion.text initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}
                    x="40" y="26" textAnchor="middle" fontSize="7.5" fontWeight="700" fill="#a21caf" fontFamily="monospace">F = ma</motion.text>

                  {/* Gravity */}
                  <motion.ellipse cx="170" cy="22" rx="26" ry="14"
                    fill="#fff7ed" stroke="#f97316" strokeWidth="1.5"
                    initial={{ scale: 0 }} animate={{ scale: 1 }}
                    style={{ transformOrigin: "170px 22px" }}
                    transition={{ type: "spring", stiffness: 260, damping: 18, delay: 0.85 }} />
                  <motion.text initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.0 }}
                    x="170" y="26" textAnchor="middle" fontSize="7.5" fontWeight="700" fill="#c2410c">Gravity</motion.text>

                  {/* Velocity */}
                  <motion.ellipse cx="40" cy="112" rx="26" ry="14"
                    fill="#f0fdf4" stroke="#22c55e" strokeWidth="1.5"
                    initial={{ scale: 0 }} animate={{ scale: 1 }}
                    style={{ transformOrigin: "40px 112px" }}
                    transition={{ type: "spring", stiffness: 260, damping: 18, delay: 1.05 }} />
                  <motion.text initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2 }}
                    x="40" y="116" textAnchor="middle" fontSize="7.5" fontWeight="700" fill="#15803d">Velocity</motion.text>

                  {/* Momentum */}
                  <motion.ellipse cx="170" cy="112" rx="28" ry="14"
                    fill="#eff6ff" stroke="#3b82f6" strokeWidth="1.5"
                    initial={{ scale: 0 }} animate={{ scale: 1 }}
                    style={{ transformOrigin: "170px 112px" }}
                    transition={{ type: "spring", stiffness: 260, damping: 18, delay: 1.25 }} />
                  <motion.text initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.4 }}
                    x="170" y="116" textAnchor="middle" fontSize="7.5" fontWeight="700" fill="#1d4ed8">Momentum</motion.text>

                  {/* Cursor: Alex (blue) */}
                  <motion.g animate={{ x: [0, 6, -3, 4, 0], y: [0, -5, 3, -2, 0] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}>
                    <path d="M 62 42 L 62 54 L 65.5 51 L 67.5 56 L 69.5 55 L 67.5 50 L 71 50 Z" fill="#3b82f6" />
                    <rect x="63" y="56" width="20" height="9" rx="2" fill="#3b82f6" />
                    <text x="73" y="63.5" textAnchor="middle" fontSize="5.5" fill="white" fontWeight="700">Alex</text>
                  </motion.g>

                  {/* Cursor: You (pink) */}
                  <motion.g animate={{ x: [0, -5, 3, -2, 0], y: [0, 4, -3, 2, 0] }}
                    transition={{ duration: 3.5, delay: 1, repeat: Infinity, ease: "easeInOut" }}>
                    <path d="M 118 55 L 118 67 L 121.5 64 L 123.5 69 L 125.5 68 L 123.5 63 L 127 63 Z" fill="#ec4899" />
                    <rect x="119" y="69" width="18" height="9" rx="2" fill="#ec4899" />
                    <text x="128" y="76.5" textAnchor="middle" fontSize="5.5" fill="white" fontWeight="700">You</text>
                  </motion.g>
                </svg>
              </div>
            </motion.div>

            {/* Private Room */}
            <motion.div variants={item} whileHover={{ y: -8, scale: 1.01, boxShadow: "0 24px 56px rgba(34,197,94,0.12), 0 8px 24px rgba(0,0,0,0.1)" }} whileTap={{ scale: 0.99 }}
              className="group relative overflow-hidden rounded-[24px] border border-black/[0.06] bg-white/80 p-8 shadow-[0_4px_24px_rgba(0,0,0,0.07)] backdrop-blur-sm md:col-span-2 dark:border-white/[0.06] dark:bg-white/[0.05]"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-[#22c55e]/5 via-transparent to-[#14b8a6]/5 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
              <AccentLine color="from-[#22c55e] to-[#14b8a6]" />
              
              {/* Header */}
              <div className="flex items-start justify-between mb-8 relative">
                <div className="flex items-center gap-4">
                  <motion.div 
                    initial={{ scale: 0 }} animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 200, damping: 15 }}
                    className="flex h-14 w-14 items-center justify-center rounded-[16px] bg-gradient-to-br from-[#22c55e]/10 to-[#14b8a6]/10 dark:from-[#22c55e]/20 dark:to-[#14b8a6]/20 group-hover:scale-110 transition-transform duration-300"
                  >
                    <Users className="h-7 w-7 text-[#22c55e]" />
                  </motion.div>
                  <div>
                    <h3 className="text-[22px] font-bold text-[#0f0f0f] dark:text-white/90">Private Study Room</h3>
                    <p className="mt-1 text-[14px] text-[#6b7280] dark:text-white/40">One-on-one only. No strangers, no noise.</p>
                  </div>
                </div>
                <motion.span 
                  initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                  className="rounded-[8px] bg-[#dcfce7] px-3 py-1.5 text-[11px] font-bold text-[#16a34a] dark:bg-[#22c55e]/10 dark:text-[#4ade80]"
                >
                  LIVE
                </motion.span>
              </div>

              {/* Room Code Section */}
              <div className="mb-8">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[12px] font-semibold uppercase tracking-wider text-[#9ca3af] dark:text-white/30">Room Code</span>
                  <motion.button
                    whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                    onClick={handleCopyRoomCode}
                    className={`relative text-[11px] font-semibold transition-colors ${
                      roomCopyError ? "text-[#ef4444] hover:text-[#dc2626]" : "text-[#3b82f6] hover:text-[#2563eb]"
                    }`}
                    aria-label={roomCopyError ? "Copy failed, retry" : roomCopied ? "Room code copied" : "Copy room code"}
                  >
                    <span className="inline-flex items-center gap-1.5">
                      {roomCopied ? <CheckCheck className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                      {roomCopyError ? "Retry" : roomCopied ? "Copied!" : "Copy"}
                    </span>
                    <AnimatePresence>
                      {roomCopied && (
                        <motion.span
                          initial={{ opacity: 0, y: 5, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: -5, scale: 0.95 }}
                          className="pointer-events-none absolute -top-7 right-0 rounded-md bg-[#dcfce7] px-2 py-1 text-[10px] font-bold text-[#16a34a] shadow-sm"
                        >
                          Copied
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </motion.button>
                </div>
                <div className="flex gap-3">
                  {roomCodeDigits.map((d, i) => (
                    <motion.div key={i}
                      initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={
                        roomCopied
                          ? { duration: 0.35, delay: i * 0.03 }
                          : { delay: 0.3 + i * 0.08, type: "spring", stiffness: 300, damping: 20 }
                      }
                      animate={roomCopied ? { y: [0, -6, 0], scale: [1, 1.1, 1] } : { y: 0, scale: 1 }}
                      whileHover={{ y: -4, scale: 1.15, boxShadow: "0 8px 24px rgba(59,130,246,0.25)" }}
                      className="flex h-12 w-12 cursor-pointer items-center justify-center rounded-xl bg-white font-mono text-[18px] font-bold text-[#0f0f0f] shadow-[0_2px_8px_rgba(0,0,0,0.08)] transition-all hover:bg-[#3b82f6] hover:text-white dark:bg-white/[0.06] dark:text-white/70 dark:hover:bg-[#3b82f6]"
                    >
                      {d}
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Features Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {[
                  { label: "Realtime sync", icon: "🔄", color: "#3b82f6" },
                  { label: "Shared notes", icon: "📝", color: "#8b5cf6" },
                  { label: "Aha moments", icon: "💡", color: "#f59e0b" },
                  { label: "Session summary", icon: "📊", color: "#14b8a6" },
                  { label: "Todo tracking", icon: "✅", color: "#22c55e" },
                  { label: "Chat", icon: "💬", color: "#ec4899" },
                ].map(({ label, icon, color }, i) => (
                  <motion.div
                    key={label}
                    initial={{ opacity: 0, y: 8 }} whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }} transition={{ delay: 0.5 + i * 0.06 }}
                    whileHover={{ y: -2, scale: 1.02, backgroundColor: `${color}10` }}
                    className="flex items-center gap-2.5 rounded-lg border border-black/[0.06] bg-white/50 px-3 py-2.5 transition-colors dark:border-white/[0.06] dark:bg-white/[0.04]"
                  >
                    <span className="text-lg">{icon}</span>
                    <span className="text-[12px] font-medium text-[#374151] dark:text-white/60">{label}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          CINEMATIC STATEMENT — editorial light section with blue gradient
      ══════════════════════════════════════════════════════════ */}
      <section className="relative z-10 overflow-hidden bg-white py-20 px-6 dark:bg-[#07070c]">
        {/* Top blue-indigo gradient wash */}
        <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-[200px] bg-gradient-to-b from-[#3b82f6]/[0.09] via-[#6366f1]/[0.04] to-transparent" />
        {/* Bottom blue gradient wash */}
        <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-[200px] bg-gradient-to-t from-[#3b82f6]/[0.08] via-[#6366f1]/[0.03] to-transparent" />
        {/* Soft center glow */}
        <div aria-hidden className="pointer-events-none absolute left-1/2 top-1/2 h-[480px] w-[480px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#3b82f6]/[0.05] blur-[130px]" />

        <div className="relative mx-auto max-w-5xl text-center">
          <motion.p
            initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="font-mono text-[11px] uppercase tracking-[0.4em] text-[#9ca3af] dark:text-white/25"
          >
            Most study apps focus on:
          </motion.p>
          <motion.p
            initial={{ opacity: 0 }} whileInView={{ opacity: 1 }}
            viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
            className="mt-3 text-[15px] text-[#c4c8d0] dark:text-white/22"
          >
            logging your hours and calling it productivity.
          </motion.p>

          {/* Vertical blue divider */}
          <motion.div
            initial={{ scaleY: 0 }} whileInView={{ scaleY: 1 }}
            viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="mx-auto my-10 h-12 w-px origin-top"
            style={{ background: "linear-gradient(to bottom, transparent, #3b82f6 45%, transparent)" }}
          />

          <motion.h2
            initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.7, delay: 0.32, ease: [0.22, 1, 0.36, 1] }}
            className="font-display font-extrabold leading-[1.1] tracking-[-0.03em] text-[#0f0f0f] dark:text-white/90"
            style={{ fontSize: "clamp(28px, 5.5vw, 72px)" }}
          >
            We focus on keeping you
          </motion.h2>
          <motion.h2
            initial={{ opacity: 0, y: 28 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.7, delay: 0.44, ease: [0.22, 1, 0.36, 1] }}
            className="font-display font-extrabold leading-[1.3] sm:leading-[1.15] tracking-[-0.03em] text-[#3b82f6]"
            style={{ fontSize: "clamp(28px, 5.5vw, 72px)" }}
          >
            <span className="block sm:inline">focused</span>
            <span className="hidden sm:inline font-light text-[#d1d5db] dark:text-white/15 mx-3" style={{ fontSize: "0.45em" }}>|</span>
            <span className="block sm:inline">in sync</span>
            <span className="hidden sm:inline font-light text-[#d1d5db] dark:text-white/15 mx-3" style={{ fontSize: "0.45em" }}>|</span>
            <span className="block sm:inline">productive</span>
          </motion.h2>
          <motion.h2
            initial={{ opacity: 0, y: 28 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.7, delay: 0.56, ease: [0.22, 1, 0.36, 1] }}
            className="font-display font-extrabold leading-[1.1] tracking-[-0.03em] text-[#0f0f0f] dark:text-white/90"
            style={{ fontSize: "clamp(28px, 5.5vw, 72px)" }}
          >
            every single session.
          </motion.h2>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          HOW IT WORKS — cinematic, animated connector, mini previews
      ══════════════════════════════════════════════════════════ */}
      <section className="relative z-10 overflow-hidden border-y border-black/[0.05] bg-white/80 px-5 py-24 backdrop-blur-sm dark:border-white/[0.04] dark:bg-white/[0.01]">
        {/* Corner blue spills */}
        <div aria-hidden className="pointer-events-none absolute -left-32 -top-24 h-[360px] w-[360px] rounded-full bg-[#3b82f6]/[0.07] blur-[110px]" />
        <div aria-hidden className="pointer-events-none absolute -bottom-24 -right-32 h-[360px] w-[360px] rounded-full bg-[#6366f1]/[0.07] blur-[110px]" />
        {/* Edge spill lines */}
        <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-px"
          style={{ background: "linear-gradient(90deg, transparent 8%, rgba(59,130,246,0.25) 35%, rgba(99,102,241,0.2) 65%, transparent 92%)" }} />
        <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-px"
          style={{ background: "linear-gradient(90deg, transparent 8%, rgba(59,130,246,0.15) 40%, transparent 92%)" }} />

        <div className="mx-auto max-w-5xl">
          {/* Header */}
          <motion.div initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="mb-20 text-center"
          >
            <span className="inline-block rounded-[8px] border border-[#3b82f6]/20 bg-[#eff6ff] px-3.5 py-1 text-[11px] font-bold uppercase tracking-[0.14em] text-[#3b82f6] dark:bg-[#1e3a5f]/60">
              How it works
            </span>
            <h2 className="mt-4 font-display text-[34px] font-extrabold tracking-[-0.03em] text-[#0f0f0f] dark:text-white/90 sm:text-[44px]">
              Open. Share. Focus.
            </h2>
            <p className="mx-auto mt-3 max-w-md text-[15px] text-[#6b7280] dark:text-white/35">
              Three steps. Any device. No excuses.
            </p>
          </motion.div>

          {/* Steps grid */}
          <div className="relative grid gap-6 md:grid-cols-3">

            {/* Animated draw-on connector line */}
            <div className="absolute left-[9%] right-[9%] top-[27px] hidden md:block">
              {/* Track */}
              <div className="h-px w-full bg-[#e5e7eb] dark:bg-white/[0.06]" />
              {/* Animated fill */}
              <motion.div
                className="absolute inset-y-0 left-0 h-px origin-left"
                initial={{ scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 1.4, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
                style={{ background: "linear-gradient(90deg, #3b82f6, #6366f1, #8b5cf6)", width: "100%" }}
              />
            </div>

            {[
              {
                n: "01", color: "#3b82f6", bg: "#eff6ff", borderColor: "#dbeafe",
                glowColor: "rgba(59,130,246,0.12)",
                title: "Create your room",
                desc: "Hit 'Enter app', name your session — a 6-digit room code generates instantly. Zero sign-up.",
                detail: "Takes under 10 seconds",
                Widget: RoomCodeWidget,
              },
              {
                n: "02", color: "#8b5cf6", bg: "#f5f3ff", borderColor: "#e9d5ff",
                glowColor: "rgba(139,92,246,0.10)",
                title: "Invite your buddy",
                desc: "Send the code over any chat. They paste it, press join — whiteboard and todos sync live.",
                detail: "No install needed",
                Widget: ShareWidget,
              },
              {
                n: "03", color: "#22c55e", bg: "#f0fdf4", borderColor: "#bbf7d0",
                glowColor: "rgba(34,197,94,0.10)",
                title: "Focus & finish",
                desc: "Run pomodoros together, track todos, draw — then get a full session summary.",
                detail: "Session summary included",
                Widget: PomodoroRing,
              },
            ].map(({ n, color, bg, borderColor, glowColor, title, desc, detail, Widget }, i) => (
              <motion.div key={n}
                initial={{ opacity: 0, y: 36 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.18, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                className="flex flex-col"
              >
                {/* Step circle — springs in, pulses once */}
                <div className="relative z-10 mb-5 flex items-center gap-3">
                  <motion.div
                    initial={{ scale: 0 }} whileInView={{ scale: 1 }} viewport={{ once: true }}
                    transition={{ delay: 0.15 + i * 0.18, type: "spring", stiffness: 360, damping: 18 }}
                    className="relative flex h-[54px] w-[54px] flex-shrink-0 items-center justify-center rounded-full border-[1.5px] font-mono text-[13px] font-bold"
                    style={{ background: bg, color, borderColor }}
                  >
                    {/* Pulse ring on enter */}
                    <motion.div
                      className="absolute inset-0 rounded-full"
                      initial={{ scale: 1, opacity: 0.6 }}
                      whileInView={{ scale: 1.6, opacity: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.4 + i * 0.18, duration: 0.7, ease: "easeOut" }}
                      style={{ background: color, borderRadius: "50%" }}
                    />
                    {n}
                  </motion.div>
                  <div>
                    <h3 className="text-[15px] font-bold text-[#0f0f0f] dark:text-white/85">{title}</h3>
                    <p className="text-[11px] text-[#9ca3af]">{detail}</p>
                  </div>
                </div>

                {/* Card */}
                <motion.div
                  whileHover={{ y: -5, boxShadow: `0 24px 56px ${glowColor}, 0 8px 24px rgba(0,0,0,0.06)` }}
                  transition={{ duration: 0.25 }}
                  className="flex flex-1 flex-col overflow-hidden rounded-[22px] border bg-white dark:bg-white/[0.03]"
                  style={{ borderColor, boxShadow: `0 4px 20px ${glowColor}, 0 2px 8px rgba(0,0,0,0.04)` }}
                >
                  {/* Gradient top accent */}
                  <div className="h-[3px] w-full" style={{ background: `linear-gradient(90deg, ${color}, ${color}55)` }} />

                  {/* Mini preview */}
                  <div className="border-b px-5 py-4" style={{ borderColor, background: `linear-gradient(180deg, ${bg} 0%, #ffffff 100%)` }}>
                    <Widget />
                  </div>

                  {/* Text */}
                  <div className="flex flex-1 flex-col p-5">
                    <p className="flex-1 text-[13px] leading-relaxed text-[#6b7280] dark:text-white/35">{desc}</p>
                    <div className="mt-4 flex items-center gap-1.5 rounded-[8px] px-3 py-2" style={{ background: bg }}>
                      <CheckCircle2 className="h-3.5 w-3.5 flex-shrink-0" style={{ color }} />
                      <span className="text-[11px] font-semibold" style={{ color }}>{detail}</span>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          PERKS — sticky left + feature grid right
      ══════════════════════════════════════════════════════════ */}
      <section className="relative z-10 overflow-hidden px-5 py-24">
        {/* Alternating gradient — soft blue left bloom */}
        <div aria-hidden className="pointer-events-none absolute -left-40 top-1/2 h-[500px] w-[500px] -translate-y-1/2 rounded-full bg-[#3b82f6]/[0.07] blur-[140px]" />
        <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-[1px]" style={{ background: "linear-gradient(90deg, transparent, rgba(59,130,246,0.18) 40%, transparent)" }} />
        <div className="mx-auto max-w-5xl">
          <div className="flex flex-col gap-16 lg:flex-row lg:items-start lg:gap-20">
            <motion.div initial={{ opacity: 0, x: -24 }} whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }} transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
              className="lg:sticky lg:top-24 lg:w-[38%] lg:flex-shrink-0"
            >
              <span className="inline-block rounded-[8px] border border-[#3b82f6]/20 bg-[#eff6ff] px-3.5 py-1 text-[11px] font-bold uppercase tracking-[0.14em] text-[#3b82f6] dark:bg-[#1e3a5f]/60">
                Under the hood
              </span>
              <h2 className="mt-4 font-display text-[32px] font-extrabold leading-[1.1] tracking-[-0.03em] text-[#0f0f0f] dark:text-white/90 sm:text-[40px]">
                Production-grade.<br />Student-first.
              </h2>
              <p className="mt-4 text-[15px] leading-relaxed text-[#6b7280] dark:text-white/35">
                Every feature is built to eliminate friction and keep you in flow — not fight with your tools.
              </p>
              <motion.button whileHover={{ scale: 1.04, boxShadow: "0 8px 24px rgba(59,130,246,0.38)" }}
                whileTap={{ scale: 0.96 }}
                onClick={() => router.push("/app")}
                className="mt-8 inline-flex items-center gap-2 rounded-[12px] bg-[#3b82f6] px-6 py-3 text-[14px] font-semibold text-white shadow-[0_4px_16px_rgba(59,130,246,0.3)]"
              >
                Try it free <ArrowRight className="h-4 w-4" />
              </motion.button>
            </motion.div>

            <motion.div variants={container} initial="hidden" whileInView="show"
              viewport={{ once: true, margin: "-60px" }}
              className="grid flex-1 grid-cols-12 gap-4"
            >
              {[
                { icon: Zap, color: "#f59e0b", bg: "#fffbeb", title: "Realtime sync", desc: "Whiteboard strokes, todos, and chat sync instantly — no refresh.", span: "col-span-12", featured: true },
                { icon: PictureInPicture2, color: "#3b82f6", bg: "#eff6ff", title: "Floating video", desc: "Draggable video window stays out of your way while you work.", span: "col-span-12 sm:col-span-6" },
                { icon: FileText, color: "#8b5cf6", bg: "#f5f3ff", title: "Shared notes", desc: "Both of you type and see — like a live Google Doc, just simpler.", span: "col-span-12 sm:col-span-6" },
                { icon: Lightbulb, color: "#ec4899", bg: "#fdf2f8", title: "Aha moments", desc: "Capture breakthroughs and lock learning into your session memory.", span: "col-span-12 sm:col-span-4" },
                { icon: Lock, color: "#22c55e", bg: "#f0fdf4", title: "Focus lock", desc: "Fullscreen timer mode hides distractions and keeps you on track.", span: "col-span-12 sm:col-span-4" },
                { icon: BarChart3, color: "#14b8a6", bg: "#f0fdfa", title: "Session summary", desc: "At the end, see everything you did — todos, ahas, and time spent.", span: "col-span-12 sm:col-span-4" },
              ].map(({ icon: Icon, bg, color, title, desc, span, featured }) => (
                <motion.div key={title} variants={item}
                  whileHover={{ y: -5, boxShadow: "0 18px 44px rgba(0,0,0,0.1)" }}
                  className={`${span} rounded-[20px] border border-black/[0.06] bg-white p-5 shadow-[0_4px_16px_rgba(0,0,0,0.06)] dark:border-white/[0.06] dark:bg-white/[0.03]`}
                  style={featured ? { backgroundImage: "linear-gradient(130deg, rgba(255,255,255,1), rgba(239,246,255,0.92))" } : undefined}
                >
                  <div className="mb-3 flex items-center justify-between">
                    <div className="inline-flex h-10 w-10 items-center justify-center rounded-[11px]" style={{ background: bg }}>
                      <Icon className="h-5 w-5" style={{ color }} />
                    </div>
                    {featured && (
                      <span className="rounded-full bg-[#dbeafe] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-[#1d4ed8]">
                        core
                      </span>
                    )}
                  </div>
                  <h4 className={`${featured ? "text-[22px]" : "text-[14px]"} font-bold text-[#0f0f0f] dark:text-white/85`}>{title}</h4>
                  <p className={`${featured ? "mt-2 text-[14px]" : "mt-1 text-[12px]"} leading-relaxed text-[#6b7280] dark:text-white/35`}>{desc}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          CTA BANNER — cinematic call-ending, light + blue
      ══════════════════════════════════════════════════════════ */}
      <section className="relative z-10 px-5 pb-24">
        <div className="mx-auto max-w-5xl">
          <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="relative overflow-hidden rounded-[32px] bg-white dark:bg-[#07070c]"
            style={{ boxShadow: "0 0 0 1px rgba(59,130,246,0.12), 0 40px 80px rgba(59,130,246,0.10), 0 8px 32px rgba(0,0,0,0.06)" }}
          >
            {/* Cinematic top-center blue spotlight */}
            <div aria-hidden className="pointer-events-none absolute -top-20 left-1/2 h-[320px] w-[700px] -translate-x-1/2 rounded-full bg-[#3b82f6]/[0.10] blur-[90px]" />
            {/* Left indigo bloom */}
            <div aria-hidden className="pointer-events-none absolute -left-24 top-1/2 h-[300px] w-[300px] -translate-y-1/2 rounded-full bg-[#6366f1]/[0.08] blur-[80px]" />
            {/* Bottom-right blue bloom */}
            <div aria-hidden className="pointer-events-none absolute -bottom-16 -right-16 h-[280px] w-[280px] rounded-full bg-[#3b82f6]/[0.07] blur-[70px]" />
            {/* Subtle dot grid */}
            <div aria-hidden className="pointer-events-none absolute inset-0"
              style={{ backgroundImage: "radial-gradient(circle, rgba(59,130,246,0.07) 1px, transparent 1px)", backgroundSize: "26px 26px" }} />
            {/* Top shimmer line */}
            <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-px"
              style={{ background: "linear-gradient(90deg, transparent 5%, rgba(59,130,246,0.5) 30%, rgba(99,102,241,0.4) 70%, transparent 95%)" }} />
            {/* Diagonal blue wash — call-ending cinematic feel */}
            <div aria-hidden className="pointer-events-none absolute inset-0"
              style={{ background: "linear-gradient(135deg, rgba(59,130,246,0.04) 0%, transparent 50%, rgba(99,102,241,0.04) 100%)" }} />

            <div className="relative flex flex-col items-center gap-10 px-8 py-14 lg:flex-row lg:items-center lg:gap-16 lg:px-14">
              {/* Left — text */}
              <div className="flex-1 text-center lg:text-left">
                <p className="font-mono text-[10px] font-bold uppercase tracking-[0.35em] text-[#3b82f6]">Ready to focus?</p>
                <h2 className="mt-3 font-display text-[30px] font-extrabold tracking-[-0.04em] text-[#0f0f0f] dark:text-white/90 sm:text-[40px]">
                  Studying alone<br />is overrated.
                </h2>
                <p className="mt-4 max-w-sm text-[15px] leading-relaxed text-[#6b7280] dark:text-white/40">
                  Open a room in 10 seconds. Guest mode works instantly; sign in unlocks your dashboard history.
                </p>
                <p className="mt-2 text-[12px] text-[#9ca3af] dark:text-white/30">
                  Demo preview: landing visuals simulate features. Full interactions happen inside the app.
                </p>
                <div className="mt-8 flex flex-wrap justify-center gap-3 lg:justify-start">
                  <motion.button
                    whileHover={{ scale: 1.05, boxShadow: "0 0 40px -8px rgba(59,130,246,0.7)" }}
                    whileTap={{ scale: 0.96 }}
                    onClick={() => router.push("/app")}
                    className="inline-flex items-center gap-2 rounded-[12px] bg-[#3b82f6] px-7 py-3 text-[15px] font-bold text-white shadow-[0_4px_20px_rgba(59,130,246,0.35),inset_0_1px_0_rgba(255,255,255,0.2)]"
                  >
                    Enter the app <ArrowRight className="h-4 w-4" />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.03, backgroundColor: "#f0f7ff" }} whileTap={{ scale: 0.96 }}
                    onClick={() => router.push("/rooms")}
                    className="inline-flex items-center gap-2 rounded-[12px] border border-[#3b82f6]/20 bg-white px-7 py-3 text-[15px] font-semibold text-[#374151] transition-colors dark:border-white/10 dark:bg-white/[0.04] dark:text-white/55"
                  >
                    Browse rooms
                  </motion.button>
                </div>
              </div>

              {/* Right — session summary card, cinematic call-ending receipt */}
              <motion.div
                initial={{ opacity: 0, scale: 0.88, y: 16 }}
                whileInView={{ opacity: 1, scale: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.22, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                className="w-full max-w-[270px] flex-shrink-0 overflow-hidden rounded-[22px] border border-[#dbeafe] dark:border-white/[0.07]"
                style={{ background: "linear-gradient(160deg, #ffffff 0%, #f0f7ff 60%, #ede9fe 100%)", boxShadow: "0 8px 40px rgba(59,130,246,0.14), 0 2px 8px rgba(0,0,0,0.04)" }}
              >
                {/* Card top — blue tint header */}
                <div className="border-b border-[#dbeafe]/70 bg-gradient-to-r from-[#eff6ff] to-[#f5f3ff] px-5 py-4 dark:border-white/[0.06] dark:bg-white/[0.04]">
                  <div className="flex items-center justify-between">
                    <p className="text-[12px] font-bold text-[#0f0f0f] dark:text-white/85">Session complete 🎉</p>
                    <span className="rounded-[6px] bg-[#dcfce7] px-2 py-0.5 text-[10px] font-bold text-[#16a34a] dark:bg-[#22c55e]/15 dark:text-[#4ade80]">Done</span>
                  </div>
                  <p className="mt-1 font-mono text-[9px] text-[#9ca3af] dark:text-white/25">Meet&Study · 2026-05-04</p>
                </div>

                {/* Stats */}
                <div className="space-y-0 px-5 py-4">
                  {[
                    { label: "Focus time", val: "1h 32m", color: "#3b82f6", bg: "#eff6ff" },
                    { label: "Todos done", val: "7 / 8", color: "#16a34a", bg: "#f0fdf4" },
                    { label: "Aha moments", val: "3", color: "#d97706", bg: "#fffbeb" },
                    { label: "Pomodoros", val: "4", color: "#7c3aed", bg: "#f5f3ff" },
                  ].map(({ label, val, color, bg }) => (
                    <div key={label} className="flex items-center justify-between border-b border-[#f3f4f6] py-2.5 last:border-0 dark:border-white/[0.04]">
                      <span className="text-[12px] text-[#6b7280] dark:text-white/35">{label}</span>
                      <span className="rounded-[6px] px-2 py-0.5 text-[12px] font-bold" style={{ color, background: bg }}>{val}</span>
                    </div>
                  ))}
                </div>

                {/* Cinematic footer — faint blue line */}
                <div className="h-[3px] w-full" style={{ background: "linear-gradient(90deg, #3b82f6, #6366f1, #8b5cf6)" }} />
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          FOOTER — light, rounded top corners, blue glow sphere
      ══════════════════════════════════════════════════════════ */}
      <footer className="relative z-10 overflow-hidden rounded-t-[48px] bg-gradient-to-b from-[#f0f7ff] via-[#eef5ff] to-[#e8f1ff] px-6 pb-14 pt-16 shadow-[0_-20px_80px_rgba(59,130,246,0.14)] dark:bg-[#07070c]">
        <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-transparent via-[#3b82f6] to-transparent shadow-[0_0_24px_rgba(59,130,246,0.9)]" />
        <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-[220px] bg-gradient-to-b from-[#bfdbfe]/55 via-[#dbeafe]/35 to-transparent" />
        {/* Blue glow sphere — back-left */}
        <div aria-hidden className="pointer-events-none absolute -left-20 -top-20 h-[420px] w-[420px] rounded-full bg-[#3b82f6]/[0.09] blur-[120px]" />
        {/* Indigo glow — bottom-right */}
        <div aria-hidden className="pointer-events-none absolute -right-16 bottom-0 h-[300px] w-[300px] rounded-full bg-[#6366f1]/[0.07] blur-[100px]" />
        {/* Dot grid overlay */}
        <div aria-hidden className="pointer-events-none absolute inset-0"
          style={{ backgroundImage: "radial-gradient(circle, rgba(59,130,246,0.06) 1px, transparent 1px)", backgroundSize: "28px 28px" }} />
        {/* Top blue gradient line */}
        <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-px"
          style={{ background: "linear-gradient(90deg, transparent 5%, rgba(59,130,246,0.4) 30%, rgba(99,102,241,0.3) 70%, transparent 95%)" }} />

        <div className="relative mx-auto max-w-5xl">
          <div className="grid grid-cols-2 gap-10 lg:grid-cols-4">

            <div className="col-span-2 lg:col-span-1">
              <div className="flex items-center gap-2.5">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/logo.png" alt="Meet&Study" className="h-8 w-8 rounded-lg object-contain" />
                <span className="font-display text-[16px] font-bold text-[#0f0f0f] dark:text-white/75">Meet&Study</span>
              </div>
              <p className="mt-3 text-[13px] leading-relaxed text-[#6b7280] dark:text-white/30">
                The focus room for students who study better together.
              </p>
              <div className="mt-5 flex gap-2">
                <motion.a
                  whileHover={{ scale: 1.12, y: -2 }}
                  href="https://x.com"
                  target="_blank"
                  rel="noreferrer"
                  aria-label="X"
                  className="flex h-8 w-8 items-center justify-center rounded-[8px] bg-[#f3f4f6] text-[#374151] transition-colors hover:bg-[#e5e7eb] dark:bg-white/[0.06] dark:text-white/35"
                >
                  <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-current" aria-hidden>
                    <path d="M18.9 2H22l-6.8 7.8L23 22h-6.6l-5.2-6.7L5.4 22H2.3l7.2-8.2L1 2h6.7l4.7 6.1L18.9 2Zm-1.1 18h1.8L6.8 3.9H5l12.8 16.1Z" />
                  </svg>
                </motion.a>
                <motion.a
                  whileHover={{ scale: 1.12, y: -2 }}
                  href="https://github.com"
                  target="_blank"
                  rel="noreferrer"
                  aria-label="GitHub"
                  className="flex h-8 w-8 items-center justify-center rounded-[8px] bg-[#f3f4f6] text-[#374151] transition-colors hover:bg-[#e5e7eb] dark:bg-white/[0.06] dark:text-white/35"
                >
                  <Github className="h-3.5 w-3.5" />
                </motion.a>
                <motion.a
                  whileHover={{ scale: 1.12, y: -2 }}
                  href="https://discord.com"
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Discord"
                  className="flex h-8 w-8 items-center justify-center rounded-[8px] bg-[#f3f4f6] text-[#374151] transition-colors hover:bg-[#e5e7eb] dark:bg-white/[0.06] dark:text-white/35"
                >
                  <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-current" aria-hidden>
                    <path d="M20.3 4.4A18 18 0 0 0 15.8 3l-.2.4c1.9.5 2.8 1.2 3.3 1.6a12.2 12.2 0 0 0-3-.9c-.1 0-.2 0-.3.1-.4.3-.8.8-1 1.2a13.7 13.7 0 0 0-5.2 0c-.2-.4-.6-.9-1-1.2 0-.1-.2-.1-.3-.1-1 .2-2 .5-3 .9.5-.4 1.4-1.1 3.3-1.6L8.2 3c-1.6.3-3.1.8-4.5 1.4C.9 8.7.2 13 .5 17.2c0 .1 0 .2.1.3a18.3 18.3 0 0 0 5.5 2.8c.1 0 .2 0 .3-.1.4-.6.8-1.2 1.1-1.9-1.1-.4-1.5-.8-2.1-1.2.2-.2.3-.3.5-.5a10.8 10.8 0 0 0 9.2 0c.2.2.3.3.5.5-.6.4-1 .8-2.1 1.2.3.7.7 1.3 1.1 1.9.1.1.2.1.3.1a18.2 18.2 0 0 0 5.5-2.8c.1-.1.1-.2.1-.3.4-4.8-.8-9-3.6-12.8ZM9.5 14.6c-1 0-1.8-.9-1.8-2s.8-2 1.8-2 1.8.9 1.8 2-.8 2-1.8 2Zm5 0c-1 0-1.8-.9-1.8-2s.8-2 1.8-2 1.8.9 1.8 2-.8 2-1.8 2Z" />
                  </svg>
                </motion.a>
              </div>
            </div>

            <div>
              <p className="mb-4 text-[11px] font-bold uppercase tracking-[0.1em] text-[#9ca3af] dark:text-white/22">Product</p>
              <ul className="space-y-3">
                {["Enter the app", "Browse rooms", "Create a room", "How it works"].map((l) => (
                  <li key={l}>
                    <motion.button whileHover={{ x: 3 }}
                      onClick={l.includes("app") ? () => router.push("/app") : l.includes("rooms") || l.includes("room") ? () => router.push("/rooms") : undefined}
                      className="text-[13px] text-[#6b7280] transition-colors hover:text-[#0f0f0f] dark:text-white/32 dark:hover:text-white/70"
                    >
                      {l}
                    </motion.button>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <p className="mb-4 text-[11px] font-bold uppercase tracking-[0.1em] text-[#9ca3af] dark:text-white/22">Features</p>
              <ul className="space-y-3">
                {["Video call", "Whiteboard", "Pomodoro timer", "Shared todos", "Live chat", "Session summary"].map((l) => (
                  <li key={l}>
                    <span className="text-[13px] text-[#6b7280] dark:text-white/32">{l}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <p className="mb-4 text-[11px] font-bold uppercase tracking-[0.1em] text-[#9ca3af] dark:text-white/22">Info</p>
              <ul className="space-y-3">
                {["No sign-up needed", "Open source", "Built for students", "Completely free", "Privacy first"].map((l) => (
                  <li key={l}>
                    <span className="text-[13px] text-[#6b7280] dark:text-white/32">{l}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mt-14 flex flex-wrap items-center justify-between gap-4 border-t border-black/[0.05] pt-8 dark:border-white/[0.07]">
            <p className="text-[12px] text-[#9ca3af] dark:text-white/22">&copy; 2026 Meet&Study. No rights reserved — share freely.</p>
            <div className="flex items-center gap-1.5">
              <span className="inline-block h-2 w-2 rounded-full bg-[#22c55e] shadow-[0_0_6px_rgba(34,197,94,0.6)]" />
              <span className="text-[12px] text-[#6b7280] dark:text-white/28">All systems operational</span>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
