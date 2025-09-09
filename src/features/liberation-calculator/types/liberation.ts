export type LiberationType = 'genesis' | 'destiny';

export type BossDifficulty = 'easy' | 'normal' | 'hard' | 'chaos' | 'extreme';

export interface BossInfo {
  id: string;
  name: string;
  availableDifficulties: BossDifficulty[];
  traceRewards: Record<BossDifficulty, number>;
  partySize: number;
  weeklyClearLimit?: number;
  monthlyClearLimit?: number;
}

export interface BossClear {
  bossId: string;
  difficulty: BossDifficulty;
  clearedThisWeek: boolean;
  clearedThisMonth?: boolean;
  partySize: number;
}

export interface LiberationProgress {
  type: LiberationType;
  currentQuest: string;
  traceOfDarkness: number;
  totalTracesNeeded: number;
  startDate: string;
  bossesCleared: BossClear[];
}

export interface WeeklyTracesBreakdown {
  bossId: string;
  bossName: string;
  traces: number;
}

export interface LiberationSchedule {
  totalTracesNeeded: number;
  weeklyTraces: number;
  weeksToComplete: number;
  completionDate: string;
  weeklyBreakdown: WeeklyTracesBreakdown[];
  scheduleTimeline: string[];
}

export interface LiberationCalculatorState {
  liberationType: LiberationType;
  progress: LiberationProgress;
  schedule: LiberationSchedule;
}
