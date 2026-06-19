import { create } from "zustand";
import type { Quest, Objective, Ritual } from "@/types/domain";
import { SEED_QUESTS, SEED_OBJECTIVES, SEED_RITUALS } from "@/lib/seed-data";

interface QuestStore {
  quests: Quest[];
  objectives: Objective[];
  rituals: Ritual[];
  loading: boolean;

  seedIfEmpty: () => void;
  fetchAll: () => void;
  getQuestsByWorld: (worldId: string) => Quest[];
  getObjectivesByWorld: (worldId: string) => Objective[];
  getRitualsByWorld: (worldId: string) => Ritual[];
  getActiveQuests: () => Quest[];
  getNextMoves: () => Quest[];

  createQuest: (quest: Omit<Quest, "id" | "createdAt" | "updatedAt">) => void;
  updateQuest: (id: string, updates: Partial<Quest>) => void;
  toggleQuestComplete: (id: string) => void;
  completeQuest: (id: string) => void;
  deleteQuest: (id: string) => void;
  moveQuest: (id: string, direction: "up" | "down") => void;

  createObjective: (obj: Omit<Objective, "id" | "createdAt" | "updatedAt">) => void;
  updateObjective: (id: string, updates: Partial<Objective>) => void;

  createRitual: (ritual: Omit<Ritual, "id" | "createdAt" | "updatedAt">) => void;
  updateRitual: (id: string, updates: Partial<Ritual>) => void;
}

export const useQuestStore = create<QuestStore>((set, get) => ({
      quests: [],
      objectives: [],
      rituals: [],
      loading: false,

      seedIfEmpty: () => {
        if (
          get().quests.length === 0 &&
          get().objectives.length === 0 &&
          get().rituals.length === 0
        ) {
          set({
            quests: SEED_QUESTS,
            objectives: SEED_OBJECTIVES,
            rituals: SEED_RITUALS,
          });
        }
      },

      fetchAll: () => {
        set({
          quests: SEED_QUESTS,
          objectives: SEED_OBJECTIVES,
          rituals: SEED_RITUALS,
          loading: false,
        });
      },

      getQuestsByWorld: (worldId) =>
        get().quests.filter((q) => q.worldId === worldId),

      getObjectivesByWorld: (worldId) =>
        get().objectives.filter((o) => o.worldId === worldId),

      getRitualsByWorld: (worldId) =>
        get().rituals.filter((r) => r.worldId === worldId),

      getActiveQuests: () =>
        get().quests.filter((q) => !q.isCompleted && q.status === "active"),

      getNextMoves: () =>
        get()
          .quests.filter(
            (q) => !q.isCompleted && q.nextMove && q.nextMove.trim().length > 0
          )
          .sort((a, b) => b.priorityScore - a.priorityScore),

      createQuest: (questData) => {
        const quest: Quest = {
          ...questData,
          id: `quest-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        set((state) => ({ quests: [...state.quests, quest] }));
      },

      updateQuest: (id, updates) => {
        set((state) => ({
          quests: state.quests.map((q) =>
            q.id === id
              ? { ...q, ...updates, updatedAt: new Date().toISOString() }
              : q
          ),
        }));
      },

      toggleQuestComplete: (id) => {
        set((state) => ({
          quests: state.quests.map((q) => {
            if (q.id !== id) return q;
            const isCompleted = !q.isCompleted;
            return {
              ...q,
              isCompleted,
              status: isCompleted ? ("completed" as const) : ("active" as const),
              completedAt: isCompleted ? new Date().toISOString() : null,
              updatedAt: new Date().toISOString(),
            };
          }),
        }));
      },

      completeQuest: (id) => {
        set((state) => ({
          quests: state.quests.map((q) =>
            q.id === id
              ? {
                  ...q,
                  isCompleted: true,
                  status: "completed" as const,
                  completedAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString(),
                }
              : q
          ),
        }));
      },

      deleteQuest: (id) => {
        set((state) => ({
          quests: state.quests.filter((q) => q.id !== id),
        }));
      },

      moveQuest: (id, direction) => {
        set((state) => {
          const quests = [...state.quests];
          const index = quests.findIndex((q) => q.id === id);
          if (index === -1) return state;
          const swapWith = direction === "up" ? index - 1 : index + 1;
          if (swapWith < 0 || swapWith >= quests.length) return state;
          [quests[index], quests[swapWith]] = [quests[swapWith], quests[index]];
          return { quests };
        });
      },

      createObjective: (objData) => {
        const obj: Objective = {
          ...objData,
          id: `obj-${Date.now()}`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        set((state) => ({ objectives: [...state.objectives, obj] }));
      },

      updateObjective: (id, updates) => {
        set((state) => ({
          objectives: state.objectives.map((o) =>
            o.id === id
              ? { ...o, ...updates, updatedAt: new Date().toISOString() }
              : o
          ),
        }));
      },

      createRitual: (ritualData) => {
        const ritual: Ritual = {
          ...ritualData,
          id: `ritual-${Date.now()}`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        set((state) => ({ rituals: [...state.rituals, ritual] }));
      },

      updateRitual: (id, updates) => {
        set((state) => ({
          rituals: state.rituals.map((r) =>
            r.id === id
              ? { ...r, ...updates, updatedAt: new Date().toISOString() }
              : r
          ),
        }));
      },
}));
