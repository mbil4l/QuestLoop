"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { useWorldStore } from "@/lib/stores/world-store";
import { useQuestStore } from "@/lib/stores/quest-store";
import { useNotesStore } from "@/lib/stores/notes-store";
import { useAuthStore } from "@/lib/stores/auth-store";
import { useProfileStore } from "@/lib/stores/profile-store";
import { useExploreStore } from "@/lib/stores/explore-store";
import { loadAccount } from "@/lib/account";
import { buildSnapshot } from "@/lib/snapshot";
import { RadialMap } from "@/components/radial-map/RadialMap";
import { WorldListPanel } from "@/components/radial-map/WorldListPanel";
import { AddWorldModal } from "@/components/radial-map/AddWorldModal";
import { NotesPanel } from "@/components/notes/NotesPanel";
import { SettingsPanel } from "@/components/settings/SettingsPanel";
import { ProfilePanel } from "@/components/profile/ProfilePanel";
import { AuthControl } from "@/components/auth/AuthControl";
import { CircleSwitcher } from "@/components/circles/CircleSwitcher";
import type { Quest } from "@/types/domain";
import { APP_NAME } from "@/lib/config";

export default function Home() {
  const [hydrated, setHydrated] = useState(false);
  const [adding, setAdding] = useState(false);
  const [notesOpen, setNotesOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const worlds = useWorldStore((s) => s.worlds);
  const selectedWorldId = useWorldStore((s) => s.selectedWorldId);
  const selectWorld = useWorldStore((s) => s.selectWorld);
  const quests = useQuestStore((s) => s.quests);
  const worldNotes = useNotesStore((s) => s.worldNotes);
  const user = useAuthStore((s) => s.user);
  const displayName = useProfileStore((s) => s.displayName);
  const occupation = useProfileStore((s) => s.occupation);
  const emoji = useProfileStore((s) => s.emoji);
  const city = useProfileStore((s) => s.city);
  const region = useProfileStore((s) => s.region);
  const countryCode = useProfileStore((s) => s.countryCode);

  const accountId = user?.id ?? "guest";
  const accountName = displayName.trim() || user?.name || "Guest";
  const accountColor = user?.avatarColor ?? "#C0784E";

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

  // Keep a published map in sync while it's public (worlds, tasks, profile).
  useEffect(() => {
    if (!hydrated) return;
    const store = useExploreStore.getState();
    if (!store.isPublished(accountId)) return;
    const visible = worlds.filter((w) => w.status !== "COMPLETED");
    if (visible.length === 0) {
      store.unpublish(accountId); // never keep an empty map listed (#1)
      return;
    }
    store.publish(
      buildSnapshot({
        id: accountId,
        name: accountName,
        occupation,
        emoji,
        city,
        region,
        countryCode,
        avatarColor: accountColor,
        worlds,
        quests,
      })
    );
  }, [hydrated, accountId, accountName, accountColor, occupation, emoji, city, region, countryCode, worlds, quests]);

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

  const accentBtn =
    "h-9 px-4 rounded-lg text-sm font-medium text-white glow-blue";

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
            aria-label="Settings"
            onClick={() => setSettingsOpen(true)}
            className="h-9 w-9 rounded-lg text-base border border-border-subtle text-text-secondary hover:text-text-primary transition-colors"
          >
            ⚙
          </button>
          <button
            type="button"
            onClick={() => setNotesOpen(true)}
            className={accentBtn}
            style={{ backgroundColor: "var(--color-core-blue)" }}
          >
            📝 Notes
          </button>
          <button
            type="button"
            onClick={() => setAdding(true)}
            className={accentBtn}
            style={{ backgroundColor: "var(--color-core-blue)" }}
          >
            + Add World
          </button>
          <CircleSwitcher />
          <AuthControl />
        </div>
      </header>

      <div className="flex-1 flex min-h-0">
        {/* Profile sidebar */}
        <aside className="hidden md:block w-64 shrink-0 p-4">
          <ProfilePanel />
        </aside>

        <motion.main
          className="flex-1 flex flex-col items-center justify-center px-6 pb-12 overflow-hidden"
          animate={{ paddingRight: selectedWorld ? "29rem" : "1.5rem" }}
          transition={{ type: "spring", stiffness: 300, damping: 32 }}
        >
          {/* Profile on mobile (stacked above the map) */}
          <div className="md:hidden w-full max-w-sm mb-6">
            <ProfilePanel />
          </div>

          {!hydrated ? (
            <div className="text-text-muted text-sm">Loading your map…</div>
          ) : !hasWorlds ? (
            <div className="text-center">
              <p className="text-text-secondary mb-4">
                {user ? `Welcome, ${accountName}. ` : ""}
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
              <div
                className={`w-full pointer-events-none ${selectedWorld ? "relative z-50" : ""}`}
              >
                <RadialMap
                  worlds={worlds}
                  selectedWorldId={selectedWorldId}
                  onSelectWorld={selectWorld}
                  getNextMoves={getNextMoves}
                  pendingCount={pendingCount}
                  worldsWithNotes={worldsWithNotes}
                />
              </div>
              <p className="mt-6 text-xs text-text-muted text-center">
                Hover a world to preview what&apos;s next · click to open its list
              </p>
            </>
          )}
        </motion.main>
      </div>

      <AnimatePresence>
        {selectedWorld && (
          <WorldListPanel
            world={selectedWorld}
            onClose={() => selectWorld(null)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {notesOpen && <NotesPanel onClose={() => setNotesOpen(false)} />}
      </AnimatePresence>

      <AnimatePresence>
        {settingsOpen && <SettingsPanel onClose={() => setSettingsOpen(false)} />}
      </AnimatePresence>

      <AnimatePresence>
        {adding && <AddWorldModal onClose={() => setAdding(false)} />}
      </AnimatePresence>
    </div>
  );
}
