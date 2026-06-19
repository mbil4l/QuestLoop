import { create } from "zustand";

interface NotesStore {
  homeNotes: string;
  worldNotes: Record<string, string>;
  setHomeNotes: (value: string) => void;
  setWorldNotes: (worldId: string, value: string) => void;
}

export const useNotesStore = create<NotesStore>((set) => ({
  homeNotes: "",
  worldNotes: {},
  setHomeNotes: (value) => set({ homeNotes: value }),
  setWorldNotes: (worldId, value) =>
    set((state) => ({
      worldNotes: { ...state.worldNotes, [worldId]: value },
    })),
}));
