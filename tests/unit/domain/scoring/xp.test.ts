import { describe, it, expect } from "vitest";
import {
  calculateFocusXP,
  calculateQuestCompleteXP,
  calculateRitualXP,
  calculateSavePointXP,
  calculateWeeklyReviewXP,
  calculateInboxResolveXP,
  xpRequiredForLevel,
  levelFromTotalXP,
  xpProgressInCurrentLevel,
} from "@/domain/scoring/xp";

describe("calculateFocusXP", () => {
  it("awards 1 XP per 5-minute block", () => {
    expect(calculateFocusXP(10)).toBe(2);
    expect(calculateFocusXP(25)).toBe(5);
    expect(calculateFocusXP(45)).toBe(9);
  });

  it("caps at 12 XP per session", () => {
    expect(calculateFocusXP(120)).toBe(12);
    expect(calculateFocusXP(200)).toBe(12);
  });

  it("returns 0 for very short sessions", () => {
    expect(calculateFocusXP(0)).toBe(0);
    expect(calculateFocusXP(4)).toBe(0);
  });

  it("floors partial blocks", () => {
    expect(calculateFocusXP(7)).toBe(1);
    expect(calculateFocusXP(14)).toBe(2);
  });
});

describe("calculateQuestCompleteXP", () => {
  it("returns 10 XP", () => {
    expect(calculateQuestCompleteXP()).toBe(10);
  });
});

describe("calculateRitualXP", () => {
  it("returns correct XP for each version", () => {
    expect(calculateRitualXP("minimum")).toBe(6);
    expect(calculateRitualXP("target")).toBe(10);
    expect(calculateRitualXP("stretch")).toBe(13);
  });
});

describe("calculateSavePointXP", () => {
  it("returns 3 XP", () => {
    expect(calculateSavePointXP()).toBe(3);
  });
});

describe("calculateWeeklyReviewXP", () => {
  it("returns 15 XP", () => {
    expect(calculateWeeklyReviewXP()).toBe(15);
  });
});

describe("calculateInboxResolveXP", () => {
  it("returns 2 XP when under daily cap", () => {
    expect(calculateInboxResolveXP(0)).toBe(2);
    expect(calculateInboxResolveXP(3)).toBe(2);
  });

  it("returns 0 XP when daily cap reached", () => {
    expect(calculateInboxResolveXP(5)).toBe(0);
    expect(calculateInboxResolveXP(10)).toBe(0);
  });
});

describe("xpRequiredForLevel", () => {
  it("returns increasing XP requirements", () => {
    const lvl1 = xpRequiredForLevel(1);
    const lvl2 = xpRequiredForLevel(2);
    const lvl5 = xpRequiredForLevel(5);
    expect(lvl2).toBeGreaterThan(lvl1);
    expect(lvl5).toBeGreaterThan(lvl2);
  });

  it("level 1 requires 100 XP", () => {
    expect(xpRequiredForLevel(1)).toBe(100);
  });
});

describe("levelFromTotalXP", () => {
  it("starts at level 1 with 0 XP", () => {
    expect(levelFromTotalXP(0)).toBe(1);
  });

  it("reaches level 2 after enough XP", () => {
    const needed = xpRequiredForLevel(1);
    expect(levelFromTotalXP(needed)).toBe(2);
  });

  it("handles large XP values", () => {
    expect(levelFromTotalXP(10000)).toBeGreaterThan(5);
  });
});

describe("xpProgressInCurrentLevel", () => {
  it("returns correct progress for 0 XP", () => {
    const progress = xpProgressInCurrentLevel(0);
    expect(progress.currentLevel).toBe(1);
    expect(progress.xpIntoLevel).toBe(0);
    expect(progress.progressPercent).toBe(0);
  });

  it("returns correct progress mid-level", () => {
    const progress = xpProgressInCurrentLevel(50);
    expect(progress.currentLevel).toBe(1);
    expect(progress.xpIntoLevel).toBe(50);
    expect(progress.progressPercent).toBe(50);
  });

  it("advances to next level when XP threshold passed", () => {
    const lvl1Req = xpRequiredForLevel(1);
    const progress = xpProgressInCurrentLevel(lvl1Req + 10);
    expect(progress.currentLevel).toBe(2);
    expect(progress.xpIntoLevel).toBe(10);
  });
});
