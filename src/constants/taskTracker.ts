// LocalStorage keys
export const STORAGE_KEYS = {
  ROSTER: 'maplehub_roster',
  TASKS: 'maplehub_tasks',
  ENABLED_TASKS: 'maplehub_enabled_tasks',
  TASK_PRESETS: 'maplehub_task_presets',
  COLLAPSED_SECTIONS: 'maplehub_collapsed_sections',
  HIDDEN_CHARACTERS: 'maplehub_hidden_characters_tasktracker',
  EXPANDED_TASK_LISTS: 'maplehub_expanded_task_lists',
  CHARACTER_ORDER: 'maplehub_tasktracker_character_order',
} as const;

// Default values
export const DEFAULTS = {
  TASK_PRIORITY: 'medium' as const,
  TASK_FREQUENCY: 'daily' as const,
  TASK_CATEGORY: 'Daily Quest',
  RESET_CHECK_INTERVAL: 1000, // 1 second
} as const;

// Time calculations
export const TIME_CONSTANTS = {
  UTC_DAILY_RESET_HOUR: 0,
  UTC_WEEKLY_RESET_DAY: 3, // Wednesday
  SECONDS_PER_MINUTE: 60,
  MINUTES_PER_HOUR: 60,
  HOURS_PER_DAY: 24,
} as const;

// UI Constants
export const UI_CONSTANTS = {
  LOADING_SKELETON_COUNT: 6,
  MAX_PRESET_NAME_LENGTH: 50,
  TOAST_DURATION: 4000,
} as const;
