"use client";

import { cn } from "@/lib/utils/cn";
import type { HTMLAttributes } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "raised" | "interactive";
  cornerMarks?: boolean;
}

export function Card({
  className,
  variant = "default",
  cornerMarks = false,
  children,
  ...props
}: CardProps) {
  return (
    <div
      className={cn(
        "rounded p-4",
        {
          default: "cyber-panel",
          raised: "cyber-panel-raised",
          interactive:
            "cyber-panel hover:border-core-blue/40 hover:bg-bg-panel-hover transition-colors cursor-pointer",
        }[variant],
        cornerMarks && "corner-marks",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "flex items-center justify-between mb-3 pb-2 border-b border-border-subtle",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardTitle({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={cn(
        "text-sm font-semibold font-[family-name:var(--font-pixel)] text-text-primary uppercase tracking-wider",
        className
      )}
      {...props}
    >
      {children}
    </h3>
  );
}
