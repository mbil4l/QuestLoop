import type {
  WorldStatus,
  ObjectiveStage,
  PlanningMode,
  DemandType,
  ReminderIntensity,
  CoreGuideAnimation,
} from "./enums";

export interface UserProfile {
  id: string;
  displayName: string;
  timezone: string;
  weeklyCapacityMinutes: number;
  level: number;
  totalXp: number;
  coreHealth: number;
  planningMode: PlanningMode;
  onboardingCompleted: boolean;
  gameTerminology: boolean;
  xpEnabled: boolean;
  reducedMotion: boolean;
  quietHoursStart: string | null;
  quietHoursEnd: string | null;
  reminderDailyCap: number;
  createdAt: string;
  updatedAt: string;
}

export interface AvatarConfig {
  id: string;
  userId: string;
  baseBody: string;
  skinTone: string;
  hairStyle: string;
  hairColor: string;
  outfitPalette: string;
  accessory: string;
  unlockedCosmetics: string[];
}

export interface CoreGuideState {
  id: string;
  userId: string;
  animation: CoreGuideAnimation;
  dialogueEnabled: boolean;
  soundEnabled: boolean;
  lastRecommendationAt: string | null;
}

export interface Circle {
  id: string;
  ownerId: string;
  name: string;
  /** Free-form label, e.g. "professional", "fun". Optional flavor. */
  kind: string;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface World {
  id: string;
  userId: string;
  /** The radial circle (map) this world belongs to. */
  circleId: string;
  name: string;
  purpose: string;
  color: string;
  icon: string;
  status: WorldStatus;
  weeklyTargetMinutes: number;
  preferredCadence: string;
  demandType: DemandType;
  importance: number;
  health: number;
  sortOrder: number;
  pauseReason: string | null;
  resumeReviewAt: string | null;
  resumeCondition: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Objective {
  id: string;
  worldId: string;
  title: string;
  description: string;
  successCriteria: string;
  stage: ObjectiveStage;
  progressPercent: number;
  dueAt: string | null;
  importance: number;
  createdAt: string;
  updatedAt: string;
}

export interface Campaign {
  id: string;
  objectiveId: string;
  worldId: string;
  title: string;
  description: string;
  progressPercent: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Ritual {
  id: string;
  worldId: string;
  title: string;
  cadenceRule: string;
  minimumVersion: string;
  targetVersion: string;
  stretchVersion: string;
  estimatedMinutes: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Quest {
  id: string;
  worldId: string;
  objectiveId: string | null;
  campaignId: string | null;
  title: string;
  description: string;
  nextMove: string | null;
  status: "active" | "completed" | "archived";
  dueAt: string | null;
  estimatedMinutes: number | null;
  importance: number;
  consequence: string;
  demandType: DemandType;
  difficulty: number;
  priorityScore: number;
  priorityOverride: number | null;
  rescheduleCount: number;
  waitingForId: string | null;
  isCompleted: boolean;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface MissionBlock {
  id: string;
  worldId: string;
  questId: string | null;
  name: string;
  startAt: string;
  endAt: string;
  demandType: DemandType;
  source: "USER" | "AUTO_PLAN";
  explanation: string | null;
  createdAt: string;
}

export interface FocusSession {
  id: string;
  worldId: string;
  questId: string | null;
  missionBlockId: string | null;
  startedAt: string;
  endedAt: string | null;
  plannedMinutes: number;
  actualMinutes: number | null;
  focusQuality: number | null;
  interruptionCount: number;
  notes: string;
  xpEarned: number;
  createdAt: string;
}

export interface SavePoint {
  id: string;
  focusSessionId: string | null;
  worldId: string;
  questId: string | null;
  completedSummary: string;
  stoppingPoint: string;
  nextAction: string;
  blocker: string | null;
  resources: string | null;
  intendedResumeAt: string | null;
  createdAt: string;
}

export interface InboxItem {
  id: string;
  userId: string;
  rawContent: string;
  captureType: string;
  capturedAt: string;
  processedAt: string | null;
  targetWorldId: string | null;
}

export interface WaitingForItem {
  id: string;
  worldId: string;
  relatedQuestId: string | null;
  personOrOrganization: string;
  awaitedItem: string;
  requestedAt: string;
  expectedAt: string | null;
  followUpAt: string | null;
  consequence: string;
  nextActionAfterResponse: string;
  status: "waiting" | "resolved";
  resolvedAt: string | null;
  createdAt: string;
}

export interface Reminder {
  id: string;
  userId: string;
  questId: string | null;
  worldId: string | null;
  message: string;
  triggerAt: string;
  intensity: ReminderIntensity;
  isDismissed: boolean;
  createdAt: string;
}

export interface WeeklyPlan {
  id: string;
  userId: string;
  weekStart: string;
  planningMode: PlanningMode;
  availableMinutes: number;
  plannedMinutes: number;
  reflectionNotes: string;
  isCompleted: boolean;
  createdAt: string;
}

export interface WorldAllocation {
  id: string;
  weeklyPlanId: string;
  worldId: string;
  targetMinutes: number;
  actualMinutes: number;
  intentionalImbalanceReason: string | null;
}

export interface ActivityEvent {
  id: string;
  userId: string;
  worldId: string | null;
  eventType: string;
  payload: Record<string, unknown>;
  xpEarned: number;
  occurredAt: string;
}

export interface XPEvent {
  id: string;
  userId: string;
  worldId: string | null;
  sourceType: string;
  sourceId: string | null;
  amount: number;
  reason: string;
  occurredAt: string;
}

export interface PriorityExplanation {
  factor: string;
  points: number;
  description: string;
}

export interface HealthFactor {
  name: string;
  score: number;
  maxScore: number;
  description: string;
}

export interface HealthResult {
  score: number;
  factors: HealthFactor[];
}

export interface CapacityOverview {
  availableMinutes: number;
  plannedMinutes: number;
  unallocatedMinutes: number;
  overcommittedMinutes: number;
  activeWorldCount: number;
  deadlinesThisWeek: number;
}
