import type { World, Quest } from "@/types/domain";
import type { ExploreMap } from "@/lib/stores/explore-store";

export function buildSnapshot(opts: {
  id: string;
  name: string;
  occupation?: string;
  emoji?: string;
  city?: string;
  region?: string;
  countryCode?: string;
  avatarColor: string;
  worlds: World[];
  quests: Quest[];
}): ExploreMap {
  const visible = opts.worlds.filter((w) => w.status !== "COMPLETED");
  const topMoves = opts.quests
    .filter((q) => !q.isCompleted)
    .sort((a, b) => b.priorityScore - a.priorityScore)
    .slice(0, 4)
    .map((q) => q.nextMove?.trim() || q.title);

  return {
    id: opts.id,
    name: opts.name,
    occupation: opts.occupation,
    emoji: opts.emoji,
    city: opts.city,
    region: opts.region,
    countryCode: opts.countryCode,
    avatarColor: opts.avatarColor,
    worlds: visible.map((w) => ({
      name: w.name,
      color: w.color,
      status: w.status,
      health: w.health,
    })),
    topMoves,
    updatedAt: new Date().toISOString(),
  };
}
