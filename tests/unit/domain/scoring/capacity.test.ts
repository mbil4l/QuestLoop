import { describe, it, expect } from "vitest";
import {
  calculateCapacityOverview,
  suggestAllocation,
  isOvercommitted,
  generateCapacityWarning,
} from "@/domain/scoring/capacity";
import type { World, Quest } from "@/types/domain";

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

describe("calculateCapacityOverview", () => {
  it("correctly calculates unallocated time", () => {
    const worlds = [makeWorld({ weeklyTargetMinutes: 200 })];
    const result = calculateCapacityOverview(worlds, [], 600);
    expect(result.unallocatedMinutes).toBe(400);
    expect(result.overcommittedMinutes).toBe(0);
  });

  it("correctly calculates overcommitted time", () => {
    const worlds = [makeWorld({ weeklyTargetMinutes: 800 })];
    const result = calculateCapacityOverview(worlds, [], 600);
    expect(result.overcommittedMinutes).toBe(200);
    expect(result.unallocatedMinutes).toBe(0);
  });

  it("excludes paused worlds from planned minutes", () => {
    const worlds = [
      makeWorld({ weeklyTargetMinutes: 300 }),
      makeWorld({ id: "w2", weeklyTargetMinutes: 300, status: "PAUSED" }),
    ];
    const result = calculateCapacityOverview(worlds, [], 600);
    expect(result.plannedMinutes).toBe(300);
  });
});

describe("suggestAllocation", () => {
  it("gives more time to PRIMARY worlds", () => {
    const worlds = [
      makeWorld({ id: "w1", status: "PRIMARY" }),
      makeWorld({ id: "w2", status: "MAINTENANCE" }),
    ];
    const allocation = suggestAllocation(worlds, 600);
    expect(allocation.get("w1")!).toBeGreaterThan(allocation.get("w2")!);
  });

  it("returns empty map for no active worlds", () => {
    const allocation = suggestAllocation([], 600);
    expect(allocation.size).toBe(0);
  });
});

describe("isOvercommitted", () => {
  it("returns false when within threshold", () => {
    expect(isOvercommitted(600, 600)).toBe(false);
    expect(isOvercommitted(650, 600)).toBe(false);
  });

  it("returns true when exceeding threshold", () => {
    expect(isOvercommitted(700, 600)).toBe(true);
  });
});

describe("generateCapacityWarning", () => {
  it("returns null when not overcommitted", () => {
    const overview = calculateCapacityOverview(
      [makeWorld({ weeklyTargetMinutes: 300 })],
      [],
      600
    );
    expect(generateCapacityWarning(overview)).toBeNull();
  });

  it("returns warning message when overcommitted", () => {
    const overview = calculateCapacityOverview(
      [makeWorld({ weeklyTargetMinutes: 800 })],
      [],
      600
    );
    const warning = generateCapacityWarning(overview);
    expect(warning).not.toBeNull();
    expect(warning).toContain("Reduce targets");
  });
});
