import {
  XP_PER_FOCUS_MINUTE_BLOCK,
  XP_CAP_PER_SESSION,
  XP_QUEST_COMPLETE,
  XP_RITUAL_MIN,
  XP_RITUAL_TARGET,
  XP_RITUAL_STRETCH,
  XP_SAVE_POINT,
  XP_WEEKLY_REVIEW,
  XP_INBOX_RESOLVE,
  XP_INBOX_DAILY_CAP,
  XP_INTENTIONAL_PAUSE,
  LEVEL_EXPONENT,
  LEVEL_BASE_XP,
} from "@/lib/config";

export function calculateFocusXP(minutes: number): number {
  const blocks = Math.floor(minutes / XP_PER_FOCUS_MINUTE_BLOCK);
  return Math.min(blocks, XP_CAP_PER_SESSION);
}

export function calculateQuestCompleteXP(): number {
  return XP_QUEST_COMPLETE;
}

export function calculateRitualXP(
  version: "minimum" | "target" | "stretch"
): number {
  switch (version) {
    case "minimum":
      return XP_RITUAL_MIN;
    case "target":
      return XP_RITUAL_TARGET;
    case "stretch":
      return XP_RITUAL_STRETCH;
  }
}

export function calculateSavePointXP(): number {
  return XP_SAVE_POINT;
}

export function calculateWeeklyReviewXP(): number {
  return XP_WEEKLY_REVIEW;
}

export function calculateInboxResolveXP(resolvedToday: number): number {
  if (resolvedToday >= XP_INBOX_DAILY_CAP / XP_INBOX_RESOLVE) return 0;
  return XP_INBOX_RESOLVE;
}

export function calculatePauseXP(): number {
  return XP_INTENTIONAL_PAUSE;
}

export function xpRequiredForLevel(level: number): number {
  return Math.round(LEVEL_BASE_XP * Math.pow(level, LEVEL_EXPONENT));
}

export function levelFromTotalXP(totalXP: number): number {
  let level = 1;
  let xpNeeded = 0;
  while (true) {
    xpNeeded += xpRequiredForLevel(level);
    if (totalXP < xpNeeded) return level;
    level++;
  }
}

export function xpProgressInCurrentLevel(totalXP: number): {
  currentLevel: number;
  xpIntoLevel: number;
  xpNeededForNext: number;
  progressPercent: number;
} {
  let level = 1;
  let xpConsumed = 0;
  while (true) {
    const needed = xpRequiredForLevel(level);
    if (totalXP < xpConsumed + needed) {
      const xpIntoLevel = totalXP - xpConsumed;
      return {
        currentLevel: level,
        xpIntoLevel,
        xpNeededForNext: needed,
        progressPercent: Math.round((xpIntoLevel / needed) * 100),
      };
    }
    xpConsumed += needed;
    level++;
  }
}
