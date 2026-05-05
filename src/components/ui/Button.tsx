"use client";

import { cn } from "@/lib/utils";
import { ButtonHTMLAttributes, forwardRef } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "dark" | "pearl";
  size?: "sm" | "md" | "lg";
  isPill?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", isPill = false, children, ...props }, ref) => {
    const baseStyles =
      "inline-flex items-center justify-center font-sans font-medium transition-all duration-200 btn-press disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100";
    
    const variants = {
      primary: cn(
        "bg-primary text-white shadow-soft",
        "hover:bg-primary-focus hover:shadow-card",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-focus focus-visible:ring-offset-2",
        "dark:focus-visible:ring-offset-cursor-surface"
      ),
      secondary: cn(
        "bg-white text-primary border border-primary/30",
        "hover:bg-primary/5 hover:border-primary/50",
        "dark:hover:bg-primary/10",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
        "dark:focus-visible:ring-offset-cursor-surface"
      ),
      ghost: cn(
        "bg-transparent text-ink",
        "hover:bg-surface-muted",
        "dark:text-ink-dark-primary dark:hover:bg-cursor-hover"
      ),
      dark: cn(
        "bg-cursor-elevated text-white border border-cursor-border",
        "hover:bg-cursor-hover hover:border-cursor-border-hover",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-muted focus-visible:ring-offset-2",
        "dark:focus-visible:ring-offset-cursor-surface"
      ),
      pearl: cn(
        "bg-canvas-parchment text-ink border border-divider-soft",
        "hover:bg-surface-muted",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-divider-hairline focus-visible:ring-offset-2"
      ),
    };

    const sizes = {
      sm: cn(
        "rounded-lg",
        "px-3 py-2 text-caption"
      ),
      md: cn(
        "rounded-lg",
        "px-4 py-2.5 text-body"
      ),
      lg: cn(
        "rounded-lg",
        "px-6 py-3 text-body-strong"
      ),
    };

    return (
      <button
        ref={ref}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";

export { Button };
