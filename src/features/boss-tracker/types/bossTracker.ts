export interface RosterCharacter {
  id: string;
  name: string;
  class: string;
  level: number;
  exp: number;
  avatarUrl?: string;
  isMain: boolean;
  legionLevel?: number;
  raidPower?: number;
  worldName?: string;
}

export interface BossInfo {
  name: string;
  value: number; // mesos value approximation
  defaultParty: number;
}

export interface CharacterBossProgress {
  [bossName: string]: boolean;
}

export type BossProgressByCharacter = Record<string, CharacterBossProgress>;
export type BossEnabledByCharacter = Record<string, CharacterBossProgress>;
export type BossPartyByCharacter = Record<string, Record<string, number>>;

export type FilterType = 'all' | 'finished' | 'unfinished';

export interface CompletionStats {
  completed: number;
  total: number;
  percentage: number;
}

export interface BossTrackerState {
  progressByCharacter: BossProgressByCharacter;
  enabledByCharacter: BossEnabledByCharacter;
  tempDisabledByCharacter: BossEnabledByCharacter;
  partyByCharacter: BossPartyByCharacter;
  lastResetTimestamp: number;
  lastMonthlyResetTimestamp: number;
}
