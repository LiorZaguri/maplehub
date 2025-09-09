export const LIBERATION_STORAGE_KEY = 'liberation-calculator-selected-characters';

// Re-export from new files
export * from './liberationData';
export * from './types';

export const LIBERATION_LIMITS = {
  MAX_BOSS_PROGRESS: 15,
  MAX_TRACES: 1000,
  MAX_SIMULATION_WEEKS: 2000,
} as const;

export const LIBERATION_STATUS = {
  ACTIVE_THRESHOLD: 50,
} as const;

export const LIBERATION_MESSAGES = {
  NO_CHARACTERS_SELECTED: 'Select a Character',
  NO_CHARACTERS_DESCRIPTION: 'Choose a character to view liberation progress',
  ADD_CHARACTER: 'Add Character',
  ADD_CHARACTER_DESCRIPTION: 'Select another character',
  NO_CHARACTERS_FOUND: 'No Characters Found',
  NO_CHARACTERS_FOUND_DESCRIPTION: 'Add characters to your roster to view their liberation progress',
  ALREADY_SELECTED: 'Already selected',
  REMOVE_CHARACTER: 'Remove character',
  NO_WEEKLY_TRACES: 'You have 0 weekly traces. Pick at least one boss or add a weekly bonus.',
  PERFECT_CONSISTENCY: 'Assumes perfect weekly consistency and that BM is cleared once every 4 weeks if selected.',
} as const;

export const LIBERATION_LABELS = {
  LIBERATION_PROGRESS: 'Liberation Progress',
  CHARACTER_DETAILS: 'Character Details',
  BOSS_PROGRESS: 'Boss Progress',
  TRACES_COLLECTED: 'Traces Collected',
  DAYS_REMAINING: 'Days Remaining',
  COMPLETION_RATE: 'Completion Rate',
  CLASS: 'Class',
  LEVEL: 'Level',
  LIBERATION_STATUS: 'Liberation Status',
  ACTIVE: 'Active',
  IN_PROGRESS: 'In Progress',
  COMPLETED: 'completed',
  TRACES: 'traces',
  DAYS: 'days',
  OVERALL_PROGRESS: 'overall progress',
  INPUTS: 'Inputs',
  RESULT: 'Result',
  GENESIS_PASS: 'Genesis Pass',
  USE_GENESIS_PASS: 'Use Genesis Pass',
  QUEST_INFORMATION: 'Quest information',
  LIBERATION_QUEST_PROGRESS: 'Liberation quest in progress',
  TRACES_OF_DARKNESS_HELD: 'Traces of darkness held',
  BOSS_INFORMATION: 'Boss information',
  MAGNIFICATION_SCALE: 'Magnification that can be soloed every week',
  STEP_COLLECTED: 'Traces already collected in this step',
  TARGET_TRACES_STEP: 'Target traces for this step',
  WEEKLY_BONUS_OPTIONAL: 'Optional weekly bonus (e.g., pass/event)',
  BOSS: 'Boss',
  DIFFICULTY_LEVEL: 'Difficulty level',
  PARTY_MEMBERS: 'Number of party members',
  CLEAR_OR_NOT: 'Already cleared?',
  STATES_LIVER: 'Already cleared this week',
  SCHEDULED_LIBERATION_PERIOD: 'Scheduled liberation period',
  SCHEDULED_LIBERATION_DATE: 'Scheduled liberation date',
  WEEKLY_BOSS_TRACES: 'Weekly boss traces',
  MONTHLY_BOSS_TRACES: 'Monthly boss traces',
  SELECT_USE: 'Select Use',
  QUEST_SELECTION: 'Quest selection',
  SELECT_SOLPLE_SCALE: 'Select solple scale',
  TRACES_RANGE: '0 ~ 3000',
  SELECTION: 'Selection',
} as const;

export const BOSS_DATA = [
  { name: "Lotus", image: "bosses/lotus.png", difficulties: [ { label: "normal", baseTraces: 10 }, { label: "hard", baseTraces: 50 }, { label: "extreme", baseTraces: 50 } ] },
  { name: "Damien", image: "bosses/damien.png", difficulties: [ { label: "normal", baseTraces: 10 }, { label: "hard", baseTraces: 50 } ] },
  { name: "Lucid", image: "bosses/lucid.png", difficulties: [ { label: "easy", baseTraces: 15 }, { label: "normal", baseTraces: 20 }, { label: "hard", baseTraces: 65 } ] },
  { name: "Will", image: "bosses/will.png", difficulties: [ { label: "easy", baseTraces: 15 }, { label: "normal", baseTraces: 25 }, { label: "hard", baseTraces: 75 } ] },
  { name: "Gloom", image: "bosses/gloom.png", difficulties: [ { label: "normal", baseTraces: 20 }, { label: "chaos", baseTraces: 65 } ] },
  { name: "Darknell", image: "bosses/darknell.png", difficulties: [ { label: "normal", baseTraces: 25 }, { label: "hard", baseTraces: 75 } ] },
  { name: "Verus Hilla", image: "bosses/verus-hilla.png", difficulties: [ { label: "normal", baseTraces: 45 }, { label: "hard", baseTraces: 90 } ] },
  { name: "Black Mage", image: "bosses/black-mage.png", difficulties: [ { label: "hard", baseTraces: 600 }, { label: "extreme", baseTraces: 600 } ] }
] as const;

export const BLACK_MAGE_DIFFICULTIES = [
  { label: "BM (600)", value: "600" },
  { label: "BM Alt (600)", value: "600B" }
] as const;

export const PARTY_SIZES = [1, 2, 3, 4, 5, 6] as const;

export const DEFAULT_VALUES = {
  TARGET_TRACES: 6500,
  DEFAULT_PARTY_SIZE: 3,
  BLACK_MAGE_TRACES: 600,
} as const;

export const GENESIS_PASS_OPTIONS = [
  { label: 'No', value: 'no' },
  { label: 'Yes', value: 'yes' },
] as const;

export const QUEST_OPTIONS = [
  { label: 'Von Leon — 0', value: '0|Von Leon', requiredTraces: 0 },
  { label: 'Arkarium — 500', value: '500|Arkarium', requiredTraces: 500 },
  { label: 'Magnus — 1,000', value: '1000|Magnus', requiredTraces: 1000 },
  { label: 'Lotus — 1,500', value: '1500|Lotus', requiredTraces: 1500 },
  { label: 'Damien — 2,500', value: '2500|Damien', requiredTraces: 2500 },
  { label: 'Will — 3,500', value: '3500|Will', requiredTraces: 3500 },
  { label: 'Lucid — 4,500', value: '4500|Lucid', requiredTraces: 4500 },
  { label: 'Verus Hilla — 5,500', value: '5500|Verus Hilla', requiredTraces: 5500 },
] as const;

export const MAGNIFICATION_OPTIONS = [
  { label: '90%', value: '90%' },
  { label: '100%', value: '100%' },
  { label: '150%', value: '150%' },
  { label: '200%', value: '200%' },
  { label: '300%', value: '300%' },
  { label: '400%', value: '400%' },
  { label: '500%', value: '500%' },
  { label: '600%', value: '600%' },
  { label: '1000%', value: '1000%' },
] as const;

export const DIFFICULTY_OPTIONS = [
  { label: 'Easy', value: 'easy' },
  { label: 'Normal', value: 'normal' },
  { label: 'Hard', value: 'hard' },
  { label: 'Chaos', value: 'chaos' },
  { label: 'Extreme', value: 'extreme' },
] as const;
