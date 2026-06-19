import type { Quest, World } from "@/types/domain";
import type { WorldStatus, ObjectiveStage } from "@/types/enums";
import type { PriorityExplanation } from "@/types/domain";

interface PriorityContext {
  quest: Quest;
  world: World;
  objectiveStage?: ObjectiveStage;
  daysSinceWorldActivity?: number;
  blockedQuestCount?: number;
}

const WEIGHTS = {
  deadlineUrgency: 25,
  importance: 20,
  consequenceOfDelay: 15,
  blockingValue: 10,
  neglect: 10,
  readiness: 8,
  energyFit: 7,
  strategicStatus: 5,
} as const;

function deadlineUrgencyScore(dueAt: string | null): number {
  if (!dueAt) return 0;
  const hoursUntil =
    (new Date(dueAt).getTime() - Date.now()) / (1000 * 60 * 60);
  if (hoursUntil <= 0) return WEIGHTS.deadlineUrgency;
  if (hoursUntil <= 24) return WEIGHTS.deadlineUrgency * 0.95;
  if (hoursUntil <= 72) return WEIGHTS.deadlineUrgency * 0.75;
  if (hoursUntil <= 168) return WEIGHTS.deadlineUrgency * 0.4;
  if (hoursUntil <= 336) return WEIGHTS.deadlineUrgency * 0.2;
  return WEIGHTS.deadlineUrgency * 0.05;
}

function importanceScore(importance: number): number {
  return (Math.min(importance, 5) / 5) * WEIGHTS.importance;
}

function consequenceScore(consequence: string): number {
  if (!consequence) return 0;
  const len = consequence.trim().length;
  if (len > 100) return WEIGHTS.consequenceOfDelay * 0.8;
  if (len > 30) return WEIGHTS.consequenceOfDelay * 0.5;
  if (len > 0) return WEIGHTS.consequenceOfDelay * 0.3;
  return 0;
}

function blockingScore(blockedCount: number): number {
  if (blockedCount <= 0) return 0;
  return Math.min(blockedCount * 3, WEIGHTS.blockingValue);
}

function neglectScore(daysSinceActivity: number | undefined): number {
  if (daysSinceActivity === undefined) return 0;
  if (daysSinceActivity >= 14) return WEIGHTS.neglect;
  if (daysSinceActivity >= 7) return WEIGHTS.neglect * 0.7;
  if (daysSinceActivity >= 3) return WEIGHTS.neglect * 0.3;
  return 0;
}

function readinessScore(nextMove: string | null): number {
  if (nextMove && nextMove.trim().length > 5) return WEIGHTS.readiness;
  if (nextMove && nextMove.trim().length > 0) return WEIGHTS.readiness * 0.5;
  return 0;
}

function strategicStatusScore(status: WorldStatus): number {
  switch (status) {
    case "PRIMARY":
      return WEIGHTS.strategicStatus;
    case "SECONDARY":
      return WEIGHTS.strategicStatus * 0.6;
    case "MAINTENANCE":
      return WEIGHTS.strategicStatus * 0.3;
    default:
      return 0;
  }
}

export function calculatePriorityScore(ctx: PriorityContext): number {
  if (ctx.quest.priorityOverride !== null) return ctx.quest.priorityOverride;
  if (ctx.quest.isCompleted) return 0;
  if (ctx.world.status === "PAUSED" || ctx.world.status === "COMPLETED")
    return 0;

  const scores = [
    deadlineUrgencyScore(ctx.quest.dueAt),
    importanceScore(ctx.quest.importance),
    consequenceScore(ctx.quest.consequence),
    blockingScore(ctx.blockedQuestCount ?? 0),
    neglectScore(ctx.daysSinceWorldActivity),
    readinessScore(ctx.quest.nextMove),
    strategicStatusScore(ctx.world.status),
  ];

  return Math.round(scores.reduce((a, b) => a + b, 0) * 100) / 100;
}

export function explainPriorityScore(
  ctx: PriorityContext
): PriorityExplanation[] {
  const explanations: PriorityExplanation[] = [];

  const deadline = deadlineUrgencyScore(ctx.quest.dueAt);
  if (deadline > 0) {
    const hoursUntil = ctx.quest.dueAt
      ? (new Date(ctx.quest.dueAt).getTime() - Date.now()) / (1000 * 60 * 60)
      : Infinity;
    explanations.push({
      factor: "Deadline urgency",
      points: Math.round(deadline * 10) / 10,
      description:
        hoursUntil <= 24
          ? "Due within 24 hours"
          : hoursUntil <= 72
            ? "Due within 3 days"
            : `Due in ${Math.round(hoursUntil / 24)} days`,
    });
  }

  const imp = importanceScore(ctx.quest.importance);
  if (imp > 0) {
    explanations.push({
      factor: "Importance",
      points: Math.round(imp * 10) / 10,
      description: `Rated ${ctx.quest.importance}/5 importance`,
    });
  }

  const neg = neglectScore(ctx.daysSinceWorldActivity);
  if (neg > 0) {
    explanations.push({
      factor: "World needs attention",
      points: Math.round(neg * 10) / 10,
      description: `${ctx.world.name} has been inactive for ${ctx.daysSinceWorldActivity} days`,
    });
  }

  const ready = readinessScore(ctx.quest.nextMove);
  if (ready > 0) {
    explanations.push({
      factor: "Ready to start",
      points: Math.round(ready * 10) / 10,
      description: "Next action is defined and clear",
    });
  }

  const strategic = strategicStatusScore(ctx.world.status);
  if (strategic > 0) {
    explanations.push({
      factor: "Strategic priority",
      points: Math.round(strategic * 10) / 10,
      description: `${ctx.world.name} is ${ctx.world.status.toLowerCase()}`,
    });
  }

  explanations.sort((a, b) => b.points - a.points);
  return explanations.slice(0, 3);
}
