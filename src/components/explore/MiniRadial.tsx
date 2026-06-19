"use client";

import type { ExploreWorld } from "@/lib/stores/explore-store";

const STATUS_WEIGHT: Record<string, number> = {
  PRIMARY: 3,
  SECONDARY: 2,
  MAINTENANCE: 1,
  PAUSED: 0.5,
  COMPLETED: 1,
};

function polar(cx: number, cy: number, r: number, deg: number) {
  const rad = ((deg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function arc(cx: number, cy: number, r: number, a0: number, a1: number) {
  const s = polar(cx, cy, r, a1);
  const e = polar(cx, cy, r, a0);
  const large = a1 - a0 > 180 ? 1 : 0;
  return `M ${s.x} ${s.y} A ${r} ${r} 0 ${large} 0 ${e.x} ${e.y} L ${cx} ${cy} Z`;
}

export function MiniRadial({
  worlds,
  size = 132,
}: {
  worlds: ExploreWorld[];
  size?: number;
}) {
  const C = size / 2;
  const R = size / 2 - 4;
  const inner = R * 0.34;
  const visible = worlds.filter((w) => w.status !== "COMPLETED");
  const weights = visible.map((w) => STATUS_WEIGHT[w.status] ?? 1);
  const total = weights.reduce((a, b) => a + b, 0) || 1;
  const degFor = (i: number) => Math.max(14, (weights[i] / total) * 360);

  return (
    <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size} aria-hidden="true">
      {visible.map((w, i) => {
        const base = weights.slice(0, i).reduce((s, _, j) => s + degFor(j), 0);
        const d = degFor(i);
        return (
          <path
            key={`${w.name}-${i}`}
            d={arc(C, C, R, base + 1.5, base + d - 1.5)}
            fill={`${w.color}33`}
            stroke={w.color}
            strokeWidth={1.5}
            opacity={w.status === "PAUSED" ? 0.5 : 1}
          />
        );
      })}
      <circle
        cx={C}
        cy={C}
        r={inner}
        fill="var(--color-bg-panel-raised)"
        stroke="var(--color-border-subtle)"
        strokeWidth="1"
      />
      <text
        x={C}
        y={C + 4}
        textAnchor="middle"
        fontSize="12"
        fontWeight="700"
        fill="var(--color-text-primary)"
      >
        {visible.length}
      </text>
    </svg>
  );
}
