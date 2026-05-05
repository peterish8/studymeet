"use client";

import { cn } from "@/lib/utils";
import { HTMLAttributes, forwardRef } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "utility" | "dark" | "parchment";
  isInteractive?: boolean;
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = "default", isInteractive = false, children, ...props }, ref) => {
    const variants = {
      default: cn(
        "rounded-xl border border-divider-hairline bg-white p-6 shadow-soft dark:border-cursor-border dark:bg-cursor-surface",
        "dark:text-ink-dark-primary"
      ),
      utility: cn(
        "rounded-xl border border-divider-hairline bg-white p-6 shadow-soft dark:border-cursor-border dark:bg-cursor-surface",
        "dark:text-ink-dark-primary",
        isInteractive &&
          "transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-card dark:hover:border-cursor-border-hover"
      ),
      dark: cn(
        "rounded-none border border-cursor-border bg-cursor-surface text-white",
        "py-section px-6"
      ),
      parchment: cn(
        "rounded-none bg-canvas-parchment dark:bg-cursor-elevated",
        "py-section px-6"
      ),
    };

    return (
      <div
        ref={ref}
        className={cn(variants[variant], className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = "Card";

export { Card };
