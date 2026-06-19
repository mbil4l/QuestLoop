import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { World } from "@/types/domain";
import type { WorldStatus } from "@/types/enums";
import { canTransitionStatus } from "@/domain/models/world";
import { SEED_WORLDS } from "@/lib/seed-data";

interface WorldStore {
  worlds: World[];
  selectedWorldId: string | null;
  loading: boolean;

  seedIfEmpty: () => void;
  fetchWorlds: () => void;
  selectWorld: (id: string | null) => void;
  createWorld: (world: Omit<World, "id" | "createdAt" | "updatedAt">) => string;
  updateWorld: (id: string, updates: Partial<World>) => void;
  deleteWorld: (id: string) => void;
  updateWorldStatus: (id: string, newStatus: WorldStatus) => boolean;
  getActiveWorlds: () => World[];
  getWorldById: (id: string) => World | undefined;
}

export const useWorldStore = create<WorldStore>()(
  persist(
    (set, get) => ({
      worlds: [],
      selectedWorldId: null,
      loading: false,

      seedIfEmpty: () => {
        if (get().worlds.length === 0) set({ worlds: SEED_WORLDS });
      },

      fetchWorlds: () => {
        set({ worlds: SEED_WORLDS, loading: false });
      },

      selectWorld: (id) => set({ selectedWorldId: id }),

      createWorld: (worldData) => {
        const id = `world-${Date.now()}`;
        const world: World = {
          ...worldData,
          id,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        set((state) => ({ worlds: [...state.worlds, world] }));
        return id;
      },

      updateWorld: (id, updates) => {
        set((state) => ({
          worlds: state.worlds.map((w) =>
            w.id === id
              ? { ...w, ...updates, updatedAt: new Date().toISOString() }
              : w
          ),
        }));
      },

      deleteWorld: (id) => {
        set((state) => ({
          worlds: state.worlds.filter((w) => w.id !== id),
          selectedWorldId:
            state.selectedWorldId === id ? null : state.selectedWorldId,
        }));
      },

      updateWorldStatus: (id, newStatus) => {
        const world = get().worlds.find((w) => w.id === id);
        if (!world) return false;
        if (!canTransitionStatus(world.status, newStatus)) return false;

        const updates: Partial<World> = { status: newStatus };
        if (newStatus === "PAUSED") {
          updates.pauseReason = updates.pauseReason ?? "";
        }
        if (newStatus !== "PAUSED") {
          updates.pauseReason = null;
          updates.resumeReviewAt = null;
          updates.resumeCondition = null;
        }

        get().updateWorld(id, updates);
        return true;
      },

      getActiveWorlds: () =>
        get().worlds.filter(
          (w) => w.status !== "PAUSED" && w.status !== "COMPLETED"
        ),

      getWorldById: (id) => get().worlds.find((w) => w.id === id),
    }),
    {
      name: "questloop-worlds",
      skipHydration: true,
      partialize: (state) => ({ worlds: state.worlds }),
    }
  )
);
