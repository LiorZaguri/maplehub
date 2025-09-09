// Types used across the calculator

export type QuestStage =
  | 'None'
  | 'Arkarium'
  | 'Magnus'
  | 'Lotus'
  | 'Damien'
  | 'Will'
  | 'Lucid'
  | 'Verus Hilla';

export type BossId =
  | 'Lotus'
  | 'Damien'
  | 'Lucid'
  | 'Will'
  | 'Gloom'
  | 'Verus Hilla'
  | 'Darknell'
  | 'Black Mage';

export type Difficulty = 'Easy' | 'Normal' | 'Hard' | 'Extreme' | 'Chaos';

export interface BossSelection {
  bossId: BossId;
  difficulty: Difficulty;
  partySize: number;          // e.g., 1 for Solo, 2, 3, 4, 6...
  alreadyCleared?: boolean;   // if already cleared this week, don't count initial week
  include?: boolean;          // allow toggling bosses on/off in your UI
}

export interface CalculatorConfig {
  currentQuest: QuestStage;
  tracesHeld: number;         // "Traces of darkness held"
  startDate: string | Date;   // YYYY-MM-DD or Date
  useGenesisPass?: boolean;   // triples weekly boss traces when enabled
  weeklyResetDay?: number;    // 0=Sun .. 6=Sat (default 4 = Thu, KR reset)
  goal?: number;              // default 6500
}

export interface PlanResult {
  estimatedDateISO: string;   // YYYY-MM-DD
  weeks: number;
  weeklyTraces: number;       // sum of selected weekly bosses (after party split & pass)
  monthlyTraces: number;      // Black Mage amount (if included)
  totalAtStart: number;       // current traces after adding this week's uncleared runs
}
