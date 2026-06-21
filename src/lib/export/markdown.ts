import type { World, Quest, Objective, Ritual } from "@/types/domain";

export interface ExportProfile {
  displayName: string;
  occupation: string;
  emoji: string;
  city: string;
  region: string;
  countryCode: string;
}

export interface CircleExport {
  name: string;
  worlds: World[];
  quests: Quest[];
  objectives: Objective[];
  rituals: Ritual[];
  homeNotes: string;
  worldNotes: Record<string, string>;
}

function fmtDate(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? "" : d.toISOString().slice(0, 10);
}

function profileBlock(p: ExportProfile): string {
  const loc = [p.city, p.region, p.countryCode].filter(Boolean).join(", ");
  const lines: string[] = [];
  if (p.displayName) lines.push(`- **Name:** ${p.emoji ? p.emoji + " " : ""}${p.displayName}`);
  if (p.occupation) lines.push(`- **Occupation:** ${p.occupation}`);
  if (loc) lines.push(`- **Location:** ${loc}`);
  return lines.length ? `## Profile\n\n${lines.join("\n")}\n` : "";
}

function worldBlock(c: CircleExport, world: World): string {
  const out: string[] = [];
  out.push(`## ${world.name}`);
  if (world.purpose) out.push(`\n*${world.purpose}*`);

  const health = world.health < 0 ? "—" : `${world.health}%`;
  out.push(
    `\n- Status: ${world.status} · Health: ${health} · Importance: ${world.importance}/5 · Weekly target: ${world.weeklyTargetMinutes}m`
  );

  const objectives = c.objectives.filter((o) => o.worldId === world.id);
  if (objectives.length) {
    out.push("\n### Objectives");
    for (const o of objectives) {
      out.push(`- **${o.title}** — ${o.stage} (${o.progressPercent}%)`);
      if (o.successCriteria) out.push(`  - Success: ${o.successCriteria}`);
    }
  }

  const quests = c.quests.filter((q) => q.worldId === world.id);
  if (quests.length) {
    out.push("\n### Quests");
    for (const q of quests) {
      const box = q.isCompleted ? "[x]" : "[ ]";
      const meta: string[] = [];
      if (q.nextMove) meta.push(`next: ${q.nextMove}`);
      const due = fmtDate(q.dueAt);
      if (due) meta.push(`due ${due}`);
      if (q.importance) meta.push(`!${q.importance}`);
      out.push(`- ${box} ${q.title}${meta.length ? ` — ${meta.join(" · ")}` : ""}`);
    }
  }

  const rituals = c.rituals.filter((r) => r.worldId === world.id);
  if (rituals.length) {
    out.push("\n### Rituals");
    for (const r of rituals) {
      out.push(
        `- **${r.title}** (${r.cadenceRule}) — min: ${r.minimumVersion} / target: ${r.targetVersion} / stretch: ${r.stretchVersion}`
      );
    }
  }

  const note = c.worldNotes[world.id]?.trim();
  if (note) {
    out.push("\n### Notes");
    out.push(note);
  }

  return out.join("\n");
}

/** Build a full structured markdown dump of one circle. */
export function buildMarkdown(circle: CircleExport, profile: ExportProfile): string {
  const parts: string[] = [];
  parts.push(`# ${circle.name}`);
  parts.push(`\n> Exported from QuestLoop on ${fmtDate(new Date().toISOString())}\n`);

  const pb = profileBlock(profile);
  if (pb) parts.push(pb);

  const sorted = [...circle.worlds].sort((a, b) => a.sortOrder - b.sortOrder);
  for (const w of sorted) {
    parts.push("\n---\n");
    parts.push(worldBlock(circle, w));
  }

  if (circle.worlds.length === 0) {
    parts.push("\n_No worlds in this circle yet._");
  }

  if (circle.homeNotes.trim()) {
    parts.push("\n---\n");
    parts.push("## Home Notes");
    parts.push(circle.homeNotes.trim());
  }

  return parts.join("\n") + "\n";
}

/** Concatenate several circles into one document, separated by rules. */
export function buildAllCirclesMarkdown(
  circles: CircleExport[],
  profile: ExportProfile
): string {
  return circles.map((c) => buildMarkdown(c, profile)).join("\n\n---\n\n");
}

/** Trigger a client-side .md file download. */
export function downloadMarkdown(filename: string, content: string): void {
  const blob = new Blob([content], { type: "text/markdown" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename.endsWith(".md") ? filename : `${filename}.md`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

/** Filesystem-safe slug for filenames. */
export function slugify(name: string): string {
  return (
    name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "") || "questloop"
  );
}
