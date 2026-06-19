"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { useWorldStore } from "@/lib/stores/world-store";
import { useQuestStore } from "@/lib/stores/quest-store";
import { useNotesStore } from "@/lib/stores/notes-store";
import { useAuthStore } from "@/lib/stores/auth-store";
import { useExploreStore } from "@/lib/stores/explore-store";
import { loadAccount } from "@/lib/account";
import { buildSnapshot } from "@/lib/snapshot";
import { RadialMap } from "@/components/radial-map/RadialMap";
import { WorldListPanel } from "@/components/radial-map/WorldListPanel";
import { AddWorldModal } from "@/components/radial-map/AddWorldModal";
import { NotesPanel } from "@/components/notes/NotesPanel";
import { AuthControl } from "@/components/auth/AuthControl";
import type { Quest } from "@/types/domain";
import { APP_NAME } from "@/lib/config";

export default function Home() {
  const [hydrated, setHydrated] = useState(false);
  const [adding, setAdding] = useState(false);
  const [notesOpen, setNotesOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const worlds = useWorldStore((s) => s.worlds);
  const selectedWorldId = useWorldStore((s) => s.selectedWorldId);
  const selectWorld = useWorldStore((s) => s.selectWorld);
  const quests = useQuestStore((s) => s.quests);
  const worldNotes = useNotesStore((s) => s.worldNotes);
  const user = useAuthStore((s) => s.user);
  const published = useExploreStore((s) => s.published);
  const publish = useExploreStore((s) => s.publish);
  const unpublish = useExploreStore((s) => s.unpublish);

  const accountId = user?.id ?? "guest";
  const accountName = user?.name ?? "Guest";
  const accountColor = user?.avatarColor ?? "#C0784E";
  const discoverable = Boolean(published[accountId]);

  // Rehydrate auth + explore, then load the active account's data.
  useEffect(() => {
    (async () => {
      await Promise.all([
        useAuthStore.persist.rehydrate(),
        useExploreStore.persist.rehydrate(),
      ]);
      const acc = useAuthStore.getState().user?.id ?? "guest";
      await loadAccount(acc);
      setHydrated(true);
    })();
  }, []);

  // Keep a published map in sync while it's discoverable.
  useEffect(() => {
    if (!hydrated) return;
    const store = useExploreStore.getState();
    if (store.isPublished(accountId)) {
      store.publish(
        buildSnapshot({
          id: accountId,
          name: accountName,
          avatarColor: accountColor,
          worlds,
          quests,
        })
      );
    }
  }, [hydrated, accountId, accountName, accountColor, worlds, quests]);

  const selectedWorld = worlds.find((w) => w.id === selectedWorldId) ?? null;

  const getNextMoves = (worldId: string): Quest[] =>
    quests
      .filter((q) => q.worldId === worldId && !q.isCompleted)
      .sort((a, b) => b.priorityScore - a.priorityScore);

  const pendingCount = quests.filter((q) => !q.isCompleted).length;

  const worldsWithNotes = new Set(
    Object.entries(worldNotes)
      .filter(([, v]) => v.trim().length > 0)
      .map(([id]) => id)
  );

  const hasWorlds = worlds.filter((w) => w.status !== "COMPLETED").length > 0;

  function toggleDiscoverable() {
    if (discoverable) {
      unpublish(accountId);
    } else {
      publish(
        buildSnapshot({
          id: accountId,
          name: accountName,
          avatarColor: accountColor,
          worlds,
          quests,
        })
      );
    }
  }

  function copyShareLink() {
    const url = `${window.location.origin}/explore?u=${accountId}`;
    navigator.clipboard?.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="flex items-center justify-between gap-3 px-6 py-4 flex-wrap">
        <div className="flex items-center gap-4">
          <span className="text-lg font-bold tracking-tight text-text-primary">
            {APP_NAME}
          </span>
          <nav className="flex items-center gap-3 text-sm">
            <span className="text-text-primary font-medium">Home</span>
            <Link
              href="/explore"
              className="text-text-muted hover:text-text-primary transition-colors"
            >
              Explore
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={toggleDiscoverable}
            aria-pressed={discoverable}
            className={`h-9 px-3 rounded-lg text-sm border transition-colors ${
              discoverable
                ? "border-border-active text-text-primary bg-bg-panel-hover"
                : "border-border-subtle text-text-muted hover:text-text-primary"
            }`}
            title="Toggle whether your map appears on Explore"
          >
            🌐 {discoverable ? "Discoverable" : "Private"}
          </button>
          {discoverable && (
            <button
              type="button"
              onClick={copyShareLink}
              className="h-9 px-3 rounded-lg text-sm border border-border-subtle text-text-secondary hover:text-text-primary transition-colors"
            >
              {copied ? "Copied!" : "Share link"}
            </button>
          )}
          <button
            type="button"
            aria-label="Notes"
            onClick={() => setNotesOpen(true)}
            className="h-9 px-3 rounded-lg text-sm border border-border-subtle text-text-secondary hover:text-text-primary transition-colors"
          >
            📝 Notes
          </button>
          <button
            type="button"
            onClick={() => setAdding(true)}
            className="h-9 px-4 rounded-lg text-sm font-medium text-white glow-blue"
            style={{ backgroundColor: "var(--color-core-blue)" }}
          >
            + Add World
          </button>
          <AuthControl />
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-6 pb-12 overflow-hidden">
        {!hydrated ? (
          <div className="text-text-muted text-sm">Loading your map…</div>
        ) : !hasWorlds ? (
          <div className="text-center">
            <p className="text-text-secondary mb-4">
              {user ? `Welcome, ${user.name}. ` : ""}
              No worlds yet. Create your first one to start mapping what matters.
            </p>
            <button
              type="button"
              onClick={() => setAdding(true)}
              className="h-10 px-5 rounded-lg text-sm font-medium text-white glow-blue"
              style={{ backgroundColor: "var(--color-core-blue)" }}
            >
              + Add World
            </button>
          </div>
        ) : (
          <>
            <motion.div
              className="w-full"
              animate={{ x: selectedWorld ? -150 : 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 32 }}
            >
              <RadialMap
                worlds={worlds}
                selectedWorldId={selectedWorldId}
                onSelectWorld={selectWorld}
                getNextMoves={getNextMoves}
                pendingCount={pendingCount}
                worldsWithNotes={worldsWithNotes}
              />
            </motion.div>
            <p className="mt-6 text-xs text-text-muted text-center">
              Hover a world to preview what&apos;s next · click to open its list
            </p>
          </>
        )}
      </main>

      <AnimatePresence>
        {selectedWorld && (
          <WorldListPanel
            key={selectedWorld.id}
            world={selectedWorld}
            onClose={() => selectWorld(null)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {notesOpen && <NotesPanel onClose={() => setNotesOpen(false)} />}
      </AnimatePresence>

      <AnimatePresence>
        {adding && <AddWorldModal onClose={() => setAdding(false)} />}
      </AnimatePresence>
    </div>
  );
}
