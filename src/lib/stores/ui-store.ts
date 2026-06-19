import { create } from "zustand";
import { persist } from "zustand/middleware";

export type QuestSortKey =
  | "manual"
  | "priority"
  | "due"
  | "importance"
  | "alpha";

export const SORT_LABELS: Record<QuestSortKey, string> = {
  priority: "Priority",
  due: "Due date",
  importance: "Importance",
  alpha: "A → Z",
  manual: "Manual",
};

export const DEFAULT_SORT: QuestSortKey = "priority";

export interface ListPrefs {
  hideCompleted: boolean;
  density: "comfortable" | "compact";
  showNextMove: boolean;
  showDue: boolean;
  showEstimate: boolean;
  showImportance: boolean;
}

export const DEFAULT_LIST_PREFS: ListPrefs = {
  hideCompleted: false,
  density: "comfortable",
  showNextMove: true,
  showDue: true,
  showEstimate: false,
  showImportance: true,
};

interface UIStore {
  listPrefs: ListPrefs;
  /** Sort key per world — each list remembers its own order. */
  worldSort: Record<string, QuestSortKey>;
  setListPref: <K extends keyof ListPrefs>(key: K, value: ListPrefs[K]) => void;
  setWorldSort: (worldId: string, key: QuestSortKey) => void;
  resetListPrefs: () => void;
}

export const useUIStore = create<UIStore>()(
  persist(
    (set) => ({
      listPrefs: DEFAULT_LIST_PREFS,
      worldSort: {},
      setListPref: (key, value) =>
        set((state) => ({ listPrefs: { ...state.listPrefs, [key]: value } })),
      setWorldSort: (worldId, key) =>
        set((state) => ({
          worldSort: { ...state.worldSort, [worldId]: key },
        })),
      resetListPrefs: () => set({ listPrefs: DEFAULT_LIST_PREFS }),
    }),
    {
      name: "questloop-ui",
      partialize: (state) => ({
        listPrefs: state.listPrefs,
        worldSort: state.worldSort,
      }),
    }
  )
);
