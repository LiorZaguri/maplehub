// Storage keys for boss tracker
export const STORAGE_KEYS = {
  ROSTER: 'maplehub_roster',
  BOSS_PROGRESS: 'maplehub_boss_progress',
  BOSS_ENABLED: 'maplehub_boss_enabled',
  BOSS_TEMP_DISABLED: 'maplehub_temp_disabled_bosses',
  BOSS_PARTY: 'maplehub_boss_party_sizes',
  LAST_RESET_TIMESTAMP: 'maplehub_last_reset_timestamp',
  LAST_MONTHLY_RESET_TIMESTAMP: 'maplehub_last_monthly_reset_timestamp',
  CHARACTER_ORDER: 'maplehub_bosstracker_character_order',
} as const;

// Default values
export const DEFAULTS = {
  PARTY_SIZE: 1,
  MAX_PARTY_SIZE: 6,
  CRYSTAL_LIMIT: 14,
  TOTAL_CRYSTALS: 180,
} as const;

// Time constants
export const TIME_CONSTANTS = {
  RESET_CHECK_INTERVAL: 10 * 60 * 1000, // 10 minutes
  WEEKLY_RESET_DAY: 4, // Thursday (0 = Sunday)
  MONTHLY_RESET_DAY: 1, // 1st of month
} as const;

// UI constants
export const UI_CONSTANTS = {
  SHOW_BOSS_ICONS: true,
  MAX_VISIBLE_BOSSES: 14,
} as const;

// Boss categories
export const BOSS_CATEGORIES = {
  WEEKLY: 'weekly',
  DAILY: 'daily',
  MONTHLY: 'monthly',
} as const;

// Filter options
export const FILTER_OPTIONS = {
  ALL: 'all',
  FINISHED: 'finished',
  UNFINISHED: 'unfinished',
} as const;
