import { describe, it, expect } from "vitest";
import {
  calculateWorldHealth,
  calculateCoreHealth,
  healthLabel,
} from "@/domain/scoring/health";
import type { World, Quest } from "@/types/domain";

const makeWorld = (overrides: Partial<World> = {}): World => ({
  id: "w1",
  userId: "u1",
  name: "Test World",
  purpose: "Test purpose",
  color: "#3B82F6",
  icon: "star",
  status: "PRIMARY",
  weeklyTargetMinutes: 300,
  preferredCadence: "daily",
  demandType: "DEEP_THINKING",
  importance: 4,
  health: 80,
  sortOrder: 0,
  pauseReason: null,
  resumeReviewAt: null,
  resumeCondition: null,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  ...overrides,
});

const makeQuest = (overrides: Partial<Quest> = {}): Quest => ({
  id: "q1",
  worldId: "w1",
  objectiveId: null,
  campaignId: null,
  title: "Test Quest",
  description: "",
  nextMove: "Do something",
  status: "active",
  dueAt: null,
  estimatedMinutes: 30,
  importance: 3,
  consequence: "",
  demandType: "DEEP_THINKING",
  difficulty: 2,
  priorityScore: 50,
  priorityOverride: null,
  rescheduleCount: 0,
  waitingForId: null,
  isCompleted: false,
  completedAt: null,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  ...overrides,
});

describe("calculateWorldHealth", () => {
  it("returns full health for a well-maintained world", () => {
    const result = calculateWorldHealth({
      world: makeWorld(),
      quests: [makeQuest()],
      daysSinceLastActivity: 0,
      hasNextMove: true,
      hasSavePoint: true,
      allocationActualRatio: 1.0,
    });
    expect(result.score).toBe(100);
    expect(result.factors.length).toBeGreaterThan(0);
  });

  it("returns Stored status for paused worlds", () => {
    const result = calculateWorldHealth({
      world: makeWorld({ status: "PAUSED" }),
      quests: [],
      daysSinceLastActivity: 30,
      hasNextMove: false,
      hasSavePoint: false,
      allocationActualRatio: 0,
    });
    expect(result.score).toBe(-1);
    expect(result.factors[0].name).toBe("Stored");
  });

  it("penalizes worlds with overdue quests", () => {
    const yesterday = new Date(Date.now() - 86400000).toISOString();
    const result = calculateWorldHealth({
      world: makeWorld(),
      quests: [
        makeQuest({ dueAt: yesterday }),
        makeQuest({ id: "q2", dueAt: yesterday }),
        makeQuest({ id: "q3", dueAt: yesterday }),
      ],
      daysSinceLastActivity: 0,
      hasNextMove: true,
      hasSavePoint: true,
      allocationActualRatio: 1.0,
    });
    expect(result.score).toBeLessThan(100);
  });

  it("penalizes worlds with no recent activity", () => {
    const active = calculateWorldHealth({
      world: makeWorld(),
      quests: [],
      daysSinceLastActivity: 0,
      hasNextMove: true,
      hasSavePoint: true,
      allocationActualRatio: 1.0,
    });
    const inactive = calculateWorldHealth({
      world: makeWorld(),
      quests: [],
      daysSinceLastActivity: 15,
      hasNextMove: true,
      hasSavePoint: true,
      allocationActualRatio: 1.0,
    });
    expect(inactive.score).toBeLessThan(active.score);
  });

  it("penalizes worlds without a next move", () => {
    const withMove = calculateWorldHealth({
      world: makeWorld(),
      quests: [],
      daysSinceLastActivity: 0,
      hasNextMove: true,
      hasSavePoint: true,
      allocationActualRatio: 1.0,
    });
    const withoutMove = calculateWorldHealth({
      world: makeWorld(),
      quests: [],
      daysSinceLastActivity: 0,
      hasNextMove: false,
      hasSavePoint: true,
      allocationActualRatio: 1.0,
    });
    expect(withoutMove.score).toBeLessThan(withMove.score);
  });
});

describe("calculateCoreHealth", () => {
  it("returns high health for a well-planned system", () => {
    const result = calculateCoreHealth({
      worlds: [makeWorld()],
      worldHealthScores: [90],
      unprocessedInboxCount: 0,
      overdueReminderCount: 0,
      totalPlannedMinutes: 300,
      totalAvailableMinutes: 600,
      worldsWithNextMove: 1,
      worldsWithSavePoints: 1,
    });
    expect(result.score).toBeGreaterThanOrEqual(80);
  });

  it("penalizes overcommitted schedules", () => {
    const feasible = calculateCoreHealth({
      worlds: [makeWorld()],
      worldHealthScores: [80],
      unprocessedInboxCount: 0,
      overdueReminderCount: 0,
      totalPlannedMinutes: 300,
      totalAvailableMinutes: 600,
      worldsWithNextMove: 1,
      worldsWithSavePoints: 1,
    });
    const overcommitted = calculateCoreHealth({
      worlds: [makeWorld()],
      worldHealthScores: [80],
      unprocessedInboxCount: 0,
      overdueReminderCount: 0,
      totalPlannedMinutes: 900,
      totalAvailableMinutes: 600,
      worldsWithNextMove: 1,
      worldsWithSavePoints: 1,
    });
    expect(overcommitted.score).toBeLessThan(feasible.score);
  });
});

describe("healthLabel", () => {
  it("returns correct labels for score ranges", () => {
    expect(healthLabel(-1)).toBe("Stored");
    expect(healthLabel(90)).toBe("Stable");
    expect(healthLabel(70)).toBe("Watch");
    expect(healthLabel(50)).toBe("Strained");
    expect(healthLabel(20)).toBe("Rebuild");
  });
});
