"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useWorldStore } from "@/lib/stores/world-store";
import { WORLD_COLORS } from "@/lib/config";

const SWATCHES = Array.from(new Set(Object.values(WORLD_COLORS)));

export function AddWorldModal({ onClose }: { onClose: () => void }) {
  const worlds = useWorldStore((s) => s.worlds);
  const createWorld = useWorldStore((s) => s.createWorld);
  const selectWorld = useWorldStore((s) => s.selectWorld);

  const [name, setName] = useState("");
  const [color, setColor] = useState(SWATCHES[0]);

  function create() {
    const trimmed = name.trim() || "New World";
    const id = createWorld({
      userId: "demo-user-001",
      name: trimmed,
      purpose: "",
      color,
      icon: "star",
      status: "SECONDARY",
      weeklyTargetMinutes: 120,
      preferredCadence: "weekly",
      demandType: "DEEP_THINKING",
      importance: 3,
      health: 60,
      sortOrder: worlds.length,
      pauseReason: null,
      resumeReviewAt: null,
      resumeCondition: null,
    });
    onClose();
    // Open the new world's list so the user can customise right away.
    selectWorld(id);
  }

  return (
    <>
      <motion.div
        className="fixed inset-0 z-40 bg-text-primary/10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      />
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
      >
        <div className="cyber-panel-raised w-full max-w-sm p-5 pointer-events-auto shadow-xl">
          <h2 className="text-base font-semibold text-text-primary mb-4">
            New world
          </h2>

          <label className="block text-xs uppercase tracking-wide text-text-muted mb-1">
            Name
          </label>
          <input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && create()}
            placeholder="e.g. Fitness, Side Project…"
            className="w-full h-9 px-3 text-sm rounded-lg bg-bg-deep border border-border-subtle text-text-primary placeholder:text-text-muted focus:outline-none focus:border-border-active"
          />

          <label className="block text-xs uppercase tracking-wide text-text-muted mt-4 mb-2">
            Color
          </label>
          <div className="grid grid-cols-6 gap-2">
            {SWATCHES.map((c) => (
              <button
                key={c}
                type="button"
                aria-label={`Color ${c}`}
                onClick={() => setColor(c)}
                className="w-7 h-7 rounded-full transition-transform"
                style={{
                  backgroundColor: c,
                  outline: c === color ? `2px solid ${c}` : "none",
                  outlineOffset: 2,
                  transform: c === color ? "scale(1.1)" : undefined,
                }}
              />
            ))}
          </div>

          <div className="flex justify-end gap-2 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="h-9 px-4 rounded-lg text-sm text-text-secondary hover:bg-bg-panel-hover"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={create}
              className="h-9 px-4 rounded-lg text-sm font-medium text-white"
              style={{ backgroundColor: color }}
            >
              Create
            </button>
          </div>
        </div>
      </motion.div>
    </>
  );
}
