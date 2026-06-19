"use client";

import { useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import type { World, Quest } from "@/types/domain";
import type { WorldStatus } from "@/types/enums";
import { useQuestStore } from "@/lib/stores/quest-store";
import { useWorldStore } from "@/lib/stores/world-store";
import { useNotesStore } from "@/lib/stores/notes-store";
import {
  useUIStore,
  SORT_LABELS,
  DEFAULT_SORT,
  type QuestSortKey,
} from "@/lib/stores/ui-store";
import { WORLD_COLORS } from "@/lib/config";
import { cn } from "@/lib/utils/cn";
import { EditableText } from "@/components/ui/EditableText";

const STATUSES: WorldStatus[] = [
  "PRIMARY",
  "SECONDARY",
  "MAINTENANCE",
  "PAUSED",
  "COMPLETED",
];

const SWATCHES = Array.from(new Set(Object.values(WORLD_COLORS)));

/* ── Importance stars ───────────────────────────────────────────── */
function Importance({
  value,
  onChange,
  color,
}: {
  value: number;
  onChange: (v: number) => void;
  color: string;
}) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          aria-label={`Set importance ${n}`}
          onClick={() => onChange(n === value ? n - 1 : n)}
          className="leading-none"
        >
          <span
            className="block w-2.5 h-2.5 rounded-full transition-colors"
            style={{
              backgroundColor: n <= value ? color : "var(--color-border-subtle)",
            }}
          />
        </button>
      ))}
    </div>
  );
}

function toDateInput(iso: string | null): string {
  if (!iso) return "";
  return new Date(iso).toISOString().slice(0, 10);
}

/* ── Quest row ──────────────────────────────────────────────────── */
function QuestRow({
  quest,
  color,
  compact,
  prefs,
  canMove,
}: {
  quest: Quest;
  color: string;
  compact: boolean;
  prefs: ReturnType<typeof useUIStore.getState>["listPrefs"];
  canMove: boolean;
}) {
  const updateQuest = useQuestStore((s) => s.updateQuest);
  const toggleComplete = useQuestStore((s) => s.toggleQuestComplete);
  const deleteQuest = useQuestStore((s) => s.deleteQuest);
  const moveQuest = useQuestStore((s) => s.moveQuest);

  return (
    <li
      className={cn(
        "group rounded-lg border border-transparent hover:border-border-subtle hover:bg-bg-panel-raised transition-colors",
        compact ? "px-2 py-1.5" : "px-2.5 py-2.5"
      )}
    >
      <div className="flex items-start gap-2">
        <button
          type="button"
          aria-label={quest.isCompleted ? "Mark incomplete" : "Mark complete"}
          onClick={() => toggleComplete(quest.id)}
          className={cn(
            "mt-0.5 w-4 h-4 rounded-full border-2 shrink-0 flex items-center justify-center transition-colors"
          )}
          style={{
            borderColor: color,
            backgroundColor: quest.isCompleted ? color : "transparent",
          }}
        >
          {quest.isCompleted && (
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none">
              <path
                d="M5 13l4 4L19 7"
                stroke="white"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
        </button>

        <div className="flex-1 min-w-0">
          <EditableText
            value={quest.title}
            onCommit={(v) => updateQuest(quest.id, { title: v })}
            placeholder="Untitled task"
            className={cn(
              "text-sm font-medium",
              quest.isCompleted && "line-through text-text-muted"
            )}
            inputClassName="text-sm font-medium"
          />

          {prefs.showNextMove && (
            <div className="flex items-center gap-1 mt-0.5 pl-1.5">
              <span className="text-[10px] uppercase tracking-wide text-text-muted shrink-0">
                Next:
              </span>
              <EditableText
                value={quest.nextMove ?? ""}
                onCommit={(v) =>
                  updateQuest(quest.id, { nextMove: v.trim() ? v : null })
                }
                placeholder="add a next move…"
                className="text-xs text-text-secondary"
                inputClassName="text-xs"
              />
            </div>
          )}

          {(prefs.showDue || prefs.showEstimate || prefs.showImportance) && (
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1.5 pl-1.5">
              {prefs.showImportance && (
                <Importance
                  value={quest.importance}
                  color={color}
                  onChange={(v) => updateQuest(quest.id, { importance: v })}
                />
              )}
              {prefs.showDue && (
                <label className="flex items-center gap-1 text-[11px] text-text-muted">
                  <span className="uppercase tracking-wide">Due</span>
                  <input
                    type="date"
                    value={toDateInput(quest.dueAt)}
                    onChange={(e) =>
                      updateQuest(quest.id, {
                        dueAt: e.target.value
                          ? new Date(e.target.value).toISOString()
                          : null,
                      })
                    }
                    className="bg-bg-deep border border-border-subtle rounded px-1 py-0.5 text-text-secondary focus:outline-none focus:border-border-active"
                  />
                </label>
              )}
              {prefs.showEstimate && (
                <label className="flex items-center gap-1 text-[11px] text-text-muted">
                  <input
                    type="number"
                    min={0}
                    step={5}
                    value={quest.estimatedMinutes ?? ""}
                    placeholder="0"
                    onChange={(e) =>
                      updateQuest(quest.id, {
                        estimatedMinutes: e.target.value
                          ? Number(e.target.value)
                          : null,
                      })
                    }
                    className="w-12 bg-bg-deep border border-border-subtle rounded px-1 py-0.5 text-text-secondary focus:outline-none focus:border-border-active"
                  />
                  <span>min</span>
                </label>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
          {canMove && (
            <>
              <button
                type="button"
                aria-label="Move up"
                onClick={() => moveQuest(quest.id, "up")}
                className="p-1 text-text-muted hover:text-text-primary"
              >
                ↑
              </button>
              <button
                type="button"
                aria-label="Move down"
                onClick={() => moveQuest(quest.id, "down")}
                className="p-1 text-text-muted hover:text-text-primary"
              >
                ↓
              </button>
            </>
          )}
          <button
            type="button"
            aria-label="Delete task"
            onClick={() => deleteQuest(quest.id)}
            className="p-1 text-text-muted hover:text-danger-muted"
          >
            ✕
          </button>
        </div>
      </div>
    </li>
  );
}

/* ── Panel ──────────────────────────────────────────────────────── */
export function WorldListPanel({
  world,
  onClose,
}: {
  world: World;
  onClose: () => void;
}) {
  const quests = useQuestStore((s) => s.quests);
  const createQuest = useQuestStore((s) => s.createQuest);
  const updateWorld = useWorldStore((s) => s.updateWorld);
  const deleteWorld = useWorldStore((s) => s.deleteWorld);
  const prefs = useUIStore((s) => s.listPrefs);
  const sortKey = useUIStore((s) => s.worldSort[world.id]) ?? DEFAULT_SORT;
  const setWorldSort = useUIStore((s) => s.setWorldSort);
  const noteValue = useNotesStore((s) => s.worldNotes[world.id] ?? "");
  const setWorldNotes = useNotesStore((s) => s.setWorldNotes);

  const [newTitle, setNewTitle] = useState("");
  const [showColors, setShowColors] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const newInputRef = useRef<HTMLInputElement>(null);

  const worldQuests = useMemo(
    () => quests.filter((q) => q.worldId === world.id),
    [quests, world.id]
  );

  const visibleQuests = useMemo(() => {
    let list = worldQuests;
    if (prefs.hideCompleted) list = list.filter((q) => !q.isCompleted);
    const sorted = [...list];
    switch (sortKey) {
      case "priority":
        sorted.sort((a, b) => b.priorityScore - a.priorityScore);
        break;
      case "importance":
        sorted.sort((a, b) => b.importance - a.importance);
        break;
      case "alpha":
        sorted.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case "due":
        sorted.sort((a, b) => {
          if (!a.dueAt) return 1;
          if (!b.dueAt) return -1;
          return new Date(a.dueAt).getTime() - new Date(b.dueAt).getTime();
        });
        break;
      // manual → keep store order
    }
    return sorted;
  }, [worldQuests, prefs.hideCompleted, sortKey]);

  const remaining = worldQuests.filter((q) => !q.isCompleted).length;

  function addQuest() {
    const title = newTitle.trim();
    if (!title) return;
    createQuest({
      worldId: world.id,
      objectiveId: null,
      campaignId: null,
      title,
      description: "",
      nextMove: null,
      status: "active",
      dueAt: null,
      estimatedMinutes: null,
      importance: 3,
      consequence: "",
      demandType: world.demandType,
      difficulty: 2,
      priorityScore: 50,
      priorityOverride: null,
      rescheduleCount: 0,
      waitingForId: null,
      isCompleted: false,
      completedAt: null,
    });
    setNewTitle("");
    newInputRef.current?.focus();
  }

  return (
    <>
      {/* Backdrop */}
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
        aria-label={`${world.name} tasks`}
      >
        {/* Header */}
        <div className="p-4 border-b border-border-subtle">
          <div className="flex items-start gap-2">
            <div className="relative">
              <button
                type="button"
                aria-label="Change color"
                onClick={() => setShowColors((v) => !v)}
                className="mt-1.5 w-4 h-4 rounded-full ring-2 ring-offset-2 ring-offset-bg-panel shrink-0"
                style={{ backgroundColor: world.color, boxShadow: `0 0 0 1px ${world.color}` }}
              />
              {showColors && (
                <>
                  <button
                    type="button"
                    aria-label="Close colors"
                    onClick={() => setShowColors(false)}
                    className="fixed inset-0 z-20 cursor-default"
                  />
                  <div className="absolute left-0 z-30 mt-2 w-60 p-2.5 grid grid-cols-7 gap-2 rounded-xl bg-bg-panel-raised border border-border-subtle shadow-xl">
                    {SWATCHES.map((c) => (
                      <button
                        key={c}
                        type="button"
                        aria-label={`Use color ${c}`}
                        onClick={() => {
                          updateWorld(world.id, { color: c });
                          setShowColors(false);
                        }}
                        className="w-6 h-6 rounded-full transition-transform hover:scale-110"
                        style={{
                          backgroundColor: c,
                          outline: c === world.color ? `2px solid ${c}` : "none",
                          outlineOffset: 2,
                        }}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <EditableText
                value={world.name}
                onCommit={(v) => updateWorld(world.id, { name: v || "Untitled" })}
                className="text-lg font-semibold"
                inputClassName="text-lg font-semibold"
              />
              <EditableText
                value={world.purpose}
                onCommit={(v) => updateWorld(world.id, { purpose: v })}
                placeholder="add a purpose…"
                className="text-xs text-text-secondary"
                inputClassName="text-xs"
              />
            </div>

            <button
              type="button"
              aria-label="World notes"
              aria-pressed={showNotes}
              onClick={() => setShowNotes((v) => !v)}
              className={cn(
                "relative p-1.5 rounded hover:bg-bg-panel-hover transition-colors",
                showNotes ? "text-text-primary" : "text-text-muted hover:text-text-primary"
              )}
            >
              <span aria-hidden="true">📝</span>
              {noteValue.trim() && (
                <span
                  className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full"
                  style={{ backgroundColor: world.color }}
                />
              )}
            </button>
            <button
              type="button"
              aria-label="Close"
              onClick={onClose}
              className="p-1.5 rounded text-text-muted hover:text-text-primary hover:bg-bg-panel-hover"
            >
              ✕
            </button>
          </div>

          {showNotes && (
            <div className="mt-3">
              <textarea
                value={noteValue}
                onChange={(e) => setWorldNotes(world.id, e.target.value)}
                placeholder={`Notes for ${world.name}…`}
                rows={4}
                className="w-full resize-y rounded-lg bg-bg-panel-raised border border-border-subtle p-2.5 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-border-active leading-relaxed"
              />
            </div>
          )}

          <div className="flex items-center gap-2 mt-3">
            <select
              value={world.status}
              onChange={(e) =>
                updateWorld(world.id, { status: e.target.value as WorldStatus })
              }
              className="text-xs bg-bg-deep border border-border-subtle rounded px-2 py-1 text-text-secondary focus:outline-none focus:border-border-active"
            >
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s.charAt(0) + s.slice(1).toLowerCase()}
                </option>
              ))}
            </select>
            <label className="flex items-center gap-1 text-xs text-text-muted">
              <span>Target</span>
              <input
                type="number"
                min={0}
                step={30}
                value={world.weeklyTargetMinutes}
                onChange={(e) =>
                  updateWorld(world.id, {
                    weeklyTargetMinutes: Number(e.target.value) || 0,
                  })
                }
                className="w-16 bg-bg-deep border border-border-subtle rounded px-1.5 py-1 text-text-secondary focus:outline-none focus:border-border-active"
              />
              <span>min/wk</span>
            </label>
            <label className="flex items-center gap-1 text-xs text-text-muted">
              <span>Sort</span>
              <select
                value={sortKey}
                onChange={(e) =>
                  setWorldSort(world.id, e.target.value as QuestSortKey)
                }
                className="bg-bg-deep border border-border-subtle rounded px-1.5 py-1 text-text-secondary focus:outline-none focus:border-border-active"
              >
                {(Object.keys(SORT_LABELS) as QuestSortKey[]).map((k) => (
                  <option key={k} value={k}>
                    {SORT_LABELS[k]}
                  </option>
                ))}
              </select>
            </label>
            <span className="ml-auto text-xs text-text-muted">
              {remaining} left
            </span>
          </div>
        </div>

        {/* Add quest */}
        <div className="px-4 py-3 border-b border-border-subtle">
          <div className="flex items-center gap-2">
            <input
              ref={newInputRef}
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addQuest()}
              placeholder="Add a task…"
              className="flex-1 h-9 px-3 text-sm rounded-lg bg-bg-deep border border-border-subtle text-text-primary placeholder:text-text-muted focus:outline-none focus:border-border-active"
            />
            <button
              type="button"
              onClick={addQuest}
              disabled={!newTitle.trim()}
              className="h-9 px-3 rounded-lg text-sm font-medium text-white disabled:opacity-40"
              style={{ backgroundColor: world.color }}
            >
              Add
            </button>
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-3">
          {visibleQuests.length === 0 ? (
            <p className="text-sm text-text-muted text-center py-10">
              {worldQuests.length === 0
                ? "No tasks yet. Add your first one above."
                : "Nothing matches your filters."}
            </p>
          ) : (
            <ul className={cn(prefs.density === "compact" ? "space-y-0.5" : "space-y-1")}>
              {visibleQuests.map((q) => (
                <QuestRow
                  key={q.id}
                  quest={q}
                  color={world.color}
                  compact={prefs.density === "compact"}
                  prefs={prefs}
                  canMove={sortKey === "manual"}
                />
              ))}
            </ul>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-border-subtle">
          <button
            type="button"
            onClick={() => {
              if (confirm(`Delete "${world.name}" and its tasks from view?`)) {
                deleteWorld(world.id);
                onClose();
              }
            }}
            className="text-xs text-red-500 hover:text-red-600 transition-colors"
          >
            Delete world
          </button>
        </div>
      </motion.aside>
    </>
  );
}
