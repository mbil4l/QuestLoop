"use client";

import { motion } from "framer-motion";
import { useNotesStore } from "@/lib/stores/notes-store";

const TEMPLATES: { label: string; body: string }[] = [
  {
    label: "Todo list",
    body: ["# To-do", "- [ ] ", "- [ ] ", "- [ ] "].join("\n"),
  },
  {
    label: "Cornell Method",
    body: [
      "CORNELL NOTES — Topic: ",
      "",
      "Cues / Questions        | Notes",
      "------------------------|------------------------------",
      "                        | ",
      "                        | ",
      "                        | ",
      "",
      "Summary:",
      "",
    ].join("\n"),
  },
  {
    label: "Outline",
    body: [
      "OUTLINE",
      "I. Main topic",
      "   A. Subpoint",
      "      1. Detail",
      "   B. Subpoint",
      "II. Main topic",
      "   A. Subpoint",
    ].join("\n"),
  },
  {
    label: "Charting Method",
    body: [
      "CHART",
      "| Category | Detail | Detail | Detail |",
      "| -------- | ------ | ------ | ------ |",
      "|          |        |        |        |",
      "|          |        |        |        |",
    ].join("\n"),
  },
  {
    label: "Boxing Method",
    body: [
      "BOXING METHOD",
      "",
      "┌─ Box 1 ─────────────────────┐",
      "│                             │",
      "└─────────────────────────────┘",
      "",
      "┌─ Box 2 ─────────────────────┐",
      "│                             │",
      "└─────────────────────────────┘",
    ].join("\n"),
  },
];

export function NotesPanel({ onClose }: { onClose: () => void }) {
  const homeNotes = useNotesStore((s) => s.homeNotes);
  const setHomeNotes = useNotesStore((s) => s.setHomeNotes);

  function insertTemplate(body: string) {
    setHomeNotes(homeNotes.trim() ? `${homeNotes.trimEnd()}\n\n${body}` : body);
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
      <motion.aside
        className="fixed right-0 top-0 z-50 h-full w-full max-w-md bg-bg-panel border-l border-border-subtle shadow-xl flex flex-col"
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", stiffness: 320, damping: 34 }}
        role="dialog"
        aria-label="Notes"
      >
        <div className="p-4 border-b border-border-subtle flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span aria-hidden="true">📝</span>
            <h2 className="text-base font-semibold text-text-primary">Notes</h2>
          </div>
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="p-1.5 rounded text-text-muted hover:text-text-primary hover:bg-bg-panel-hover"
          >
            ✕
          </button>
        </div>

        <div className="px-4 pt-3">
          <p className="text-[11px] uppercase tracking-wider text-text-muted mb-1.5">
            Insert a template
          </p>
          <div className="flex flex-wrap gap-1.5">
            {TEMPLATES.map((t) => (
              <button
                key={t.label}
                type="button"
                onClick={() => insertTemplate(t.body)}
                className="px-2.5 h-7 rounded-full text-xs border border-border-subtle text-text-secondary hover:text-text-primary hover:bg-bg-panel-hover transition-colors"
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 p-4">
          <textarea
            autoFocus
            value={homeNotes}
            onChange={(e) => setHomeNotes(e.target.value)}
            placeholder="A scratchpad for anything that doesn't belong to a single world yet…"
            className="w-full h-full resize-none rounded-lg bg-bg-panel-raised border border-border-subtle p-3 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-border-active leading-relaxed font-mono"
          />
        </div>
      </motion.aside>
    </>
  );
}
