"use client";

import { cn } from "@/lib/utils";

interface ToggleProps {
  options: { value: string; label: string }[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

const Toggle = ({ options, value, onChange, className }: ToggleProps) => {
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-pill border border-divider-hairline bg-surface-muted p-1 dark:border-cursor-border dark:bg-cursor-elevated",
        className
      )}
    >
      {options.map((option) => (
        <button
          key={option.value}
          onClick={() => onChange(option.value)}
          className={cn(
            "btn-press rounded-pill px-4 py-2 text-caption-strong transition-all duration-150",
            value === option.value
              ? "bg-white text-ink shadow-soft dark:bg-cursor-active dark:text-ink-dark-primary"
              : "text-ink-muted hover:text-ink dark:text-ink-dark-tertiary dark:hover:text-ink-dark-primary"
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
};

export { Toggle };
