"use client";

import { cn } from "@/lib/utils";
import { InputHTMLAttributes, forwardRef } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  isPill?: boolean;
  label?: string;
  error?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, isPill = true, label, error, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="mb-2 block text-caption-strong text-ink-muted">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={cn(
            "w-full bg-white text-ink placeholder:text-ink-muted",
            "dark:bg-cursor-surface dark:text-ink-dark-primary dark:placeholder:text-ink-dark-tertiary",
            "border border-divider-hairline dark:border-cursor-border",
            "focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-primary-soft focus:border-transparent",
            "dark:focus:bg-cursor-elevated",
            "transition-all duration-200 shadow-soft",
            isPill ? "rounded-full" : "rounded-lg",
            "px-4 py-2.5 text-body",
            error && "border-accent-red focus:ring-accent-red",
            className
          )}
          {...props}
        />
        {error && (
          <p className="mt-1.5 text-fine-print text-accent-red">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

export { Input };
