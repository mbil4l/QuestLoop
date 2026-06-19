import { describe, it, expect } from "vitest";
import {
  calculatePriorityScore,
  explainPriorityScore,
} from "@/domain/scoring/priority";
import type { Quest, World } from "@/types/domain";

const makeWorld = (overrides: Partial<World> = {}): World => ({
  id: "w1",
  userId: "u1",
  name: "Test",
  purpose: "Test",
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
  title: "Test",
  description: "",
  nextMove: "Do something specific",
  status: "active",
  dueAt: null,
  estimatedMinutes: 30,
  importance: 3,
  consequence: "",
  demandType: "DEEP_THINKING",
  difficulty: 2,
  priorityScore: 0,
  priorityOverride: null,
  rescheduleCount: 0,
  waitingForId: null,
  isCompleted: false,
  completedAt: null,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  ...overrides,
});

describe("calculatePriorityScore", () => {
  it("returns higher score for quests with imminent deadlines", () => {
    const tomorrow = new Date(Date.now() + 86400000).toISOString();
    const nextWeek = new Date(Date.now() + 7 * 86400000).toISOString();

    const urgentScore = calculatePriorityScore({
      quest: makeQuest({ dueAt: tomorrow }),
      world: makeWorld(),
    });
    const laterScore = calculatePriorityScore({
      quest: makeQuest({ dueAt: nextWeek }),
      world: makeWorld(),
    });

    expect(urgentScore).toBeGreaterThan(laterScore);
  });

  it("returns higher score for higher importance", () => {
    const highImp = calculatePriorityScore({
      quest: makeQuest({ importance: 5 }),
      world: makeWorld(),
    });
    const lowImp = calculatePriorityScore({
      quest: makeQuest({ importance: 1 }),
      world: makeWorld(),
    });

    expect(highImp).toBeGreaterThan(lowImp);
  });

  it("returns 0 for completed quests", () => {
    const score = calculatePriorityScore({
      quest: makeQuest({ isCompleted: true }),
      world: makeWorld(),
    });
    expect(score).toBe(0);
  });

  it("returns 0 for quests in paused worlds", () => {
    const score = calculatePriorityScore({
      quest: makeQuest(),
      world: makeWorld({ status: "PAUSED" }),
    });
    expect(score).toBe(0);
  });

  it("respects priority override", () => {
    const score = calculatePriorityScore({
      quest: makeQuest({ priorityOverride: 99 }),
      world: makeWorld(),
    });
    expect(score).toBe(99);
  });

  it("gives primary worlds higher strategic score", () => {
    const primary = calculatePriorityScore({
      quest: makeQuest(),
      world: makeWorld({ status: "PRIMARY" }),
    });
    const secondary = calculatePriorityScore({
      quest: makeQuest(),
      world: makeWorld({ status: "SECONDARY" }),
    });
    expect(primary).toBeGreaterThan(secondary);
  });

  it("boosts score for neglected worlds", () => {
    const active = calculatePriorityScore({
      quest: makeQuest(),
      world: makeWorld(),
      daysSinceWorldActivity: 0,
    });
    const neglected = calculatePriorityScore({
      quest: makeQuest(),
      world: makeWorld(),
      daysSinceWorldActivity: 14,
    });
    expect(neglected).toBeGreaterThan(active);
  });
});

describe("explainPriorityScore", () => {
  it("returns at most 3 explanations", () => {
    const tomorrow = new Date(Date.now() + 86400000).toISOString();
    const explanations = explainPriorityScore({
      quest: makeQuest({ importance: 5, dueAt: tomorrow }),
      world: makeWorld(),
      daysSinceWorldActivity: 10,
    });
    expect(explanations.length).toBeLessThanOrEqual(3);
  });

  it("includes deadline explanation when quest has due date", () => {
    const tomorrow = new Date(Date.now() + 86400000).toISOString();
    const explanations = explainPriorityScore({
      quest: makeQuest({ dueAt: tomorrow }),
      world: makeWorld(),
    });
    const hasDeadline = explanations.some((e) =>
      e.factor.includes("Deadline")
    );
    expect(hasDeadline).toBe(true);
  });

  it("sorts explanations by points descending", () => {
    const tomorrow = new Date(Date.now() + 86400000).toISOString();
    const explanations = explainPriorityScore({
      quest: makeQuest({ importance: 5, dueAt: tomorrow }),
      world: makeWorld(),
      daysSinceWorldActivity: 14,
    });
    for (let i = 1; i < explanations.length; i++) {
      expect(explanations[i].points).toBeLessThanOrEqual(
        explanations[i - 1].points
      );
    }
  });
});
