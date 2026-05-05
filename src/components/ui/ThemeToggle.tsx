"use client";

import { cn } from "@/lib/utils";
import { Sun, Moon } from "lucide-react";
import { useStore } from "@/store/useStore";

interface ThemeToggleProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  variant?: "default" | "navbar";
}

const ThemeToggle = ({ className, size = "md", variant = "default" }: ThemeToggleProps) => {
  const { theme, toggleTheme } = useStore();

  const sizes = {
    sm: "w-8 h-8",
    md: "w-9 h-9",
    lg: "w-12 h-12",
  };

  const iconSizes = {
    sm: 16,
    md: 18,
    lg: 24,
  };

  const isNavbar = variant === "navbar";

  return (
    <button
      onClick={toggleTheme}
      className={cn(
        "flex items-center justify-center",
        isNavbar ? "rounded-lg" : "rounded-full",
        isNavbar 
          ? "hover:bg-black/5 dark:hover:bg-white/10" 
          : "bg-canvas-parchment border border-divider-hairline shadow-soft dark:bg-cursor-surface dark:border-cursor-border hover:bg-surface-muted dark:hover:bg-cursor-hover",
        "transition-all duration-200",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-focus dark:focus-visible:ring-primary-muted",
        sizes[size],
        className
      )}
      aria-label={theme === "light" ? "Switch to dark mode" : "Switch to light mode"}
    >
      {theme === "light" ? (
        <Sun size={iconSizes[size]} className={isNavbar ? "text-[#6b7280]" : "text-primary"} />
      ) : (
        <Moon size={iconSizes[size]} className={isNavbar ? "text-white/60" : "text-ink-dark-primary"} />
      )}
    </button>
  );
};

export { ThemeToggle };
