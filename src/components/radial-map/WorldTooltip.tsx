"use client";

import { motion } from "framer-motion";
import type { World, Quest } from "@/types/domain";
import { getStatusLabel } from "@/domain/models/world";

interface WorldTooltipProps {
  world: World;
  moves: Quest[];
  xPercent: number;
  yPercent: number;
}

export function WorldTooltip({ world, moves, xPercent, yPercent }: WorldTooltipProps) {
  // Keep the tooltip inside the map; flip sides past the midline.
  const onRight = xPercent < 55;
  const top = Math.min(80, Math.max(6, yPercent - 6));

  return (
    <motion.div
      className="absolute z-40 pointer-events-none"
      style={{
        left: `${xPercent}%`,
        top: `${top}%`,
        transform: `translate(${onRight ? "12px" : "calc(-100% - 12px)"}, -10%)`,
      }}
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.12 }}
    >
      <div className="cyber-panel-raised p-3 w-60 shadow-lg">
        <div className="flex items-center gap-2 mb-2">
          <span
            className="w-2.5 h-2.5 rounded-full shrink-0"
            style={{ backgroundColor: world.color }}
          />
          <span className="text-sm font-semibold text-text-primary truncate">
            {world.name}
          </span>
          <span className="ml-auto text-[10px] text-text-muted uppercase tracking-wide">
            {getStatusLabel(world.status)}
          </span>
        </div>

        <p className="text-[10px] uppercase tracking-wider text-text-muted mb-1.5">
          Next up
        </p>
        {moves.length === 0 ? (
          <p className="text-xs text-text-secondary italic">
            Nothing queued — click to add tasks.
          </p>
        ) : (
          <ul className="space-y-1.5">
            {moves.slice(0, 4).map((q) => (
              <li key={q.id} className="flex items-start gap-2 text-xs">
                <span
                  className="mt-1 w-1.5 h-1.5 rounded-full shrink-0"
                  style={{ backgroundColor: world.color }}
                />
                <span className="text-text-secondary leading-snug">
                  {q.nextMove?.trim() || q.title}
                </span>
              </li>
            ))}
          </ul>
        )}
        {moves.length > 4 && (
          <p className="mt-1.5 text-[10px] text-text-muted">
            +{moves.length - 4} more — click to open
          </p>
        )}
      </div>
    </motion.div>
  );
}
