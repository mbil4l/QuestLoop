import type { World, CapacityOverview, Quest } from "@/types/domain";

export function calculateCapacityOverview(
  worlds: World[],
  quests: Quest[],
  availableMinutes: number
): CapacityOverview {
  const activeWorlds = worlds.filter(
    (w) => w.status !== "PAUSED" && w.status !== "COMPLETED"
  );
  const plannedMinutes = activeWorlds.reduce(
    (sum, w) => sum + w.weeklyTargetMinutes,
    0
  );

  const now = new Date();
  const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  const deadlinesThisWeek = quests.filter(
    (q) =>
      q.dueAt &&
      !q.isCompleted &&
      new Date(q.dueAt) >= now &&
      new Date(q.dueAt) <= weekFromNow
  ).length;

  return {
    availableMinutes,
    plannedMinutes,
    unallocatedMinutes: Math.max(0, availableMinutes - plannedMinutes),
    overcommittedMinutes: Math.max(0, plannedMinutes - availableMinutes),
    activeWorldCount: activeWorlds.length,
    deadlinesThisWeek,
  };
}

export function suggestAllocation(
  worlds: World[],
  availableMinutes: number
): Map<string, number> {
  const activeWorlds = worlds.filter(
    (w) => w.status !== "PAUSED" && w.status !== "COMPLETED"
  );
  const allocation = new Map<string, number>();

  if (activeWorlds.length === 0) return allocation;

  const statusWeight: Record<string, number> = {
    PRIMARY: 3,
    SECONDARY: 2,
    MAINTENANCE: 1,
  };

  const totalWeight = activeWorlds.reduce(
    (sum, w) => sum + (statusWeight[w.status] ?? 1),
    0
  );

  for (const world of activeWorlds) {
    const weight = statusWeight[world.status] ?? 1;
    const share = Math.round((weight / totalWeight) * availableMinutes);
    allocation.set(world.id, share);
  }

  return allocation;
}

export function isOvercommitted(
  plannedMinutes: number,
  availableMinutes: number,
  threshold: number = 0.1
): boolean {
  return plannedMinutes > availableMinutes * (1 + threshold);
}

export function generateCapacityWarning(
  overview: CapacityOverview
): string | null {
  if (overview.overcommittedMinutes <= 0) return null;

  const overHours = Math.round(overview.overcommittedMinutes / 60 * 10) / 10;
  const plannedHours = Math.round(overview.plannedMinutes / 60 * 10) / 10;
  const availableHours = Math.round(overview.availableMinutes / 60 * 10) / 10;

  return `Your plan requests ${plannedHours} hours, but you have ${availableHours} available. Reduce targets by ${overHours} hours, pause one World, or convert one World to Maintenance.`;
}
