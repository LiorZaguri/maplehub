import { BossInfo } from '../types/bossTracker';
import { listAllBosses } from '@/lib/bossData';

// Daily boss variants that reset daily instead of weekly
const DAILY_VARIANT_SET = new Set<string>([
  'Normal Zakum',
  'Normal Magnus',
  'Normal Hilla',
  'Normal Papulatus',
  'Normal Pierre',
  'Normal Von Bon',
  'Normal Crimson Queen',
  'Normal Vellum',
  'Normal Von Leon',
  'Hard Von Leon',
  'Normal Horntail',
  'Chaos Horntail',
  'Easy Arkarium',
  'Normal Arkarium',
  'Normal Pink Bean',
  'Normal Ranmaru',
  'Hard Ranmaru',
  'Normal Gollux',
]);

/**
 * Parse boss name to extract base name (without difficulty)
 */
export const parseBase = (name: string): string => {
  const parts = name.split(' ');
  return parts.slice(1).join(' ');
};

/**
 * Parse boss name to extract difficulty and base name
 */
export const parseBoss = (fullName: string): { difficulty: string; base: string } => {
  const parts = fullName.split(' ');
  const difficulty = parts[0];
  const base = parts.slice(1).join(' ');
  return { difficulty, base };
};

/**
 * Check if a boss base name is monthly (Black Mage variants)
 */
export const isMonthlyBase = (base: string): boolean => {
  return base.includes('Black Mage');
};

/**
 * Check if a boss is a daily variant
 */
export const isDailyVariant = (bossName: string): boolean => {
  return DAILY_VARIANT_SET.has(bossName);
};

/**
 * Get all weekly bosses (not daily or monthly)
 */
export const getWeeklyBosses = (): BossInfo[] => {
  const allBosses = listAllBosses();
  return allBosses
    .filter(b => {
      const base = parseBase(b.name);
      return !isDailyVariant(b.name) && !isMonthlyBase(base);
    })
    .map(b => ({ name: b.name, value: b.mesos, defaultParty: 1 }));
};

/**
 * Get all daily bosses
 */
export const getDailyBosses = (): BossInfo[] => {
  const allBosses = listAllBosses();
  return allBosses
    .filter(b => isDailyVariant(b.name))
    .map(b => ({ name: b.name, value: b.mesos, defaultParty: 1 }));
};

/**
 * Get all monthly bosses (Black Mage variants)
 */
export const getMonthlyBosses = (): BossInfo[] => {
  const allBosses = listAllBosses();
  return allBosses
    .filter(b => isMonthlyBase(parseBase(b.name)))
    .map(b => ({ name: b.name, value: b.mesos, defaultParty: 1 }));
};

/**
 * Get all boss lists in a single call
 */
export const getAllBossLists = () => {
  const weeklyBosses = getWeeklyBosses();
  const dailyBosses = getDailyBosses();
  const monthlyBosses = getMonthlyBosses();
  
  return {
    weeklyBosses,
    dailyBosses,
    monthlyBosses,
    allBosses: [...weeklyBosses, ...dailyBosses, ...monthlyBosses]
  };
};
