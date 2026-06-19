export const WorldStatus = {
  PRIMARY: "PRIMARY",
  SECONDARY: "SECONDARY",
  MAINTENANCE: "MAINTENANCE",
  PAUSED: "PAUSED",
  COMPLETED: "COMPLETED",
} as const;
export type WorldStatus = (typeof WorldStatus)[keyof typeof WorldStatus];

export const ObjectiveStage = {
  STARTING: "STARTING",
  MIDDLE: "MIDDLE",
  NEAR_COMPLETION: "NEAR_COMPLETION",
  COMPLETE: "COMPLETE",
} as const;
export type ObjectiveStage =
  (typeof ObjectiveStage)[keyof typeof ObjectiveStage];

export const QuestEnergy = {
  LOW: "LOW",
  MEDIUM: "MEDIUM",
  HIGH: "HIGH",
} as const;
export type QuestEnergy = (typeof QuestEnergy)[keyof typeof QuestEnergy];

export const PlanningMode = {
  SPRINT: "SPRINT",
  BALANCED: "BALANCED",
  MAINTENANCE: "MAINTENANCE",
  RECOVERY: "RECOVERY",
  COMBINED: "COMBINED",
} as const;
export type PlanningMode = (typeof PlanningMode)[keyof typeof PlanningMode];

export const CoreGuideAnimation = {
  IDLE: "idle",
  THINKING: "thinking",
  HAPPY: "happy",
  ALERT: "alert",
  REST: "rest",
  SYNCING: "syncing",
  RECOMMENDATION: "recommendation",
  OVERLOAD: "overload",
} as const;
export type CoreGuideAnimation =
  (typeof CoreGuideAnimation)[keyof typeof CoreGuideAnimation];

export const ReminderIntensity = {
  LIGHT: "LIGHT",
  PREPARATION: "PREPARATION",
  PERSISTENT: "PERSISTENT",
  CONTEXTUAL: "CONTEXTUAL",
  RECOVERY: "RECOVERY",
} as const;
export type ReminderIntensity =
  (typeof ReminderIntensity)[keyof typeof ReminderIntensity];

export const DemandType = {
  DEEP_THINKING: "DEEP_THINKING",
  CREATIVE: "CREATIVE",
  ADMINISTRATIVE: "ADMINISTRATIVE",
  PHYSICAL: "PHYSICAL",
  SOCIAL: "SOCIAL",
  EMOTIONAL: "EMOTIONAL",
  LOW_ENERGY: "LOW_ENERGY",
  ERRAND: "ERRAND",
  RECOVERY: "RECOVERY",
} as const;
export type DemandType = (typeof DemandType)[keyof typeof DemandType];
