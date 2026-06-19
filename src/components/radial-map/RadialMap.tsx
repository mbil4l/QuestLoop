"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { World, Quest } from "@/types/domain";
import { WorldTooltip } from "./WorldTooltip";

interface RadialMapProps {
  worlds: World[];
  selectedWorldId: string | null;
  onSelectWorld: (id: string) => void;
  getNextMoves: (worldId: string) => Quest[];
  pendingCount: number;
  worldsWithNotes?: Set<string>;
}

function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function describeArc(
  cx: number,
  cy: number,
  r: number,
  startAngle: number,
  endAngle: number
) {
  const start = polarToCartesian(cx, cy, r, endAngle);
  const end = polarToCartesian(cx, cy, r, startAngle);
  const large = endAngle - startAngle > 180 ? 1 : 0;
  return `M ${start.x} ${start.y} A ${r} ${r} 0 ${large} 0 ${end.x} ${end.y} L ${cx} ${cy} Z`;
}

// Open arc used as a baseline for curved labels (no center lines, no close).
// `sweep` follows SVG's flag: 1 = increasing angle (clockwise on screen).
function describeArcLine(
  cx: number,
  cy: number,
  r: number,
  startAngle: number,
  endAngle: number,
  sweep: 0 | 1
) {
  const start = polarToCartesian(cx, cy, r, startAngle);
  const end = polarToCartesian(cx, cy, r, endAngle);
  const large = Math.abs(endAngle - startAngle) > 180 ? 1 : 0;
  return `M ${start.x} ${start.y} A ${r} ${r} 0 ${large} ${sweep} ${end.x} ${end.y}`;
}

const SIZE = 520;
const CENTER = SIZE / 2;
const OUTER_RADIUS = 220;
const INNER_RADIUS = 84;
const GAP = 2.5;

const STATUS_WEIGHT: Record<string, number> = {
  PRIMARY: 3,
  SECONDARY: 2,
  MAINTENANCE: 1,
  PAUSED: 0.5,
  COMPLETED: 1,
};

export function RadialMap({
  worlds,
  selectedWorldId,
  onSelectWorld,
  getNextMoves,
  pendingCount,
  worldsWithNotes,
}: RadialMapProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const svgRef = useRef<SVGSVGElement>(null);

  const visibleWorlds = worlds.filter((w) => w.status !== "COMPLETED");
  const arcs = visibleWorlds.map((w) => STATUS_WEIGHT[w.status] ?? 1);
  const totalWeight = arcs.reduce((sum, w) => sum + w, 0);
  const arcDegreesFor = (i: number) =>
    totalWeight > 0
      ? Math.max(18, (arcs[i] / totalWeight) * 360)
      : 360 / Math.max(1, visibleWorlds.length);

  const segments = visibleWorlds.map((world, i) => {
    const base = arcs.slice(0, i).reduce((sum, _, j) => sum + arcDegreesFor(j), 0);
    const arcDegrees = arcDegreesFor(i);
    const startAngle = base + GAP / 2;
    const endAngle = base + arcDegrees - GAP / 2;
    const midAngle = (startAngle + endAngle) / 2;
    const labelPos = polarToCartesian(
      CENTER,
      CENTER,
      OUTER_RADIUS * 0.66,
      midAngle
    );
    return { world, startAngle, endAngle, midAngle, labelPos };
  });

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (visibleWorlds.length === 0) return;
    const currentIndex = visibleWorlds.findIndex(
      (w) => w.id === selectedWorldId
    );
    if (e.key === "ArrowRight" || e.key === "ArrowDown") {
      e.preventDefault();
      const next = (currentIndex + 1) % visibleWorlds.length;
      onSelectWorld(visibleWorlds[next].id);
    }
    if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
      e.preventDefault();
      const prev =
        (currentIndex - 1 + visibleWorlds.length) % visibleWorlds.length;
      onSelectWorld(visibleWorlds[prev].id);
    }
  };

  const handleHover = (worldId: string, e: React.MouseEvent) => {
    setHoveredId(worldId);
    if (svgRef.current) {
      const rect = svgRef.current.getBoundingClientRect();
      setTooltipPos({
        x: ((e.clientX - rect.left) / rect.width) * SIZE,
        y: ((e.clientY - rect.top) / rect.height) * SIZE,
      });
    }
  };

  const hoveredWorld = hoveredId
    ? visibleWorlds.find((w) => w.id === hoveredId) ?? null
    : null;

  return (
    <div className="relative w-full max-w-[520px] mx-auto aspect-square pointer-events-none">
      <svg
        ref={svgRef}
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        className="w-full h-full focus:outline-none pointer-events-none"
        role="img"
        aria-label="World map"
        onKeyDown={handleKeyDown}
        tabIndex={0}
      >
        {/* Background rings */}
        {[OUTER_RADIUS + 6, (OUTER_RADIUS + INNER_RADIUS) / 2, INNER_RADIUS + 14].map(
          (r, i) => (
            <circle
              key={r}
              cx={CENTER}
              cy={CENTER}
              r={r}
              fill="none"
              stroke="var(--color-border-subtle)"
              strokeWidth="1"
              opacity={0.5 - i * 0.12}
            />
          )
        )}

        {segments.map(({ world, startAngle, endAngle, midAngle, labelPos }) => {
          const isSelected = world.id === selectedWorldId;
          const isHovered = world.id === hoveredId;
          const isPaused = world.status === "PAUSED";
          const r = isSelected || isHovered ? OUTER_RADIUS + 8 : OUTER_RADIUS;
          const fillAlpha = isPaused ? "1f" : isSelected ? "44" : "2b";

          return (
            <g key={world.id}>
              {/* spoke from center */}
              <line
                x1={CENTER}
                y1={CENTER}
                x2={polarToCartesian(CENTER, CENTER, INNER_RADIUS, midAngle).x}
                y2={polarToCartesian(CENTER, CENTER, INNER_RADIUS, midAngle).y}
                stroke={world.color}
                strokeWidth={isSelected ? 2 : 1}
                opacity={isSelected ? 0.5 : 0.18}
              />

              <motion.path
                d={describeArc(CENTER, CENTER, r, startAngle, endAngle)}
                fill={`${world.color}${fillAlpha}`}
                stroke={world.color}
                strokeWidth={isSelected ? 2.5 : 1.5}
                opacity={isPaused ? 0.55 : 1}
                className="cursor-pointer focus:outline-none [outline:none] pointer-events-auto"
                style={{ outline: "none" }}
                onClick={() => onSelectWorld(world.id)}
                onMouseMove={(e) => handleHover(world.id, e)}
                onMouseLeave={() => setHoveredId(null)}
                role="button"
                aria-label={`${world.name}, ${world.status.toLowerCase()}, open list`}
                tabIndex={-1}
                initial={false}
                transition={{ duration: 0.2 }}
              />

              {/* health arc near inner edge */}
              <path
                d={describeArc(
                  CENTER,
                  CENTER,
                  INNER_RADIUS + 18,
                  startAngle + 2,
                  startAngle +
                    2 +
                    ((endAngle - startAngle - 4) * Math.max(0, world.health)) /
                      100
                )}
                fill="none"
                stroke={
                  world.health < 0
                    ? "var(--color-text-muted)"
                    : world.health >= 70
                      ? "var(--color-health-good)"
                      : world.health >= 40
                        ? "var(--color-health-watch)"
                        : "var(--color-health-strain)"
                }
                strokeWidth="4"
                opacity={isPaused ? 0.3 : 0.85}
                strokeLinecap="round"
                className="pointer-events-none"
              />

              {/* Curved name — confined to this world's own arc (#9) */}
              {(() => {
                const isBottom = midAngle > 90 && midAngle < 270;
                const labelR = OUTER_RADIUS - 26;
                const arcLen = ((endAngle - startAngle) * Math.PI) / 180 * labelR;
                const maxChars = Math.max(3, Math.floor(arcLen / 8.5));
                const label =
                  world.name.length > maxChars
                    ? world.name.slice(0, maxChars - 1) + "…"
                    : world.name;
                const pathId = `name-arc-${world.id}`;
                const d = isBottom
                  ? describeArcLine(CENTER, CENTER, labelR, endAngle, startAngle, 0)
                  : describeArcLine(CENTER, CENTER, labelR, startAngle, endAngle, 1);
                return (
                  <>
                    <path id={pathId} d={d} fill="none" stroke="none" />
                    <text
                      fill="var(--color-text-primary)"
                      fontSize="13"
                      fontWeight="600"
                      className="pointer-events-none select-none"
                    >
                      <textPath href={`#${pathId}`} startOffset="50%" textAnchor="middle">
                        {label}
                      </textPath>
                    </text>
                  </>
                );
              })()}
              <text
                x={labelPos.x}
                y={labelPos.y + 6}
                textAnchor="middle"
                fill="var(--color-text-muted)"
                fontSize="9"
                className="pointer-events-none select-none uppercase"
                letterSpacing="0.08em"
              >
                {world.status}
              </text>
              {worldsWithNotes?.has(world.id) && (
                <text
                  x={labelPos.x}
                  y={labelPos.y + 20}
                  textAnchor="middle"
                  fontSize="11"
                  className="pointer-events-none select-none"
                >
                  📝
                </text>
              )}
            </g>
          );
        })}

        {/* Center disk */}
        <circle
          cx={CENTER}
          cy={CENTER}
          r={INNER_RADIUS}
          fill="var(--color-bg-panel-raised)"
          stroke="var(--color-border-subtle)"
          strokeWidth="1.5"
        />
        <text
          x={CENTER}
          y={CENTER - 14}
          textAnchor="middle"
          fill="var(--color-text-primary)"
          fontSize="30"
          fontWeight="700"
          className="pointer-events-none select-none"
        >
          {pendingCount}
        </text>
        <text
          x={CENTER}
          y={CENTER + 8}
          textAnchor="middle"
          fill="var(--color-text-secondary)"
          fontSize="11"
          className="pointer-events-none select-none"
        >
          to do next
        </text>
        <text
          x={CENTER}
          y={CENTER + 26}
          textAnchor="middle"
          fill="var(--color-text-muted)"
          fontSize="10"
          className="pointer-events-none select-none"
        >
          {visibleWorlds.length} active worlds
        </text>
      </svg>

      <AnimatePresence>
        {hoveredWorld && (
          <WorldTooltip
            world={hoveredWorld}
            moves={getNextMoves(hoveredWorld.id)}
            xPercent={(tooltipPos.x / SIZE) * 100}
            yPercent={(tooltipPos.y / SIZE) * 100}
          />
        )}
      </AnimatePresence>

      {/* Accessible list fallback */}
      <div className="sr-only" role="list" aria-label="Worlds">
        {visibleWorlds.map((world) => (
          <button
            key={world.id}
            role="listitem"
            onClick={() => onSelectWorld(world.id)}
          >
            {world.name}, {world.status}
          </button>
        ))}
      </div>
    </div>
  );
}
