import { create } from "zustand";
import type { Circle } from "@/types/domain";

/**
 * The list of radial circles (maps) for the active account, plus which one is
 * active. Pure state — persistence and data loading on switch live in
 * account.ts (loadCircle). The UI switches circles via loadCircle(), not by
 * calling setActiveCircle directly.
 */
interface CircleStore {
  circles: Circle[];
  activeCircleId: string | null;

  setActiveCircle: (id: string | null) => void;
  createCircle: (name: string, kind?: string) => Circle;
  renameCircle: (id: string, name: string) => void;
  deleteCircle: (id: string) => void;
  getActiveCircle: () => Circle | undefined;
}

export const useCircleStore = create<CircleStore>((set, get) => ({
  circles: [],
  activeCircleId: null,

  setActiveCircle: (id) => set({ activeCircleId: id }),

  createCircle: (name, kind = "") => {
    const now = new Date().toISOString();
    const circle: Circle = {
      id: `circle-${Date.now()}`,
      ownerId: "",
      name: name.trim() || "New circle",
      kind,
      sortOrder: get().circles.length,
      createdAt: now,
      updatedAt: now,
    };
    set((state) => ({ circles: [...state.circles, circle] }));
    return circle;
  },

  renameCircle: (id, name) => {
    set((state) => ({
      circles: state.circles.map((c) =>
        c.id === id
          ? { ...c, name: name.trim() || c.name, updatedAt: new Date().toISOString() }
          : c
      ),
    }));
  },

  deleteCircle: (id) => {
    set((state) => ({
      circles: state.circles.filter((c) => c.id !== id),
      activeCircleId:
        state.activeCircleId === id
          ? (state.circles.find((c) => c.id !== id)?.id ?? null)
          : state.activeCircleId,
    }));
  },

  getActiveCircle: () =>
    get().circles.find((c) => c.id === get().activeCircleId),
}));
