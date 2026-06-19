import type { WorldStatus } from "@/types/enums";

const validTransitions: Record<WorldStatus, WorldStatus[]> = {
  PRIMARY: ["SECONDARY", "MAINTENANCE", "PAUSED", "COMPLETED"],
  SECONDARY: ["PRIMARY", "MAINTENANCE", "PAUSED", "COMPLETED"],
  MAINTENANCE: ["PRIMARY", "SECONDARY", "PAUSED", "COMPLETED"],
  PAUSED: ["PRIMARY", "SECONDARY", "MAINTENANCE"],
  COMPLETED: ["SECONDARY", "MAINTENANCE"],
};

export function canTransitionStatus(
  from: WorldStatus,
  to: WorldStatus
): boolean {
  if (from === to) return false;
  return validTransitions[from]?.includes(to) ?? false;
}

export function getStatusLabel(status: WorldStatus): string {
  switch (status) {
    case "PRIMARY":
      return "Primary";
    case "SECONDARY":
      return "Secondary";
    case "MAINTENANCE":
      return "Maintenance";
    case "PAUSED":
      return "Paused";
    case "COMPLETED":
      return "Completed";
  }
}

export function getStatusColor(status: WorldStatus): string {
  switch (status) {
    case "PRIMARY":
      return "#3B82F6";
    case "SECONDARY":
      return "#9EABC0";
    case "MAINTENANCE":
      return "#F5B942";
    case "PAUSED":
      return "#6B7280";
    case "COMPLETED":
      return "#2DD4BF";
  }
}
