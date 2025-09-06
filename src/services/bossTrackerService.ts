import { BossProgressByCharacter, BossEnabledByCharacter, BossPartyByCharacter, BossInfo } from '@/types/bossTracker';
import { getMostRecentResetTimestamp, getMostRecentMonthlyResetTimestamp } from '@/utils/bossUtils';

// Storage keys
export const STORAGE_KEYS = {
  ROSTER: 'maplehub_roster',
  BOSS_PROGRESS: 'maplehub_boss_progress',
  BOSS_ENABLED: 'maplehub_boss_enabled',
  BOSS_TEMP_DISABLED: 'maplehub_temp_disabled_bosses',
  BOSS_PARTY: 'maplehub_boss_party',
  LAST_RESET_TIMESTAMP: 'maplehub_last_reset_timestamp',
  LAST_MONTHLY_RESET_TIMESTAMP: 'maplehub_last_monthly_reset_timestamp',
  CHARACTER_ORDER: 'maplehub_bosstracker_character_order',
} as const;

/**
 * Load boss progress from localStorage
 */
export const loadBossProgress = (): BossProgressByCharacter => {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.BOSS_PROGRESS);
    return stored ? (JSON.parse(stored) as BossProgressByCharacter) : {};
  } catch {
    return {};
  }
};

/**
 * Save boss progress to localStorage
 */
export const saveBossProgress = (progress: BossProgressByCharacter): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.BOSS_PROGRESS, JSON.stringify(progress));
  } catch {
    // ignore
  }
};

/**
 * Load boss enabled state from localStorage
 */
export const loadBossEnabled = (): BossEnabledByCharacter => {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.BOSS_ENABLED);
    return stored ? (JSON.parse(stored) as BossEnabledByCharacter) : {};
  } catch {
    return {};
  }
};

/**
 * Save boss enabled state to localStorage
 */
export const saveBossEnabled = (enabled: BossEnabledByCharacter): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.BOSS_ENABLED, JSON.stringify(enabled));
  } catch {
    // ignore
  }
};

/**
 * Load temporary disabled bosses from localStorage
 */
export const loadTempDisabledBosses = (): BossEnabledByCharacter => {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.BOSS_TEMP_DISABLED);
    return stored ? (JSON.parse(stored) as BossEnabledByCharacter) : {};
  } catch {
    return {};
  }
};

/**
 * Save temporary disabled bosses to localStorage
 */
export const saveTempDisabledBosses = (tempDisabled: BossEnabledByCharacter): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.BOSS_TEMP_DISABLED, JSON.stringify(tempDisabled));
  } catch {
    // ignore
  }
};

/**
 * Load party sizes from localStorage
 */
export const loadBossParty = (): BossPartyByCharacter => {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.BOSS_PARTY);
    return stored ? (JSON.parse(stored) as BossPartyByCharacter) : {};
  } catch {
    return {};
  }
};

/**
 * Save party sizes to localStorage
 */
export const saveBossParty = (party: BossPartyByCharacter): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.BOSS_PARTY, JSON.stringify(party));
  } catch {
    // ignore
  }
};

/**
 * Load last reset timestamp from localStorage
 */
export const loadLastResetTimestamp = (): number => {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.LAST_RESET_TIMESTAMP);
    return stored ? parseInt(stored) : 0;
  } catch {
    return 0;
  }
};

/**
 * Save last reset timestamp to localStorage
 */
export const saveLastResetTimestamp = (timestamp: number): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.LAST_RESET_TIMESTAMP, timestamp.toString());
  } catch {
    // ignore
  }
};

/**
 * Load last monthly reset timestamp from localStorage
 */
export const loadLastMonthlyResetTimestamp = (): number => {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.LAST_MONTHLY_RESET_TIMESTAMP);
    return stored ? parseInt(stored) : 0;
  } catch {
    return 0;
  }
};

/**
 * Save last monthly reset timestamp to localStorage
 */
export const saveLastMonthlyResetTimestamp = (timestamp: number): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.LAST_MONTHLY_RESET_TIMESTAMP, timestamp.toString());
  } catch {
    // ignore
  }
};

/**
 * Load character order from localStorage
 */
export const loadCharacterOrder = (): string[] | null => {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.CHARACTER_ORDER);
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
};

/**
 * Save character order to localStorage
 */
export const saveCharacterOrder = (order: string[]): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.CHARACTER_ORDER, JSON.stringify(order));
  } catch {
    // ignore
  }
};

/**
 * Perform weekly auto-reset
 */
export const performWeeklyReset = (
  progressByCharacter: BossProgressByCharacter,
  weeklyBosses: BossInfo[],
  dailyBosses: BossInfo[]
): BossProgressByCharacter => {
  const combined = [...weeklyBosses, ...dailyBosses];
  const next: BossProgressByCharacter = {};

  Object.keys(progressByCharacter).forEach((name) => {
    const bosses = progressByCharacter[name] || {};
    const updated: Record<string, boolean> = { ...bosses };
    combined.forEach((b) => { updated[b.name] = false; });
    next[name] = updated;
  });

  return next;
};

/**
 * Perform monthly auto-reset
 */
export const performMonthlyReset = (
  progressByCharacter: BossProgressByCharacter,
  monthlyBosses: BossInfo[]
): BossProgressByCharacter => {
  const next: BossProgressByCharacter = {};

  Object.keys(progressByCharacter).forEach((name) => {
    const bosses = progressByCharacter[name] || {};
    const updated: Record<string, boolean> = { ...bosses };
    monthlyBosses.forEach((b) => { updated[b.name] = false; });
    next[name] = updated;
  });

  return next;
};

/**
 * Check if weekly reset should occur
 */
export const shouldPerformWeeklyReset = (lastResetTimestamp: number): boolean => {
  if (lastResetTimestamp === 0) return false;

  const mostRecentReset = getMostRecentResetTimestamp();
  const now = Date.now();
  const tenMinutesAgo = now - (10 * 60 * 1000);

  return mostRecentReset > lastResetTimestamp && mostRecentReset >= tenMinutesAgo && mostRecentReset <= now;
};

/**
 * Check if monthly reset should occur
 */
export const shouldPerformMonthlyReset = (lastMonthlyResetTimestamp: number): boolean => {
  if (lastMonthlyResetTimestamp === 0) return false;

  const mostRecentMonthlyReset = getMostRecentMonthlyResetTimestamp();
  const now = Date.now();
  const tenMinutesAgo = now - (10 * 60 * 1000);

  return mostRecentMonthlyReset > lastMonthlyResetTimestamp && mostRecentMonthlyReset >= tenMinutesAgo && mostRecentMonthlyReset <= now;
};

/**
 * Reset all boss progress
 */
export const resetAllProgress = (
  weeklyBosses: BossInfo[],
  dailyBosses: BossInfo[],
  monthlyBosses: BossInfo[]
): BossProgressByCharacter => {
  const combined = [...weeklyBosses, ...dailyBosses, ...monthlyBosses];
  const next: BossProgressByCharacter = {};

  // This would need to be called with the current progress to reset it
  // For now, return empty progress
  return next;
};
