import { describe, it, expect } from "vitest";
import {
  buildMarkdown,
  buildAllCirclesMarkdown,
  slugify,
  type CircleExport,
  type ExportProfile,
} from "@/lib/export/markdown";
import type { World, Quest, Objective, Ritual } from "@/types/domain";

const profile: ExportProfile = {
  displayName: "Alex",
  occupation: "Engineer",
  emoji: "🚀",
  city: "Austin",
  region: "TX",
  countryCode: "US",
};

const world: World = {
  id: "w1",
  userId: "u1",
  circleId: "c1",
  name: "Interview Prep",
  purpose: "Land an offer",
  color: "#3B82F6",
  icon: "briefcase",
  status: "PRIMARY",
  weeklyTargetMinutes: 300,
  preferredCadence: "daily",
  demandType: "DEEP_THINKING",
  importance: 5,
  health: 78,
  sortOrder: 0,
  pauseReason: null,
  resumeReviewAt: null,
  resumeCondition: null,
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
};

const objective: Objective = {
  id: "o1",
  worldId: "w1",
  title: "Pass system design",
  description: "",
  successCriteria: "Mock score >= 4",
  stage: "MIDDLE",
  progressPercent: 50,
  dueAt: null,
  importance: 4,
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
};

const quests: Quest[] = [
  {
    id: "q1",
    worldId: "w1",
    objectiveId: "o1",
    campaignId: null,
    title: "Do 2 mock interviews",
    description: "",
    nextMove: "Schedule with peer",
    status: "active",
    dueAt: "2026-07-01T00:00:00.000Z",
    estimatedMinutes: 60,
    importance: 4,
    consequence: "",
    demandType: "DEEP_THINKING",
    difficulty: 3,
    priorityScore: 10,
    priorityOverride: null,
    rescheduleCount: 0,
    waitingForId: null,
    isCompleted: false,
    completedAt: null,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  },
  {
    id: "q2",
    worldId: "w1",
    objectiveId: null,
    campaignId: null,
    title: "Review arrays",
    description: "",
    nextMove: null,
    status: "completed",
    dueAt: null,
    estimatedMinutes: null,
    importance: 2,
    consequence: "",
    demandType: "DEEP_THINKING",
    difficulty: 1,
    priorityScore: 1,
    priorityOverride: null,
    rescheduleCount: 0,
    waitingForId: null,
    isCompleted: true,
    completedAt: "2026-01-02T00:00:00.000Z",
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-02T00:00:00.000Z",
  },
];

const ritual: Ritual = {
  id: "r1",
  worldId: "w1",
  title: "Daily LeetCode",
  cadenceRule: "daily",
  minimumVersion: "1 easy",
  targetVersion: "2 medium",
  stretchVersion: "1 hard",
  estimatedMinutes: 45,
  isActive: true,
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
};

const circle: CircleExport = {
  name: "Professional",
  worlds: [world],
  quests,
  objectives: [objective],
  rituals: [ritual],
  homeNotes: "Stay consistent.",
  worldNotes: { w1: "Focus on graphs." },
};

describe("buildMarkdown", () => {
  const md = buildMarkdown(circle, profile);

  it("includes the circle title and profile", () => {
    expect(md).toContain("# Professional");
    expect(md).toContain("**Occupation:** Engineer");
    expect(md).toContain("Austin, TX, US");
  });

  it("renders the world with status line", () => {
    expect(md).toContain("## Interview Prep");
    expect(md).toContain("Status: PRIMARY");
    expect(md).toContain("Importance: 5/5");
  });

  it("renders objectives, quests as checkboxes, and rituals", () => {
    expect(md).toContain("### Objectives");
    expect(md).toContain("**Pass system design** — MIDDLE (50%)");
    expect(md).toContain("- [ ] Do 2 mock interviews — next: Schedule with peer · due 2026-07-01 · !4");
    expect(md).toContain("- [x] Review arrays");
    expect(md).toContain("### Rituals");
    expect(md).toContain("min: 1 easy / target: 2 medium / stretch: 1 hard");
  });

  it("includes world notes and home notes", () => {
    expect(md).toContain("Focus on graphs.");
    expect(md).toContain("## Home Notes");
    expect(md).toContain("Stay consistent.");
  });

  it("notes an empty circle", () => {
    const empty = buildMarkdown(
      { name: "Empty", worlds: [], quests: [], objectives: [], rituals: [], homeNotes: "", worldNotes: {} },
      profile
    );
    expect(empty).toContain("_No worlds in this circle yet._");
  });
});

describe("buildAllCirclesMarkdown", () => {
  it("concatenates circles with a separator", () => {
    const all = buildAllCirclesMarkdown([circle, { ...circle, name: "Fun" }], profile);
    expect(all).toContain("# Professional");
    expect(all).toContain("# Fun");
    expect(all.split("\n---\n\n").length).toBeGreaterThan(1);
  });
});

describe("slugify", () => {
  it("makes filesystem-safe slugs", () => {
    expect(slugify("My Goals!")).toBe("my-goals");
    expect(slugify("")).toBe("questloop");
  });
});
