import { create } from "zustand";
import type { UserProfile, AvatarConfig, CoreGuideState } from "@/types/domain";
import type { CoreGuideAnimation, PlanningMode } from "@/types/enums";
import { SEED_USER, SEED_AVATAR } from "@/lib/seed-data";
import { xpProgressInCurrentLevel } from "@/domain/scoring/xp";

interface UserStore {
  profile: UserProfile | null;
  avatar: AvatarConfig | null;
  coreGuide: CoreGuideState;
  isAuthenticated: boolean;

  fetchProfile: () => void;
  updateProfile: (updates: Partial<UserProfile>) => void;
  updateAvatar: (updates: Partial<AvatarConfig>) => void;
  setCoreGuideAnimation: (animation: CoreGuideAnimation) => void;
  addXP: (amount: number) => void;
  setPlanningMode: (mode: PlanningMode) => void;

  getXPProgress: () => {
    currentLevel: number;
    xpIntoLevel: number;
    xpNeededForNext: number;
    progressPercent: number;
  };
}

const defaultCoreGuide: CoreGuideState = {
  id: "cg-001",
  userId: "demo-user-001",
  animation: "idle",
  dialogueEnabled: true,
  soundEnabled: false,
  lastRecommendationAt: null,
};

export const useUserStore = create<UserStore>((set, get) => ({
  profile: null,
  avatar: null,
  coreGuide: defaultCoreGuide,
  isAuthenticated: false,

  fetchProfile: () => {
    set({
      profile: SEED_USER,
      avatar: SEED_AVATAR,
      isAuthenticated: true,
    });
  },

  updateProfile: (updates) => {
    set((state) => ({
      profile: state.profile
        ? { ...state.profile, ...updates, updatedAt: new Date().toISOString() }
        : null,
    }));
  },

  updateAvatar: (updates) => {
    set((state) => ({
      avatar: state.avatar ? { ...state.avatar, ...updates } : null,
    }));
  },

  setCoreGuideAnimation: (animation) => {
    set((state) => ({
      coreGuide: { ...state.coreGuide, animation },
    }));
  },

  addXP: (amount) => {
    set((state) => {
      if (!state.profile) return state;
      const newTotalXp = state.profile.totalXp + amount;
      const { currentLevel } = xpProgressInCurrentLevel(newTotalXp);
      return {
        profile: {
          ...state.profile,
          totalXp: newTotalXp,
          level: currentLevel,
          updatedAt: new Date().toISOString(),
        },
      };
    });
  },

  setPlanningMode: (mode) => {
    get().updateProfile({ planningMode: mode });
  },

  getXPProgress: () => {
    const profile = get().profile;
    if (!profile) return { currentLevel: 1, xpIntoLevel: 0, xpNeededForNext: 100, progressPercent: 0 };
    return xpProgressInCurrentLevel(profile.totalXp);
  },
}));
