import { Character as RosterCharacter } from '@/features/roster/types/roster';

export interface LiberationCharacter extends RosterCharacter {
  bossProgress: number;
  tracesCollected: number;
  daysRemaining: number;
  completionRate: number;
}

export interface LiberationProgress {
  bossProgress: number;
  tracesCollected: number;
  daysRemaining: number;
  completionRate: number;
}

export interface LiberationCalculatorState {
  selectedCharacters: LiberationCharacter[];
  activeCharacter: LiberationCharacter | null;
  isCharacterSheetOpen: boolean;
}

export interface LiberationCalculatorActions {
  handleCharacterSelect: (character: LiberationCharacter) => void;
  handleCharacterRemove: (characterId: string) => void;
  handleCharacterClick: (character: LiberationCharacter) => void;
  setIsCharacterSheetOpen: (open: boolean) => void;
}

export interface LiberationCalculatorHookReturn extends LiberationCalculatorState, LiberationCalculatorActions {
  characters: LiberationCharacter[];
}

export interface BossDifficulty {
  label: string;
  baseTraces: number;
}

export interface Boss {
  name: string;
  difficulties: BossDifficulty[];
}

export interface BossSelection {
  bossName: string;
  difficulty: string;
  partySize: number;
  weeklyShare: number;
  isClearing: boolean;
}

export interface LiberationCalculation {
  weeklyTraces: number;
  bmMonthly: number;
  totalPer4Weeks: number;
  weeksNeeded: number;
  eta: string;
  finalTraces: number;
}

export interface LiberationCalculatorInputs {
  currentTraces: number;
  targetTraces: number;
  weeklyBonus: number;
  startDate: string;
  bossSelections: BossSelection[];
  bmDifficulty: string;
  bmPartySize: number;
  genesisPass: string;
  liberationQuest: string;
  magnificationScale: string;
  stepCollected: number;
  completionRate: number;
}

export interface BossTableRow {
  bossName: string;
  difficulty: string;
  partySize: number;
  isClearing: boolean;
  weeklyShare: number;
}
