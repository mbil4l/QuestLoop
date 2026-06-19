import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { WorldStatus } from "@/types/enums";

export interface ExploreWorld {
  name: string;
  color: string;
  status: WorldStatus;
  health: number;
}

export interface ExploreMap {
  id: string;
  name: string;
  occupation?: string;
  emoji?: string;
  city?: string;
  region?: string;
  countryCode?: string;
  avatarColor: string;
  worlds: ExploreWorld[];
  topMoves: string[];
  updatedAt: string;
  sample?: boolean;
}

/** Curated example maps so Explore looks alive before anyone shares. */
const SAMPLE_MAPS: ExploreMap[] = [
  {
    id: "sample-aria",
    name: "Aria · Founder",
    avatarColor: "#8B5CF6",
    sample: true,
    updatedAt: new Date().toISOString(),
    worlds: [
      { name: "Fundraising", color: "#8B5CF6", status: "PRIMARY", health: 64 },
      { name: "Product", color: "#3B82F6", status: "PRIMARY", health: 80 },
      { name: "Hiring", color: "#F59E0B", status: "SECONDARY", health: 55 },
      { name: "Health", color: "#F97316", status: "MAINTENANCE", health: 70 },
    ],
    topMoves: [
      "Send updated deck to the three warm leads",
      "Review staging build before the demo",
      "Schedule final-round with the design candidate",
    ],
  },
  {
    id: "sample-kenji",
    name: "Kenji · Student",
    avatarColor: "#10B981",
    sample: true,
    updatedAt: new Date().toISOString(),
    worlds: [
      { name: "Thesis", color: "#10B981", status: "PRIMARY", health: 48 },
      { name: "Internship Hunt", color: "#F59E0B", status: "SECONDARY", health: 60 },
      { name: "Climbing", color: "#EC4899", status: "MAINTENANCE", health: 85 },
    ],
    topMoves: [
      "Draft results section for chapter 3",
      "Tailor resume for the two robotics roles",
    ],
  },
  {
    id: "sample-mara",
    name: "Mara · Parent + PM",
    avatarColor: "#F43F5E",
    sample: true,
    updatedAt: new Date().toISOString(),
    worlds: [
      { name: "Family", color: "#F43F5E", status: "PRIMARY", health: 75 },
      { name: "Roadmap Q3", color: "#3B82F6", status: "PRIMARY", health: 58 },
      { name: "Fitness", color: "#F97316", status: "MAINTENANCE", health: 40 },
      { name: "Reading", color: "#6366F1", status: "MAINTENANCE", health: 66 },
    ],
    topMoves: [
      "Lock the Q3 milestone dates with eng leads",
      "Book the swim lessons for the kids",
      "Plan a 20-minute walk after standup",
    ],
  },
];

interface ExploreStore {
  published: Record<string, ExploreMap>;
  publish: (map: ExploreMap) => void;
  unpublish: (id: string) => void;
  isPublished: (id: string) => boolean;
  getDiscoverable: () => ExploreMap[];
}

export const useExploreStore = create<ExploreStore>()(
  persist(
    (set, get) => ({
      published: {},
      publish: (map) =>
        set((state) => ({ published: { ...state.published, [map.id]: map } })),
      unpublish: (id) =>
        set((state) => {
          const next = { ...state.published };
          delete next[id];
          return { published: next };
        }),
      isPublished: (id) => Boolean(get().published[id]),
      getDiscoverable: () => {
        const mine = Object.values(get().published);
        const ids = new Set(mine.map((m) => m.id));
        const samples = SAMPLE_MAPS.filter((s) => !ids.has(s.id));
        return [...mine, ...samples]
          .filter((m) => m.worlds.length > 0) // never list empty maps (#1)
          .sort(
            (a, b) =>
              new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
          );
      },
    }),
    {
      name: "questloop-explore",
      skipHydration: true,
      partialize: (state) => ({ published: state.published }),
    }
  )
);
