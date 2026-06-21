/**
 * Storage port. Decouples the stores from where data lives so the same
 * read/write seam (account.ts) can target localStorage today (LocalAdapter)
 * and Supabase later (SupabaseAdapter) without touching the stores.
 *
 * `base` is a logical bucket ("worlds" | "quests" | "notes" | "circles" |
 * "profile"). Account-level buckets pass `circleId: null`; circle-scoped
 * buckets pass the active circle id.
 */
export interface ScopeCtx {
  accountId: string;
  circleId: string | null;
}

export interface DataAdapter {
  read<T>(base: string, ctx: ScopeCtx): Promise<T | null>;
  write(base: string, data: unknown, ctx: ScopeCtx): Promise<void>;
}

function localKey(base: string, ctx: ScopeCtx): string {
  return ctx.circleId
    ? `questloop-${base}::${ctx.accountId}::${ctx.circleId}`
    : `questloop-${base}::${ctx.accountId}`;
}

/** Default adapter: per-account / per-circle namespaced localStorage. */
export const localAdapter: DataAdapter = {
  async read<T>(base: string, ctx: ScopeCtx): Promise<T | null> {
    if (typeof localStorage === "undefined") return null;
    const raw = localStorage.getItem(localKey(base, ctx));
    if (!raw) return null;
    try {
      return JSON.parse(raw) as T;
    } catch {
      return null;
    }
  },
  async write(base: string, data: unknown, ctx: ScopeCtx): Promise<void> {
    if (typeof localStorage === "undefined") return;
    localStorage.setItem(localKey(base, ctx), JSON.stringify(data));
  },
};
