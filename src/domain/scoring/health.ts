import type { World, Quest, HealthResult, HealthFactor } from "@/types/domain";

interface WorldHealthInput {
  world: World;
  quests: Quest[];
  daysSinceLastActivity: number;
  hasNextMove: boolean;
  hasSavePoint: boolean;
  allocationActualRatio: number;
}

export function calculateWorldHealth(input: WorldHealthInput): HealthResult {
  const factors: HealthFactor[] = [];

  if (input.world.status === "PAUSED") {
    return {
      score: -1,
      factors: [
        {
          name: "Stored",
          score: 0,
          maxScore: 0,
          description: "World is intentionally paused",
        },
      ],
    };
  }

  const hasObjective =
    input.quests.length > 0 || input.world.purpose.length > 0;
  const objectiveScore = hasObjective ? 20 : 0;
  factors.push({
    name: "Has clear purpose",
    score: objectiveScore,
    maxScore: 20,
    description: hasObjective
      ? "World has defined objectives or purpose"
      : "No objectives or purpose defined",
  });

  const nextMoveScore = input.hasNextMove ? 20 : 0;
  factors.push({
    name: "Next action defined",
    score: nextMoveScore,
    maxScore: 20,
    description: input.hasNextMove
      ? "Clear next action is ready"
      : "No next action defined",
  });

  const overdueQuests = input.quests.filter(
    (q) => q.dueAt && new Date(q.dueAt) < new Date() && !q.isCompleted
  );
  const overdueScore = Math.max(0, 20 - overdueQuests.length * 5);
  factors.push({
    name: "Overdue control",
    score: overdueScore,
    maxScore: 20,
    description:
      overdueQuests.length === 0
        ? "No overdue quests"
        : `${overdueQuests.length} overdue quest(s)`,
  });

  let activityScore = 20;
  if (input.daysSinceLastActivity > 14) activityScore = 0;
  else if (input.daysSinceLastActivity > 7) activityScore = 5;
  else if (input.daysSinceLastActivity > 3) activityScore = 12;
  factors.push({
    name: "Recent activity",
    score: activityScore,
    maxScore: 20,
    description:
      input.daysSinceLastActivity === 0
        ? "Active today"
        : `Last activity ${input.daysSinceLastActivity} day(s) ago`,
  });

  let allocationScore = 20;
  if (input.allocationActualRatio < 0.3) allocationScore = 5;
  else if (input.allocationActualRatio < 0.6) allocationScore = 12;
  else if (input.allocationActualRatio > 1.5) allocationScore = 15;
  factors.push({
    name: "Allocation balance",
    score: allocationScore,
    maxScore: 20,
    description:
      input.allocationActualRatio >= 0.6 && input.allocationActualRatio <= 1.5
        ? "Time allocation is on track"
        : "Actual time deviates from allocation",
  });

  const totalScore = factors.reduce((sum, f) => sum + f.score, 0);
  return { score: Math.min(100, Math.max(0, totalScore)), factors };
}

interface CoreHealthInput {
  worlds: World[];
  worldHealthScores: number[];
  unprocessedInboxCount: number;
  overdueReminderCount: number;
  totalPlannedMinutes: number;
  totalAvailableMinutes: number;
  worldsWithNextMove: number;
  worldsWithSavePoints: number;
}

export function calculateCoreHealth(input: CoreHealthInput): HealthResult {
  const factors: HealthFactor[] = [];
  const activeWorlds = input.worlds.filter(
    (w) => w.status !== "PAUSED" && w.status !== "COMPLETED"
  );
  const activeCount = activeWorlds.length;

  let feasibility = 30;
  if (input.totalAvailableMinutes > 0) {
    const ratio = input.totalPlannedMinutes / input.totalAvailableMinutes;
    if (ratio > 1.3) feasibility = 5;
    else if (ratio > 1.1) feasibility = 15;
    else if (ratio > 0.9) feasibility = 30;
    else feasibility = 25;
  }
  factors.push({
    name: "Schedule feasibility",
    score: feasibility,
    maxScore: 30,
    description:
      feasibility >= 25
        ? "Schedule is feasible"
        : "Planned time may exceed capacity",
  });

  const clarityRatio = activeCount > 0 ? input.worldsWithNextMove / activeCount : 1;
  const clarity = Math.round(clarityRatio * 20);
  factors.push({
    name: "Action clarity",
    score: clarity,
    maxScore: 20,
    description: `${input.worldsWithNextMove}/${activeCount} active worlds have clear next actions`,
  });

  const savePointRatio =
    activeCount > 0 ? input.worldsWithSavePoints / activeCount : 1;
  const trustScore = Math.round(savePointRatio * 15);
  factors.push({
    name: "Resumption readiness",
    score: trustScore,
    maxScore: 15,
    description: `${input.worldsWithSavePoints}/${activeCount} worlds have save points`,
  });

  const avgHealth =
    input.worldHealthScores.length > 0
      ? input.worldHealthScores.reduce((a, b) => a + b, 0) /
        input.worldHealthScores.length
      : 50;
  const coverageScore = Math.round((avgHealth / 100) * 15);
  factors.push({
    name: "World coverage",
    score: coverageScore,
    maxScore: 15,
    description: `Average world health: ${Math.round(avgHealth)}%`,
  });

  const overdueScore = Math.max(0, 10 - input.overdueReminderCount * 2);
  factors.push({
    name: "Overdue control",
    score: overdueScore,
    maxScore: 10,
    description:
      input.overdueReminderCount === 0
        ? "No overdue reminders"
        : `${input.overdueReminderCount} overdue reminder(s)`,
  });

  const inboxPenalty = Math.min(input.unprocessedInboxCount, 5);
  const recoveryScore = Math.max(0, 10 - inboxPenalty * 2);
  factors.push({
    name: "Inbox clarity",
    score: recoveryScore,
    maxScore: 10,
    description:
      input.unprocessedInboxCount === 0
        ? "Inbox is clear"
        : `${input.unprocessedInboxCount} unprocessed item(s)`,
  });

  const totalScore = factors.reduce((sum, f) => sum + f.score, 0);
  return { score: Math.min(100, Math.max(0, totalScore)), factors };
}

export function healthLabel(
  score: number
): "Stable" | "Watch" | "Strained" | "Rebuild" | "Stored" {
  if (score < 0) return "Stored";
  if (score >= 80) return "Stable";
  if (score >= 60) return "Watch";
  if (score >= 40) return "Strained";
  return "Rebuild";
}
