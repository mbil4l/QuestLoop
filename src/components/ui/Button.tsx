"use client";

import { cn } from "@/lib/utils/cn";
import { forwardRef, type ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center font-medium transition-all duration-200",
          "focus-visible:outline-2 focus-visible:outline-focus-ring focus-visible:outline-offset-2",
          "disabled:opacity-50 disabled:pointer-events-none",
          {
            primary:
              "bg-core-blue text-white hover:bg-core-blue/90 glow-blue",
            secondary:
              "bg-bg-panel-raised text-text-primary border border-border-subtle hover:border-core-blue/50 hover:bg-bg-panel-hover",
            ghost:
              "text-text-secondary hover:text-text-primary hover:bg-bg-panel-raised",
            danger:
              "bg-danger-muted/20 text-danger-muted border border-danger-muted/30 hover:bg-danger-muted/30",
          }[variant],
          {
            sm: "h-7 px-3 text-xs rounded",
            md: "h-9 px-4 text-sm rounded",
            lg: "h-11 px-6 text-base rounded",
          }[size],
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";
