"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useExploreStore } from "@/lib/stores/explore-store";
import { useAuthStore } from "@/lib/stores/auth-store";
import { AuthControl } from "@/components/auth/AuthControl";
import { MiniRadial } from "@/components/explore/MiniRadial";
import { Flag } from "@/components/ui/Flag";
import { cn } from "@/lib/utils/cn";

export default function ExplorePage() {
  const [ready, setReady] = useState(false);
  const [highlight, setHighlight] = useState<string | null>(null);
  const published = useExploreStore((s) => s.published);
  const getDiscoverable = useExploreStore((s) => s.getDiscoverable);
  const user = useAuthStore((s) => s.user);

  useEffect(() => {
    Promise.all([
      useExploreStore.persist.rehydrate(),
      useAuthStore.persist.rehydrate(),
    ]).then(() => {
      setHighlight(new URLSearchParams(window.location.search).get("u"));
      setReady(true);
    });
  }, []);

  // `published` is referenced so the list recomputes when maps change.
  const maps = ready ? getDiscoverable() : [];
  void published;

  return (
    <div className="min-h-screen flex flex-col">
      <header className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-4">
          <Link href="/" className="text-lg font-bold tracking-tight text-text-primary">
            QuestLoop
          </Link>
          <nav className="flex items-center gap-3 text-sm">
            <Link href="/" className="text-text-muted hover:text-text-primary transition-colors">
              Home
            </Link>
            <span className="text-text-primary font-medium">Explore</span>
          </nav>
        </div>
        <AuthControl />
      </header>

      <main className="flex-1 px-6 pb-12 max-w-6xl mx-auto w-full">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-text-primary">Explore maps</h1>
          <p className="text-sm text-text-secondary mt-1">
            Public maps shared by other people. Flip your profile to{" "}
            <span className="font-medium">Public</span> on the home page to appear
            here.
          </p>
        </div>

        {!ready ? (
          <p className="text-text-muted text-sm">Loading…</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {maps.map((m) => {
              const isMine = user?.id === m.id;
              return (
                <article
                  key={m.id}
                  className={cn(
                    "relative cyber-panel-raised p-4 flex flex-col",
                    highlight === m.id && "ring-2 ring-border-active"
                  )}
                >
                  {/* Top-right: location + ownership */}
                  <div className="absolute top-3 right-3 flex items-center gap-2">
                    {(m.city || m.countryCode) && (
                      <span className="flex items-center gap-1 text-[11px] text-text-muted">
                        {m.countryCode ? (
                          <Flag code={m.countryCode} className="rounded-sm shrink-0" />
                        ) : (
                          <span aria-hidden="true">📍</span>
                        )}
                        {(m.city || m.region) && (
                          <span className="truncate max-w-[9rem]">
                            {[m.city, m.region].filter(Boolean).join(", ")}
                          </span>
                        )}
                      </span>
                    )}
                    {isMine && (
                      <span className="text-[10px] uppercase tracking-wide px-2 py-0.5 rounded-full bg-core-blue/15 text-core-blue">
                        You
                      </span>
                    )}
                    {!isMine && m.sample && (
                      <span className="text-[10px] uppercase tracking-wide text-text-muted">
                        Example
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 mb-3 pr-16">
                    <span
                      className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-semibold shrink-0"
                      style={{ backgroundColor: m.avatarColor }}
                    >
                      {m.emoji || m.name.charAt(0).toUpperCase()}
                    </span>
                    <span className="min-w-0">
                      <span className="block text-sm font-semibold text-text-primary truncate">
                        {m.name}
                      </span>
                      {m.occupation && (
                        <span className="block text-[11px] text-text-muted truncate">
                          {m.occupation}
                        </span>
                      )}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <MiniRadial worlds={m.worlds} />
                    <div className="min-w-0">
                      <p className="text-xs text-text-muted mb-1">
                        {m.worlds.length} worlds
                      </p>
                      <ul className="space-y-1">
                        {m.worlds.slice(0, 4).map((w, i) => (
                          <li key={i} className="flex items-center gap-1.5 text-xs text-text-secondary">
                            <span
                              className="w-2 h-2 rounded-full shrink-0"
                              style={{ backgroundColor: w.color }}
                            />
                            <span className="truncate">{w.name}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {m.topMoves.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-border-subtle">
                      <p className="text-[10px] uppercase tracking-wider text-text-muted mb-1.5">
                        Working on next
                      </p>
                      <ul className="space-y-1">
                        {m.topMoves.slice(0, 3).map((move, i) => (
                          <li key={i} className="text-xs text-text-secondary leading-snug">
                            • {move}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
