"use client";

import { cn } from "@/lib/utils/cn";

interface BadgeProps {
  children: React.ReactNode;
  color?: string;
  variant?: "filled" | "outline";
  className?: string;
}

export function Badge({
  children,
  color = "#3B82F6",
  variant = "outline",
  className,
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded",
        variant === "filled"
          ? "text-white"
          : "border",
        className
      )}
      style={{
        backgroundColor: variant === "filled" ? color : `${color}15`,
        borderColor: variant === "outline" ? `${color}60` : undefined,
        color: variant === "outline" ? color : undefined,
      }}
    >
      {children}
    </span>
  );
}
