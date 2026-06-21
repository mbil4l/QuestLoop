import { useWorldStore } from "@/lib/stores/world-store";
import { useQuestStore } from "@/lib/stores/quest-store";
import { useNotesStore } from "@/lib/stores/notes-store";
import { useProfileStore } from "@/lib/stores/profile-store";
import { useCircleStore } from "@/lib/stores/circle-store";
import type { Circle, World } from "@/types/domain";
import { type DataAdapter, type ScopeCtx, localAdapter } from "@/lib/data/adapter";

/**
 * Per-account, per-circle persistence. An account owns a list of circles
 * (radial maps); each circle owns its own worlds/quests/notes. Profile and the
 * circle list are account-level; worlds/quests/notes are circle-level.
 *
 * Reads/writes go through a swappable {@link DataAdapter} — localStorage today,
 * Supabase later. Switch adapters with {@link setAdapter} after auth changes,
 * then call {@link loadAccount}.
 */

let currentAccountId = "guest";
let currentCircleId: string | null = null;
let adapter: DataAdapter = localAdapter;
let subscribed = false;

/** Account-level scope (circle list, profile). */
function acctCtx(): ScopeCtx {
  return { accountId: currentAccountId, circleId: null };
}

/** Active-circle scope (worlds, quests, notes). Read at write time. */
function circleCtx(): ScopeCtx {
  return { accountId: currentAccountId, circleId: currentCircleId };
}

/** Swap the storage backend (e.g. Supabase once the user is signed in). */
export function setAdapter(next: DataAdapter): void {
  adapter = next;
}

export function getCurrentAccountId(): string {
  return currentAccountId;
}

interface CirclesRecord {
  circles: Circle[];
  activeCircleId: string | null;
}

/**
 * One-time move of legacy un-namespaced data (questloop-<base>::<accountId>)
 * into the new circle-scoped key for the default circle. localStorage only.
 */
function migrateLegacy(accountId: string, circleId: string): void {
  if (typeof localStorage === "undefined") return;
  for (const base of ["worlds", "quests", "notes"]) {
    const legacyKey = `questloop-${base}::${accountId}`;
    const raw = localStorage.getItem(legacyKey);
    if (raw == null) continue;
    const newKey = `questloop-${base}::${accountId}::${circleId}`;
    if (localStorage.getItem(newKey) == null) localStorage.setItem(newKey, raw);
    localStorage.removeItem(legacyKey);
  }
}

function ensureSubscriptions(): void {
  if (subscribed) return;
  subscribed = true;
  useWorldStore.subscribe((s) =>
    void adapter.write("worlds", { worlds: s.worlds }, circleCtx())
  );
  useQuestStore.subscribe((s) =>
    void adapter.write(
      "quests",
      { quests: s.quests, objectives: s.objectives, rituals: s.rituals },
      circleCtx()
    )
  );
  useNotesStore.subscribe((s) =>
    void adapter.write(
      "notes",
      { homeNotes: s.homeNotes, worldNotes: s.worldNotes },
      circleCtx()
    )
  );
  useProfileStore.subscribe((s) =>
    void adapter.write(
      "profile",
      {
        displayName: s.displayName,
        occupation: s.occupation,
        emoji: s.emoji,
        city: s.city,
        region: s.region,
        countryCode: s.countryCode,
      },
      acctCtx()
    )
  );
  useCircleStore.subscribe((s) =>
    void adapter.write(
      "circles",
      { circles: s.circles, activeCircleId: s.activeCircleId },
      acctCtx()
    )
  );
}

/** Load worlds/quests/notes for one circle and make it active. */
export async function loadCircle(circleId: string): Promise<void> {
  currentCircleId = circleId;
  useCircleStore.getState().setActiveCircle(circleId);

  const w = await adapter.read<{ worlds: World[] }>("worlds", circleCtx());
  useWorldStore.setState({
    // Stamp circleId defensively (legacy worlds predate the field).
    worlds: (w?.worlds ?? []).map((x) => ({ ...x, circleId })),
    selectedWorldId: null,
  });

  const q = await adapter.read<{
    quests: unknown[];
    objectives: unknown[];
    rituals: unknown[];
  }>("quests", circleCtx());
  useQuestStore.setState({
    quests: (q?.quests as never) ?? [],
    objectives: (q?.objectives as never) ?? [],
    rituals: (q?.rituals as never) ?? [],
  });

  const n = await adapter.read<{
    homeNotes: string;
    worldNotes: Record<string, string>;
  }>("notes", circleCtx());
  useNotesStore.setState({
    homeNotes: n?.homeNotes ?? "",
    worldNotes: n?.worldNotes ?? {},
  });
}

export async function loadAccount(accountId: string): Promise<void> {
  currentAccountId = accountId;
  currentCircleId = null;

  const p = await adapter.read<{
    displayName: string;
    occupation: string;
    emoji: string;
    city: string;
    region: string;
    countryCode: string;
  }>("profile", acctCtx());
  useProfileStore.setState({
    displayName: p?.displayName ?? "",
    occupation: p?.occupation ?? "",
    emoji: p?.emoji ?? "",
    city: p?.city ?? "",
    region: p?.region ?? "",
    countryCode: p?.countryCode ?? "",
  });

  const rec = await adapter.read<CirclesRecord>("circles", acctCtx());
  let circles = rec?.circles ?? [];
  let activeCircleId = rec?.activeCircleId ?? null;

  if (circles.length === 0) {
    // First run for this account under the circle model: seed a default circle
    // and pull any pre-existing flat data into it.
    const now = new Date().toISOString();
    const def: Circle = {
      id: `circle-${Date.now()}`,
      ownerId: accountId,
      name: "My Goals",
      kind: "",
      sortOrder: 0,
      createdAt: now,
      updatedAt: now,
    };
    circles = [def];
    activeCircleId = def.id;
    if (adapter === localAdapter) migrateLegacy(accountId, def.id);
    await adapter.write("circles", { circles, activeCircleId }, acctCtx());
  } else if (!activeCircleId || !circles.some((c) => c.id === activeCircleId)) {
    activeCircleId = circles[0].id;
  }

  useCircleStore.setState({ circles, activeCircleId });
  await loadCircle(activeCircleId as string);

  ensureSubscriptions();
}

/**
 * Create a new circle, persist it, and switch to it (empty). Returns the id.
 */
export async function createAndSwitchCircle(
  name: string,
  kind = ""
): Promise<string> {
  const circle = useCircleStore.getState().createCircle(name, kind);
  // Stamp ownership now that we know the account.
  useCircleStore.setState((s) => ({
    circles: s.circles.map((c) =>
      c.id === circle.id ? { ...c, ownerId: currentAccountId } : c
    ),
  }));
  await loadCircle(circle.id);
  return circle.id;
}

/**
 * Delete a circle and switch to a remaining one (or a fresh default if none
 * remain). Persists the updated list.
 */
export async function deleteCircleAndSwitch(circleId: string): Promise<void> {
  useCircleStore.getState().deleteCircle(circleId);
  let next = useCircleStore.getState().activeCircleId;
  if (!next) {
    next = await createAndSwitchCircle("My Goals");
    return;
  }
  await loadCircle(next);
}

/**
 * Read one circle's stored data without disturbing the active circle. Used by
 * the markdown exporter to dump every circle. Works for any adapter.
 */
export async function readCircleData(circleId: string): Promise<{
  worlds: World[];
  quests: unknown[];
  objectives: unknown[];
  rituals: unknown[];
  homeNotes: string;
  worldNotes: Record<string, string>;
}> {
  const ctx: ScopeCtx = { accountId: currentAccountId, circleId };
  const w = await adapter.read<{ worlds: World[] }>("worlds", ctx);
  const q = await adapter.read<{
    quests: unknown[];
    objectives: unknown[];
    rituals: unknown[];
  }>("quests", ctx);
  const n = await adapter.read<{
    homeNotes: string;
    worldNotes: Record<string, string>;
  }>("notes", ctx);
  return {
    worlds: w?.worlds ?? [],
    quests: q?.quests ?? [],
    objectives: q?.objectives ?? [],
    rituals: q?.rituals ?? [],
    homeNotes: n?.homeNotes ?? "",
    worldNotes: n?.worldNotes ?? {},
  };
}

/**
 * Reset the active circle: clear its worlds, quests/objectives/rituals, and
 * notes, persisting the emptied state. Profile/identity is left untouched.
 */
export function clearAccount(): void {
  useWorldStore.setState({ worlds: [], selectedWorldId: null });
  useQuestStore.setState({ quests: [], objectives: [], rituals: [] });
  useNotesStore.setState({ homeNotes: "", worldNotes: {} });

  void adapter.write("worlds", { worlds: [] }, circleCtx());
  void adapter.write(
    "quests",
    { quests: [], objectives: [], rituals: [] },
    circleCtx()
  );
  void adapter.write("notes", { homeNotes: "", worldNotes: {} }, circleCtx());
}
