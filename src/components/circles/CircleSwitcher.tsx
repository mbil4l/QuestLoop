"use client";

import { useEffect, useRef, useState } from "react";
import { useCircleStore } from "@/lib/stores/circle-store";
import {
  loadCircle,
  createAndSwitchCircle,
  deleteCircleAndSwitch,
} from "@/lib/account";

export function CircleSwitcher() {
  const circles = useCircleStore((s) => s.circles);
  const activeCircleId = useCircleStore((s) => s.activeCircleId);
  const renameCircle = useCircleStore((s) => s.renameCircle);

  const [open, setOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  const active = circles.find((c) => c.id === activeCircleId);

  useEffect(() => {
    if (!open) return;
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  async function switchTo(id: string) {
    if (id !== activeCircleId) await loadCircle(id);
    setOpen(false);
  }

  async function create() {
    const name = newName.trim();
    if (!name) return;
    await createAndSwitchCircle(name);
    setNewName("");
    setCreating(false);
    setOpen(false);
  }

  function saveRename(id: string) {
    if (editName.trim()) renameCircle(id, editName);
    setEditingId(null);
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="h-9 px-3 rounded-lg text-sm border border-border-subtle text-text-secondary hover:text-text-primary transition-colors flex items-center gap-1.5 max-w-[12rem]"
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <span aria-hidden="true">◎</span>
        <span className="truncate">{active?.name ?? "Circle"}</span>
        <span aria-hidden="true" className="text-text-muted">▾</span>
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 mt-1 w-64 z-50 cyber-panel-raised p-1.5 shadow-xl"
        >
          <p className="px-2 py-1 text-xs uppercase tracking-wider text-text-muted">
            Circles
          </p>
          <ul className="max-h-64 overflow-y-auto">
            {circles.map((c) => (
              <li key={c.id} className="group flex items-center gap-1">
                {editingId === c.id ? (
                  <input
                    autoFocus
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") saveRename(c.id);
                      if (e.key === "Escape") setEditingId(null);
                    }}
                    onBlur={() => saveRename(c.id)}
                    className="flex-1 h-8 px-2 text-sm rounded bg-bg-deep border border-border-active text-text-primary focus:outline-none"
                  />
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => switchTo(c.id)}
                      className={`flex-1 text-left px-2 py-1.5 rounded text-sm truncate hover:bg-bg-panel-hover ${
                        c.id === activeCircleId
                          ? "text-text-primary font-medium"
                          : "text-text-secondary"
                      }`}
                    >
                      {c.id === activeCircleId ? "● " : "○ "}
                      {c.name}
                    </button>
                    <button
                      type="button"
                      aria-label={`Rename ${c.name}`}
                      onClick={() => {
                        setEditingId(c.id);
                        setEditName(c.name);
                      }}
                      className="opacity-0 group-hover:opacity-100 p-1 text-text-muted hover:text-text-primary"
                    >
                      ✎
                    </button>
                    {circles.length > 1 && (
                      <button
                        type="button"
                        aria-label={`Delete ${c.name}`}
                        onClick={() => deleteCircleAndSwitch(c.id)}
                        className="opacity-0 group-hover:opacity-100 p-1 text-text-muted hover:text-red-500"
                      >
                        ✕
                      </button>
                    )}
                  </>
                )}
              </li>
            ))}
          </ul>

          <div className="border-t border-border-subtle mt-1 pt-1">
            {creating ? (
              <div className="flex items-center gap-1 px-1">
                <input
                  autoFocus
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") create();
                    if (e.key === "Escape") setCreating(false);
                  }}
                  placeholder="e.g. Professional, Fun…"
                  className="flex-1 h-8 px-2 text-sm rounded bg-bg-deep border border-border-active text-text-primary placeholder:text-text-muted focus:outline-none"
                />
                <button
                  type="button"
                  onClick={create}
                  className="h-8 px-2 rounded text-sm text-white"
                  style={{ backgroundColor: "var(--color-core-blue)" }}
                >
                  Add
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setCreating(true)}
                className="w-full text-left px-2 py-1.5 rounded text-sm text-text-secondary hover:bg-bg-panel-hover"
              >
                + New circle
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
