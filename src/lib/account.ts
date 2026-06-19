import { useWorldStore } from "@/lib/stores/world-store";
import { useQuestStore } from "@/lib/stores/quest-store";
import { useNotesStore } from "@/lib/stores/notes-store";
import { useProfileStore } from "@/lib/stores/profile-store";

/**
 * Per-account persistence. Each user's worlds/quests/notes/profile live under
 * a localStorage key namespaced by the active account id. We read on
 * loadAccount() and write on every store change via subscriptions.
 *
 * This is the seam for a real backend: replace read()/write() with Supabase
 * queries keyed by the authenticated user id, and call loadAccount() after
 * auth state changes.
 */

let currentAccountId = "guest";
let subscribed = false;

function key(base: string): string {
  return `questloop-${base}::${currentAccountId}`;
}

function read<T>(base: string): T | null {
  if (typeof localStorage === "undefined") return null;
  const raw = localStorage.getItem(key(base));
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function write(base: string, data: unknown): void {
  if (typeof localStorage === "undefined") return;
  localStorage.setItem(key(base), JSON.stringify(data));
}

function ensureSubscriptions(): void {
  if (subscribed) return;
  subscribed = true;
  useWorldStore.subscribe((s) => write("worlds", { worlds: s.worlds }));
  useQuestStore.subscribe((s) =>
    write("quests", {
      quests: s.quests,
      objectives: s.objectives,
      rituals: s.rituals,
    })
  );
  useNotesStore.subscribe((s) =>
    write("notes", { homeNotes: s.homeNotes, worldNotes: s.worldNotes })
  );
  useProfileStore.subscribe((s) =>
    write("profile", {
      displayName: s.displayName,
      occupation: s.occupation,
      emoji: s.emoji,
      city: s.city,
      region: s.region,
      countryCode: s.countryCode,
    })
  );
}

export function loadAccount(accountId: string): void {
  currentAccountId = accountId;

  const w = read<{ worlds: unknown[] }>("worlds");

  useWorldStore.setState({
    worlds: (w?.worlds as never) ?? [],
    selectedWorldId: null,
  });

  const q = read<{ quests: unknown[]; objectives: unknown[]; rituals: unknown[] }>(
    "quests"
  );
  useQuestStore.setState({
    quests: (q?.quests as never) ?? [],
    objectives: (q?.objectives as never) ?? [],
    rituals: (q?.rituals as never) ?? [],
  });

  const n = read<{ homeNotes: string; worldNotes: Record<string, string> }>(
    "notes"
  );
  useNotesStore.setState({
    homeNotes: n?.homeNotes ?? "",
    worldNotes: n?.worldNotes ?? {},
  });

  const p = read<{
    displayName: string;
    occupation: string;
    emoji: string;
    city: string;
    region: string;
    countryCode: string;
  }>("profile");
  useProfileStore.setState({
    displayName: p?.displayName ?? "",
    occupation: p?.occupation ?? "",
    emoji: p?.emoji ?? "",
    city: p?.city ?? "",
    region: p?.region ?? "",
    countryCode: p?.countryCode ?? "",
  });

  // No prebuilt template: every account — guest or signed-in — starts with an
  // empty map and builds it themselves. An empty map persists as empty.

  ensureSubscriptions();
}

/**
 * Reset the active account's map: clear all worlds, quests/objectives/rituals,
 * and notes, and persist the emptied state so it survives a reload (the demo
 * map is not re-seeded). Profile/identity is left untouched.
 */
export function clearAccount(): void {
  useWorldStore.setState({ worlds: [], selectedWorldId: null });
  useQuestStore.setState({ quests: [], objectives: [], rituals: [] });
  useNotesStore.setState({ homeNotes: "", worldNotes: {} });

  // Subscriptions also persist this, but write explicitly so the cleared state
  // is durable even if they haven't been attached yet.
  write("worlds", { worlds: [] });
  write("quests", { quests: [], objectives: [], rituals: [] });
  write("notes", { homeNotes: "", worldNotes: {} });
}
