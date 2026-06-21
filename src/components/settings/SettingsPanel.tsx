"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useUIStore } from "@/lib/stores/ui-store";
import { useWorldStore } from "@/lib/stores/world-store";
import { useQuestStore } from "@/lib/stores/quest-store";
import { useNotesStore } from "@/lib/stores/notes-store";
import { useProfileStore } from "@/lib/stores/profile-store";
import { useCircleStore } from "@/lib/stores/circle-store";
import { clearAccount, readCircleData } from "@/lib/account";
import {
  buildMarkdown,
  buildAllCirclesMarkdown,
  downloadMarkdown,
  slugify,
  type CircleExport,
  type ExportProfile,
} from "@/lib/export/markdown";
import type { Quest, Objective, Ritual } from "@/types/domain";

function currentProfile(): ExportProfile {
  const p = useProfileStore.getState();
  return {
    displayName: p.displayName,
    occupation: p.occupation,
    emoji: p.emoji,
    city: p.city,
    region: p.region,
    countryCode: p.countryCode,
  };
}

function gatherActiveCircle(): CircleExport {
  const active = useCircleStore.getState().getActiveCircle();
  const w = useWorldStore.getState();
  const q = useQuestStore.getState();
  const n = useNotesStore.getState();
  return {
    name: active?.name ?? "My Goals",
    worlds: w.worlds,
    quests: q.quests,
    objectives: q.objectives,
    rituals: q.rituals,
    homeNotes: n.homeNotes,
    worldNotes: n.worldNotes,
  };
}

export function SettingsPanel({ onClose }: { onClose: () => void }) {
  const prefs = useUIStore((s) => s.listPrefs);
  const setListPref = useUIStore((s) => s.setListPref);
  const reset = useUIStore((s) => s.resetListPrefs);
  const circleCount = useCircleStore((s) => s.circles.length);
  const [confirmingClear, setConfirmingClear] = useState(false);
  const [exporting, setExporting] = useState(false);

  function exportActive() {
    const c = gatherActiveCircle();
    downloadMarkdown(`questloop-${slugify(c.name)}`, buildMarkdown(c, currentProfile()));
  }

  async function exportAll() {
    setExporting(true);
    try {
      const { circles, activeCircleId } = useCircleStore.getState();
      const exports: CircleExport[] = [];
      for (const circle of circles) {
        if (circle.id === activeCircleId) {
          exports.push(gatherActiveCircle());
          continue;
        }
        const d = await readCircleData(circle.id);
        exports.push({
          name: circle.name,
          worlds: d.worlds,
          quests: d.quests as Quest[],
          objectives: d.objectives as Objective[],
          rituals: d.rituals as Ritual[],
          homeNotes: d.homeNotes,
          worldNotes: d.worldNotes,
        });
      }
      downloadMarkdown(
        "questloop-all-circles",
        buildAllCirclesMarkdown(exports, currentProfile())
      );
    } finally {
      setExporting(false);
    }
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
        aria-label="Settings"
      >
        <div className="p-4 border-b border-border-subtle flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span aria-hidden="true">⚙</span>
            <h2 className="text-base font-semibold text-text-primary">Settings</h2>
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

        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          <p className="text-xs text-text-secondary">
            These apply to every world&apos;s task list.
          </p>

          <section>
            <h3 className="text-xs uppercase tracking-wider text-text-muted mb-2">
              Show fields
            </h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              {(
                [
                  ["showNextMove", "Next move"],
                  ["showDue", "Due date"],
                  ["showEstimate", "Estimate"],
                  ["showImportance", "Importance"],
                ] as const
              ).map(([key, label]) => (
                <label key={key} className="flex items-center gap-2 text-text-secondary">
                  <input
                    type="checkbox"
                    checked={prefs[key]}
                    onChange={(e) => setListPref(key, e.target.checked)}
                  />
                  {label}
                </label>
              ))}
            </div>
          </section>

          <section>
            <h3 className="text-xs uppercase tracking-wider text-text-muted mb-2">
              View
            </h3>
            <label className="flex items-center gap-2 text-sm text-text-secondary">
              <input
                type="checkbox"
                checked={prefs.hideCompleted}
                onChange={(e) => setListPref("hideCompleted", e.target.checked)}
              />
              Hide completed tasks
            </label>
            <label className="flex items-center gap-2 text-sm text-text-secondary mt-2">
              <input
                type="checkbox"
                checked={prefs.density === "compact"}
                onChange={(e) =>
                  setListPref("density", e.target.checked ? "compact" : "comfortable")
                }
              />
              Compact rows
            </label>
          </section>

          <section>
            <h3 className="text-xs uppercase tracking-wider text-text-muted mb-2">
              Export
            </h3>
            <p className="text-xs text-text-muted mb-3">
              Download a structured Markdown backup of your worlds, quests,
              objectives, rituals, and notes.
            </p>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={exportActive}
                className="h-9 px-4 rounded-lg text-sm font-medium text-white"
                style={{ backgroundColor: "var(--color-core-blue)" }}
              >
                ⬇ This circle (.md)
              </button>
              {circleCount > 1 && (
                <button
                  type="button"
                  onClick={exportAll}
                  disabled={exporting}
                  className="h-9 px-4 rounded-lg text-sm text-text-secondary border border-border-subtle hover:text-text-primary transition-colors disabled:opacity-50"
                >
                  {exporting ? "Exporting…" : "⬇ All circles (.md)"}
                </button>
              )}
            </div>
          </section>

          <section>
            <h3 className="text-xs uppercase tracking-wider text-red-500/80 mb-2">
              Danger zone
            </h3>
            <p className="text-xs text-text-muted mb-3">
              Permanently removes every world, task, and note from this browser.
              This can&apos;t be undone.
            </p>
            {confirmingClear ? (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    clearAccount();
                    setConfirmingClear(false);
                    onClose();
                  }}
                  className="h-9 px-4 rounded-lg text-sm font-medium text-white bg-red-600 hover:bg-red-700 transition-colors"
                >
                  Yes, clear everything
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmingClear(false)}
                  className="h-9 px-4 rounded-lg text-sm text-text-secondary border border-border-subtle hover:text-text-primary transition-colors"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setConfirmingClear(true)}
                className="h-9 px-4 rounded-lg text-sm font-medium text-red-600 border border-red-500/40 hover:bg-red-500/10 transition-colors"
              >
                Clear all data
              </button>
            )}
          </section>
        </div>

        <div className="p-4 border-t border-border-subtle">
          <button
            type="button"
            onClick={reset}
            className="text-xs text-text-muted hover:text-text-primary transition-colors"
          >
            Reset to defaults
          </button>
        </div>
      </motion.aside>
    </>
  );
}
