"use client";

import { useEffect, useState } from "react";
import { AnimatePresence } from "framer-motion";
import { useWorldStore } from "@/lib/stores/world-store";
import { useQuestStore } from "@/lib/stores/quest-store";
import { RadialMap } from "@/components/radial-map/RadialMap";
import { WorldListPanel } from "@/components/radial-map/WorldListPanel";
import { AddWorldModal } from "@/components/radial-map/AddWorldModal";
import type { Quest } from "@/types/domain";
import { APP_NAME } from "@/lib/config";

export default function Home() {
  const [hydrated, setHydrated] = useState(false);
  const [adding, setAdding] = useState(false);

  const worlds = useWorldStore((s) => s.worlds);
  const selectedWorldId = useWorldStore((s) => s.selectedWorldId);
  const selectWorld = useWorldStore((s) => s.selectWorld);
  const quests = useQuestStore((s) => s.quests);

  // Stores skip auto-hydration so SSR and the first client render match
  // (both empty). We rehydrate from localStorage after mount, then seed demo
  // data only if nothing was persisted yet.
  useEffect(() => {
    Promise.all([
      useWorldStore.persist.rehydrate(),
      useQuestStore.persist.rehydrate(),
    ]).then(() => {
      useWorldStore.getState().seedIfEmpty();
      useQuestStore.getState().seedIfEmpty();
      setHydrated(true);
    });
  }, []);

  const selectedWorld = worlds.find((w) => w.id === selectedWorldId) ?? null;

  const getNextMoves = (worldId: string): Quest[] =>
    quests
      .filter((q) => q.worldId === worldId && !q.isCompleted)
      .sort((a, b) => b.priorityScore - a.priorityScore);

  const pendingCount = quests.filter((q) => !q.isCompleted).length;

  return (
    <div className="min-h-screen flex flex-col">
      <header className="flex items-center justify-between px-6 py-4">
        <h1 className="text-lg font-bold tracking-tight text-text-primary">
          {APP_NAME}
        </h1>
        <button
          type="button"
          onClick={() => setAdding(true)}
          className="h-9 px-4 rounded-lg text-sm font-medium text-white glow-blue"
          style={{ backgroundColor: "var(--color-core-blue)" }}
        >
          + Add World
        </button>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-6 pb-12">
        {!hydrated ? (
          <div className="text-text-muted text-sm">Loading your map…</div>
        ) : worlds.filter((w) => w.status !== "COMPLETED").length === 0 ? (
          <div className="text-center">
            <p className="text-text-secondary mb-4">
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
            <div className="w-full">
              <RadialMap
                worlds={worlds}
                selectedWorldId={selectedWorldId}
                onSelectWorld={selectWorld}
                getNextMoves={getNextMoves}
                pendingCount={pendingCount}
              />
            </div>
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
        {adding && <AddWorldModal onClose={() => setAdding(false)} />}
      </AnimatePresence>
    </div>
  );
}
