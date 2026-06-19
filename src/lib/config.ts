export const APP_NAME = "QuestLoop";
export const GUIDE_NAME = "CORE";

export const XP_PER_FOCUS_MINUTE_BLOCK = 5;
export const XP_CAP_PER_SESSION = 12;
export const XP_QUEST_COMPLETE = 10;
export const XP_RITUAL_MIN = 6;
export const XP_RITUAL_TARGET = 10;
export const XP_RITUAL_STRETCH = 13;
export const XP_SAVE_POINT = 3;
export const XP_WEEKLY_REVIEW = 15;
export const XP_INBOX_RESOLVE = 2;
export const XP_INBOX_DAILY_CAP = 10;
export const XP_INTENTIONAL_PAUSE = 5;
export const XP_MILESTONE_MIN = 20;
export const XP_MILESTONE_MAX = 50;

export const LEVEL_EXPONENT = 1.35;
export const LEVEL_BASE_XP = 100;

export const MAX_PRIMARY_WORLDS = 2;
export const CAPACITY_WARNING_THRESHOLD = 0.10;
export const MIN_SEGMENT_DEGREES = 12;
export const DEFAULT_WEEKLY_MINUTES = 600;
export const DEFAULT_MIN_FOCUS_MINUTES = 35;
export const DEFAULT_BUFFER_PERCENT = 0.15;

export const WORLD_COLORS = {
  interview: "#3B82F6",
  gym: "#F97316",
  systemDesign: "#8B5CF6",
  jobSearch: "#F59E0B",
  family: "#F43F5E",
  religious: "#10B981",
  household: "#14B8A6",
  finances: "#EAB308",
  personalCare: "#67E8F9",
  creative: "#EC4899",
  school: "#6366F1",
  // extended palette
  sky: "#0EA5E9",
  indigo: "#4F46E5",
  violet: "#A855F7",
  fuchsia: "#D946EF",
  rose: "#FB7185",
  red: "#EF4444",
  amber: "#D97706",
  lime: "#84CC16",
  green: "#22C55E",
  emerald: "#059669",
  teal: "#0D9488",
  cyan: "#06B6D4",
  brown: "#B45309",
  clay: "#C0784E",
  plum: "#7C3AED",
  slate: "#64748B",
  graphite: "#475569",
  custom: "#9CA3AF",
} as const;
