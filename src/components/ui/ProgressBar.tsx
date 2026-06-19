"use client";

import { cn } from "@/lib/utils/cn";
import { motion } from "framer-motion";

interface ProgressBarProps {
  value: number;
  max?: number;
  color?: string;
  height?: number;
  showLabel?: boolean;
  label?: string;
  className?: string;
  segmented?: boolean;
}

export function ProgressBar({
  value,
  max = 100,
  color = "var(--color-core-blue)",
  height = 6,
  showLabel = false,
  label,
  className,
  segmented = false,
}: ProgressBarProps) {
  const percent = Math.min(100, Math.max(0, (value / max) * 100));
  const segments = segmented ? 20 : 0;

  return (
    <div className={cn("w-full", className)}>
      {showLabel && (
        <div className="flex justify-between items-center mb-1">
          <span className="text-[10px] text-text-secondary uppercase tracking-wider">
            {label}
          </span>
          <span className="text-[10px] font-mono text-text-secondary">
            {Math.round(percent)}%
          </span>
        </div>
      )}
      <div
        className="w-full rounded-sm overflow-hidden bg-bg-deep border border-border-subtle"
        style={{ height }}
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-label={label ?? "Progress"}
      >
        <motion.div
          className="h-full rounded-sm relative"
          style={{
            background: segmented
              ? `repeating-linear-gradient(90deg, ${color} 0px, ${color} ${100 / segments - 0.5}%, transparent ${100 / segments - 0.5}%, transparent ${100 / segments}%)`
              : color,
          }}
          initial={{ width: 0 }}
          animate={{ width: `${percent}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
      </div>
    </div>
  );
}
