"use client";

import { useEffect, useState } from "react";
import { AnimatePresence } from "framer-motion";
import { useAuthStore } from "@/lib/stores/auth-store";
import { useProfileStore } from "@/lib/stores/profile-store";
import { useWorldStore } from "@/lib/stores/world-store";
import { useQuestStore } from "@/lib/stores/quest-store";
import { useExploreStore } from "@/lib/stores/explore-store";
import { buildSnapshot } from "@/lib/snapshot";
import { EditableText } from "@/components/ui/EditableText";
import { GoogleSignInModal } from "@/components/auth/GoogleSignInModal";
import { detectLocation } from "@/lib/geo";
import { Flag } from "@/components/ui/Flag";
import { cn } from "@/lib/utils/cn";

const EMOJIS = ["🙂", "🚀", "🧠", "🎯", "🌱", "🔥", "💼", "🎨", "🏔️", "📚", "🦊", "🐼", "⚡", "🌙", "🍀", "💪"];

function Toggle({
  on,
  onClick,
  disabled,
}: {
  on: boolean;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "relative w-11 h-6 rounded-full transition-colors shrink-0",
        on ? "bg-core-blue" : "bg-border-subtle",
        disabled && "opacity-40 cursor-not-allowed"
      )}
    >
      <span
        className={cn(
          "absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform",
          on && "translate-x-5"
        )}
      />
    </button>
  );
}

export function ProfilePanel() {
  const user = useAuthStore((s) => s.user);
  const displayName = useProfileStore((s) => s.displayName);
  const occupation = useProfileStore((s) => s.occupation);
  const emoji = useProfileStore((s) => s.emoji);
  const city = useProfileStore((s) => s.city);
  const region = useProfileStore((s) => s.region);
  const countryCode = useProfileStore((s) => s.countryCode);
  const setProfile = useProfileStore((s) => s.setProfile);

  const worlds = useWorldStore((s) => s.worlds);
  const quests = useQuestStore((s) => s.quests);
  const published = useExploreStore((s) => s.published);
  const publish = useExploreStore((s) => s.publish);
  const unpublish = useExploreStore((s) => s.unpublish);

  const [signInOpen, setSignInOpen] = useState(false);
  const [pickEmoji, setPickEmoji] = useState(false);
  const [copied, setCopied] = useState(false);
  const [locating, setLocating] = useState(false);

  function detect() {
    setLocating(true);
    detectLocation()
      .then((loc) => {
        if (loc)
          setProfile({
            city: loc.city,
            region: loc.region,
            countryCode: loc.countryCode,
          });
        setLocating(false);
      })
      .catch(() => setLocating(false));
  }

  // Auto-detect location once after sign-in if we don't have it yet.
  useEffect(() => {
    if (!user || useProfileStore.getState().city) return;
    detectLocation().then((loc) => {
      if (loc)
        setProfile({
          city: loc.city,
          region: loc.region,
          countryCode: loc.countryCode,
        });
    });
  }, [user, setProfile]);

  const accountId = user?.id ?? "guest";
  const name = displayName.trim() || user?.name || "Guest";
  const avatarColor = user?.avatarColor ?? "#C0784E";
  const visibleWorlds = worlds.filter((w) => w.status !== "COMPLETED");
  const isPublic = Boolean(published[accountId]);

  function togglePublic() {
    if (isPublic) {
      unpublish(accountId);
    } else {
      publish(
        buildSnapshot({
          id: accountId,
          name,
          occupation,
          emoji,
          city,
          region,
          countryCode,
          avatarColor,
          worlds,
          quests,
        })
      );
    }
  }

  function copyShareLink() {
    navigator.clipboard?.writeText(
      `${window.location.origin}/explore?u=${accountId}`
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  }

  return (
    <div className="cyber-panel-raised p-4 w-full">
      {/* Avatar */}
      <div className="relative inline-block">
        <button
          type="button"
          aria-label="Change avatar"
          onClick={() => setPickEmoji((v) => !v)}
          className="w-16 h-16 rounded-full flex items-center justify-center text-white text-2xl font-semibold"
          style={{ backgroundColor: avatarColor }}
        >
          {emoji || name.charAt(0).toUpperCase()}
        </button>
        {pickEmoji && (
          <>
            {/* Click-away to close */}
            <button
              type="button"
              aria-label="Close picker"
              onClick={() => setPickEmoji(false)}
              className="fixed inset-0 z-20 cursor-default"
            />
            <div className="absolute left-0 z-30 mt-2 w-64 p-2 grid grid-cols-6 gap-1 rounded-xl bg-bg-panel-raised border border-border-subtle shadow-xl">
              {EMOJIS.map((e) => (
                <button
                  key={e}
                  type="button"
                  onClick={() => {
                    setProfile({ emoji: e });
                    setPickEmoji(false);
                  }}
                  className="w-9 h-9 flex items-center justify-center text-xl rounded-lg hover:bg-bg-panel-hover"
                >
                  {e}
                </button>
              ))}
              <button
                type="button"
                onClick={() => {
                  setProfile({ emoji: "" });
                  setPickEmoji(false);
                }}
                className="col-span-6 mt-1 text-[11px] text-text-muted hover:text-text-primary py-1"
              >
                Use initial instead
              </button>
            </div>
          </>
        )}
      </div>

      {/* Identity */}
      <div className="mt-3">
        {user ? (
          <>
            <EditableText
              value={displayName}
              onCommit={(v) => setProfile({ displayName: v })}
              placeholder={user.name}
              className="text-base font-semibold"
              inputClassName="text-base font-semibold"
            />
            <EditableText
              value={occupation}
              onCommit={(v) => setProfile({ occupation: v })}
              placeholder="add your profession…"
              className="text-xs text-text-secondary"
              inputClassName="text-xs"
            />
            <p className="text-[11px] text-text-muted mt-1 px-1.5 truncate">{user.email}</p>
            {city ? (
              <button
                type="button"
                onClick={detect}
                className="mt-1.5 px-1.5 flex items-center gap-1.5 text-xs text-text-secondary hover:text-text-primary transition-colors"
                title="Update location"
              >
                {countryCode ? (
                  <Flag code={countryCode} className="rounded-sm shrink-0" />
                ) : (
                  <span>📍</span>
                )}
                <span className="truncate">
                  {[city, region].filter(Boolean).join(", ")}
                </span>
              </button>
            ) : (
              <button
                type="button"
                onClick={detect}
                disabled={locating}
                className="mt-1.5 px-1.5 flex items-center gap-1 text-xs text-text-muted hover:text-text-primary transition-colors disabled:opacity-50"
              >
                📍 {locating ? "Locating…" : "Add location"}
              </button>
            )}
          </>
        ) : (
          <>
            <p className="text-base font-semibold text-text-primary px-1.5">Guest</p>
            <p className="text-xs text-text-secondary px-1.5 mt-1">
              Sign in to save your worlds and share your map.
            </p>
            <button
              type="button"
              onClick={() => setSignInOpen(true)}
              className="mt-3 h-9 px-4 rounded-lg text-sm font-medium border border-border-subtle text-text-primary hover:bg-bg-panel-hover transition-colors"
            >
              Sign in with Google
            </button>
          </>
        )}
      </div>

      {/* Sharing */}
      {user && (
        <div className="mt-5 pt-4 border-t border-border-subtle">
          <div className="flex items-center justify-between gap-2">
            <div>
              <p className="text-sm font-medium text-text-primary">
                {isPublic ? "Public" : "Private"}
              </p>
              <p className="text-[11px] text-text-muted">
                {isPublic ? "Listed on Explore" : "Only you can see this"}
              </p>
            </div>
            <Toggle
              on={isPublic}
              onClick={togglePublic}
              disabled={!isPublic && visibleWorlds.length === 0}
            />
          </div>
          {!isPublic && visibleWorlds.length === 0 && (
            <p className="text-[11px] text-text-muted mt-2">
              Add a world before sharing.
            </p>
          )}
          {isPublic && (
            <button
              type="button"
              onClick={copyShareLink}
              className="mt-3 w-full h-8 rounded-lg text-xs border border-border-subtle text-text-secondary hover:text-text-primary transition-colors"
            >
              {copied ? "Link copied!" : "Copy share link"}
            </button>
          )}
        </div>
      )}

      <AnimatePresence>
        {signInOpen && <GoogleSignInModal onClose={() => setSignInOpen(false)} />}
      </AnimatePresence>
    </div>
  );
}
