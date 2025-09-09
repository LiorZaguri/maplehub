import { BossProgressByCharacter, BossEnabledByCharacter, BossPartyByCharacter, BossInfo } from '../types/bossTracker';
import { getMostRecentResetTimestamp, getMostRecentMonthlyResetTimestamp } from '../utils/bossUtils';
import { createObjectStorage, createNumberStorage, createArrayStorage } from '@/utils/storageUtils';

// Storage keys
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

// Typed storage instances
const bossProgressStorage = createObjectStorage<BossProgressByCharacter>(STORAGE_KEYS.BOSS_PROGRESS, {});
const bossEnabledStorage = createObjectStorage<BossEnabledByCharacter>(STORAGE_KEYS.BOSS_ENABLED, {});
const tempDisabledStorage = createObjectStorage<BossEnabledByCharacter>(STORAGE_KEYS.BOSS_TEMP_DISABLED, {});
const bossPartyStorage = createObjectStorage<BossPartyByCharacter>(STORAGE_KEYS.BOSS_PARTY, {});
const lastResetStorage = createNumberStorage(STORAGE_KEYS.LAST_RESET_TIMESTAMP, 0);
const lastMonthlyResetStorage = createNumberStorage(STORAGE_KEYS.LAST_MONTHLY_RESET_TIMESTAMP, 0);
const characterOrderStorage = createArrayStorage<string>(STORAGE_KEYS.CHARACTER_ORDER, []);

/**
 * Load boss progress from localStorage
 */
export const loadBossProgress = (): BossProgressByCharacter => bossProgressStorage.load();

/**
 * Save boss progress to localStorage
 */
export const saveBossProgress = (progress: BossProgressByCharacter): void => bossProgressStorage.save(progress);

/**
 * Load boss enabled state from localStorage
 */
export const loadBossEnabled = (): BossEnabledByCharacter => bossEnabledStorage.load();

/**
 * Save boss enabled state to localStorage
 */
export const saveBossEnabled = (enabled: BossEnabledByCharacter): void => bossEnabledStorage.save(enabled);

/**
 * Load temporary disabled bosses from localStorage
 */
export const loadTempDisabledBosses = (): BossEnabledByCharacter => tempDisabledStorage.load();

/**
 * Save temporary disabled bosses to localStorage
 */
export const saveTempDisabledBosses = (tempDisabled: BossEnabledByCharacter): void => tempDisabledStorage.save(tempDisabled);

/**
 * Load party sizes from localStorage
 */
export const loadBossParty = (): BossPartyByCharacter => bossPartyStorage.load();

/**
 * Save party sizes to localStorage
 */
export const saveBossParty = (party: BossPartyByCharacter): void => bossPartyStorage.save(party);

/**
 * Load last reset timestamp from localStorage
 */
export const loadLastResetTimestamp = (): number => lastResetStorage.load();

/**
 * Save last reset timestamp to localStorage
 */
export const saveLastResetTimestamp = (timestamp: number): void => lastResetStorage.save(timestamp);

/**
 * Load last monthly reset timestamp from localStorage
 */
export const loadLastMonthlyResetTimestamp = (): number => lastMonthlyResetStorage.load();

/**
 * Save last monthly reset timestamp to localStorage
 */
export const saveLastMonthlyResetTimestamp = (timestamp: number): void => lastMonthlyResetStorage.save(timestamp);

/**
 * Load character order from localStorage
 */
export const loadCharacterOrder = (): string[] | null => {
  const order = characterOrderStorage.load();
  return order.length > 0 ? order : null;
};

/**
 * Save character order to localStorage
 */
export const saveCharacterOrder = (order: string[]): void => characterOrderStorage.save(order);

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
