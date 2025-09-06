import { BossInfo, CharacterBossProgress, BossEnabledByCharacter, CompletionStats, RosterCharacter, FilterType } from '@/types/bossTracker';
import { getBossMeta } from '@/lib/bossData';

/**
 * Get the party size for a character and boss
 */
export const getPartySize = (characterName: string, bossName: string, partyByCharacter: Record<string, Record<string, number>>): number => {
  const pc = partyByCharacter[characterName];
  const n = pc?.[bossName];
  if (!n || !Number.isFinite(n)) return 1;
  return Math.min(6, Math.max(1, Math.floor(n)));
};

/**
 * Get current boss completion count for a character (all bosses count towards crystal limit)
 */
export const getWeeklyBossCount = (
  characterName: string,
  progressByCharacter: Record<string, CharacterBossProgress>,
  enabledByCharacter: BossEnabledByCharacter,
  tempDisabledByCharacter: BossEnabledByCharacter,
  weeklyBosses: BossInfo[],
  dailyBosses: BossInfo[],
  monthlyBosses: BossInfo[]
): number => {
  const bosses = progressByCharacter[characterName] || {};
  const allBosses = [...weeklyBosses, ...dailyBosses, ...monthlyBosses];
  return allBosses.filter(b =>
    isBossEnabledForCharacter(characterName, b.name, enabledByCharacter) &&
    !isBossTempDisabledForCharacter(characterName, b.name, tempDisabledByCharacter) &&
    bosses[b.name]
  ).length;
};

/**
 * Check if a boss is enabled for a character
 */
export const isBossEnabledForCharacter = (characterName: string, bossName: string, enabledByCharacter: BossEnabledByCharacter): boolean => {
  const enabled = enabledByCharacter[characterName] || {};
  const hasAny = Object.keys(enabled).length > 0;
  const meta = getBossMeta(bossName);
  return hasAny ? !!enabled[bossName] : (meta?.defaultEnabled ?? true);
};

/**
 * Check if a boss is temporarily disabled for a character
 */
export const isBossTempDisabledForCharacter = (characterName: string, bossName: string, tempDisabledByCharacter: BossEnabledByCharacter): boolean => {
  const tempDisabled = tempDisabledByCharacter[characterName] || {};
  return !!tempDisabled[bossName];
};

/**
 * Get completion stats for a character and boss list
 */
export const getCompletionStats = (
  characterName: string,
  bossList: BossInfo[],
  progressByCharacter: Record<string, CharacterBossProgress>,
  enabledByCharacter: BossEnabledByCharacter,
  tempDisabledByCharacter: BossEnabledByCharacter,
  monthlyBosses: BossInfo[],
  includeMonthlyChecked = false
): CompletionStats => {
  const bosses = progressByCharacter[characterName] || {};
  let considered = bossList.filter(b => isBossEnabledForCharacter(characterName, b.name, enabledByCharacter) && !isBossTempDisabledForCharacter(characterName, b.name, tempDisabledByCharacter));

  // For weekly stats, only include monthly bosses if they are checked
  if (!includeMonthlyChecked) {
    const isMonthly = (bossName: string) => monthlyBosses.some(b => b.name === bossName);
    considered = considered.filter(b => !isMonthly(b.name) || bosses[b.name]);
  }

  // Always limit to 14 bosses total (including monthly if checked)
  const currentCount = getWeeklyBossCount(characterName, progressByCharacter, enabledByCharacter, tempDisabledByCharacter, [], [], monthlyBosses);
  if (currentCount >= 14) {
    // Sort by value (highest first) and take top 14
    considered = considered
      .sort((a, b) => {
        const aVal = Math.floor(a.value / getPartySize(characterName, a.name, {}));
        const bVal = Math.floor(b.value / getPartySize(characterName, b.name, {}));
        return bVal - aVal;
      })
      .slice(0, 14);
  }

  const completed = considered.filter(b => bosses[b.name]).length;
  const total = considered.length;
  return { completed, total, percentage: total ? Math.round((completed / total) * 100) : 0 };
};

/**
 * Get collected value for a character and boss list
 */
export const getCollectedValue = (
  characterName: string,
  bossList: BossInfo[],
  progressByCharacter: Record<string, CharacterBossProgress>,
  enabledByCharacter: BossEnabledByCharacter,
  partyByCharacter: Record<string, Record<string, number>>,
  monthlyBosses: BossInfo[]
): number => {
  const bosses = progressByCharacter[characterName] || {};

  return bossList.reduce((sum, b) => {
    const isEnabled = isBossEnabledForCharacter(characterName, b.name, enabledByCharacter);
    const party = getPartySize(characterName, b.name, partyByCharacter);
    const share = Math.floor(b.value / party);

    return sum + (isEnabled && bosses[b.name] ? share : 0);
  }, 0);
};

/**
 * Get max possible value for a character and boss list
 */
export const getMaxPossibleValue = (
  characterName: string,
  bossList: BossInfo[],
  progressByCharacter: Record<string, CharacterBossProgress>,
  enabledByCharacter: BossEnabledByCharacter,
  tempDisabledByCharacter: BossEnabledByCharacter,
  partyByCharacter: Record<string, Record<string, number>>,
  monthlyBosses: BossInfo[],
  includeMonthlyChecked = false
): number => {
  const bosses = progressByCharacter[characterName] || {};
  const currentCount = getWeeklyBossCount(characterName, progressByCharacter, enabledByCharacter, tempDisabledByCharacter, [], [], monthlyBosses);

  let considered = bossList.filter(b => {
    const isEnabled = isBossEnabledForCharacter(characterName, b.name, enabledByCharacter);
    const isTempDisabled = isBossTempDisabledForCharacter(characterName, b.name, tempDisabledByCharacter);
    const isMonthly = monthlyBosses.some(mb => mb.name === b.name);

    // For weekly calculations, only include monthly bosses if they are checked
    if (!includeMonthlyChecked && isMonthly && !bosses[b.name]) {
      return false;
    }

    return isEnabled && !isTempDisabled;
  });

  // If we're at or over the 14 boss limit, only include the top 14 highest-value bosses
  if (currentCount >= 14) {
    considered = considered
      .sort((a, b) => {
        const aVal = Math.floor(a.value / getPartySize(characterName, a.name, partyByCharacter));
        const bVal = Math.floor(b.value / getPartySize(characterName, b.name, partyByCharacter));
        return bVal - aVal;
      })
      .slice(0, 14);
  }

  return considered.reduce((sum, b) => {
    const party = getPartySize(characterName, b.name, partyByCharacter);
    const share = Math.floor(b.value / party);
    return sum + share;
  }, 0);
};

/**
 * Filter characters based on completion status
 */
export const getFilteredCharacters = (
  characters: RosterCharacter[],
  bossList: BossInfo[],
  progressByCharacter: Record<string, CharacterBossProgress>,
  enabledByCharacter: BossEnabledByCharacter,
  tempDisabledByCharacter: BossEnabledByCharacter,
  monthlyBosses: BossInfo[],
  filter: FilterType
): RosterCharacter[] => {
  switch (filter) {
    case 'finished':
      return characters.filter(char => {
        const stats = getCompletionStats(char.name, bossList, progressByCharacter, enabledByCharacter, tempDisabledByCharacter, monthlyBosses);
        return stats.percentage === 100 && stats.total > 0;
      });
    case 'unfinished':
      return characters.filter(char => {
        const stats = getCompletionStats(char.name, bossList, progressByCharacter, enabledByCharacter, tempDisabledByCharacter, monthlyBosses);
        return stats.percentage < 100 || stats.total === 0;
      });
    case 'all':
    default:
      return characters;
  }
};

/**
 * Get the most recent Thursday 00:00 UTC timestamp
 */
export const getMostRecentResetTimestamp = (): number => {
  const now = new Date();
  const dayOfWeek = now.getUTCDay(); // 0 = Sunday, 4 = Thursday
  const hours = now.getUTCHours();
  const minutes = now.getUTCMinutes();
  const seconds = now.getUTCSeconds();

  // Calculate days to subtract to get to the most recent Thursday
  let daysToSubtract = (dayOfWeek - 4 + 7) % 7;
  if (dayOfWeek === 4 && (hours > 0 || minutes > 0 || seconds > 0)) {
    daysToSubtract = 0; // It's Thursday but past midnight, so most recent is today
  } else if (dayOfWeek < 4) {
    daysToSubtract = 7 - (4 - dayOfWeek); // Go back to previous Thursday
  }

  const mostRecentThursday = new Date(now);
  mostRecentThursday.setUTCDate(now.getUTCDate() - daysToSubtract);
  mostRecentThursday.setUTCHours(0, 0, 0, 0);

  return mostRecentThursday.getTime();
};

/**
 * Get the most recent monthly reset timestamp (between last day of month and 1st of next month at UTC+0)
 */
export const getMostRecentMonthlyResetTimestamp = (): number => {
  const now = new Date();
  const currentDay = now.getUTCDate();
  const currentMonth = now.getUTCMonth();
  const currentYear = now.getUTCFullYear();
  const hours = now.getUTCHours();
  const minutes = now.getUTCMinutes();
  const seconds = now.getUTCSeconds();

  // Get the last day of the current month
  const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  let resetDate: Date;
  let resetDay: number;

  if (currentDay === lastDayOfMonth && (hours >= 0 || minutes > 0 || seconds > 0)) {
    // We're on the last day of the month and it's past midnight UTC
    // Next reset is the 1st of next month
    resetDate = new Date(currentYear, currentMonth + 1, 1);
    resetDay = 1;
  } else if (currentDay === 1 && (hours === 0 && minutes === 0 && seconds === 0)) {
    // We're exactly at midnight on the 1st - this is the reset time
    resetDate = new Date(currentYear, currentMonth, 1);
    resetDay = 1;
  } else if (currentDay >= lastDayOfMonth) {
    // We're past the last day of the month, so most recent reset was the 1st of this month
    resetDate = new Date(currentYear, currentMonth, 1);
    resetDay = 1;
  } else {
    // We're in the middle of the month, so most recent reset was the 1st of this month
    resetDate = new Date(currentYear, currentMonth, 1);
    resetDay = 1;
  }

  resetDate.setUTCHours(0, 0, 0, 0);
  return resetDate.getTime();
};

/**
 * Get time until next reset
 */
export const getTimeUntilReset = (): string => {
  const now = new Date();
  const dayOfWeek = now.getUTCDay(); // 0 = Sunday, 4 = Thursday
  const hours = now.getUTCHours();
  const minutes = now.getUTCMinutes();
  const seconds = now.getUTCSeconds();

  // Calculate days until next Thursday (weekly reset)
  let daysUntilThursday = (4 - dayOfWeek + 7) % 7;
  if (daysUntilThursday === 0 && (hours > 0 || minutes > 0 || seconds > 0)) {
    daysUntilThursday = 7;
  }

  const nextReset = new Date(now);
  nextReset.setUTCDate(now.getUTCDate() + daysUntilThursday);
  nextReset.setUTCHours(0, 0, 0, 0);

  const diffMs = nextReset.getTime() - now.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

  return `${diffDays}d ${diffHours}h ${diffMinutes}m`;
};
