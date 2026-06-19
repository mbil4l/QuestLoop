import { create } from "zustand";
import { persist } from "zustand/middleware";

export type QuestSortKey =
  | "manual"
  | "priority"
  | "due"
  | "importance"
  | "alpha";

export interface ListPrefs {
  sortBy: QuestSortKey;
  hideCompleted: boolean;
  density: "comfortable" | "compact";
  showNextMove: boolean;
  showDue: boolean;
  showEstimate: boolean;
  showImportance: boolean;
}

export const DEFAULT_LIST_PREFS: ListPrefs = {
  sortBy: "priority",
  hideCompleted: false,
  density: "comfortable",
  showNextMove: true,
  showDue: true,
  showEstimate: false,
  showImportance: true,
};

interface UIStore {
  listPrefs: ListPrefs;
  setListPref: <K extends keyof ListPrefs>(key: K, value: ListPrefs[K]) => void;
  resetListPrefs: () => void;
}

export const useUIStore = create<UIStore>()(
  persist(
    (set) => ({
      listPrefs: DEFAULT_LIST_PREFS,
      setListPref: (key, value) =>
        set((state) => ({ listPrefs: { ...state.listPrefs, [key]: value } })),
      resetListPrefs: () => set({ listPrefs: DEFAULT_LIST_PREFS }),
    }),
    {
      name: "questloop-ui",
      partialize: (state) => ({ listPrefs: state.listPrefs }),
    }
  )
);
