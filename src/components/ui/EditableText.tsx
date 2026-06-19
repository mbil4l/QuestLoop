"use client";

import { useState } from "react";
import { cn } from "@/lib/utils/cn";

export function EditableText({
  value,
  onCommit,
  placeholder = "",
  className,
  inputClassName,
}: {
  value: string;
  onCommit: (v: string) => void;
  placeholder?: string;
  className?: string;
  inputClassName?: string;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);

  if (editing) {
    return (
      <input
        autoFocus
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={() => {
          setEditing(false);
          if (draft !== value) onCommit(draft);
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter") (e.target as HTMLInputElement).blur();
          if (e.key === "Escape") {
            setDraft(value);
            setEditing(false);
          }
        }}
        className={cn(
          "w-full bg-bg-deep border border-border-active rounded px-1.5 py-0.5 text-text-primary focus:outline-none",
          inputClassName
        )}
      />
    );
  }

  return (
    <button
      type="button"
      onClick={() => {
        setDraft(value);
        setEditing(true);
      }}
      className={cn(
        "text-left w-full rounded px-1.5 py-0.5 hover:bg-bg-panel-hover transition-colors",
        !value && "text-text-muted italic",
        className
      )}
    >
      {value || placeholder}
    </button>
  );
}
