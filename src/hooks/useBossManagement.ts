import { useState, useEffect, useCallback } from 'react';
import { useLocalStorageObject } from './useLocalStorage';
import { getBossMeta, listAllBosses, getMaxPartySize } from '@/lib/bossData';

export interface BossProgress {
  [bossName: string]: boolean;
}

export interface BossPartySize {
  [bossName: string]: number;
}

export interface UseBossManagementOptions {
  storageKey?: string;
}

export function useBossManagement(options: UseBossManagementOptions = {}) {
  const { storageKey = 'maplehub_boss_progress' } = options;

  const [progressByCharacter, setProgressByCharacter, updateProgressKey, removeProgressKey] = useLocalStorageObject<Record<string, BossProgress>>(storageKey, {});
  const [enabledByCharacter, setEnabledByCharacter] = useState<Record<string, BossProgress>>({});
  const [tempDisabledByCharacter, setTempDisabledByCharacter] = useState<Record<string, BossProgress>>({});
  const [partyByCharacter, setPartyByCharacter] = useState<Record<string, BossPartySize>>({});

  // Load additional boss data from localStorage
  useEffect(() => {
    try {
      const storedEnabled = localStorage.getItem('maplehub_boss_enabled');
      if (storedEnabled) {
        setEnabledByCharacter(JSON.parse(storedEnabled));
      }

      const storedTempDisabled = localStorage.getItem('maplehub_temp_disabled_bosses');
      if (storedTempDisabled) {
        setTempDisabledByCharacter(JSON.parse(storedTempDisabled));
      }

      const storedParty = localStorage.getItem('maplehub_boss_party');
      if (storedParty) {
        setPartyByCharacter(JSON.parse(storedParty));
      }
    } catch (error) {
      console.error('Failed to load boss management data:', error);
    }
  }, []);

  // Save additional boss data to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('maplehub_boss_enabled', JSON.stringify(enabledByCharacter));
    } catch (error) {
      console.error('Failed to save boss enabled data:', error);
    }
  }, [enabledByCharacter]);

  useEffect(() => {
    try {
      localStorage.setItem('maplehub_temp_disabled_bosses', JSON.stringify(tempDisabledByCharacter));
    } catch (error) {
      console.error('Failed to save temp disabled bosses:', error);
    }
  }, [tempDisabledByCharacter]);

  useEffect(() => {
    try {
      localStorage.setItem('maplehub_boss_party', JSON.stringify(partyByCharacter));
    } catch (error) {
      console.error('Failed to save boss party data:', error);
    }
  }, [partyByCharacter]);

  // Toggle boss completion
  const toggleBossComplete = useCallback((characterName: string, bossName: string) => {
    const current = progressByCharacter[characterName] || {};
    const willBeChecked = !current[bossName];
    const currentCount = getWeeklyBossCount(characterName);

    // If we're trying to check any boss and it would exceed 14, prevent it
    if (willBeChecked && currentCount >= 14) {
      throw new Error('Crystal Limit Reached');
    }

    setProgressByCharacter(prev => ({
      ...prev,
      [characterName]: {
        ...current,
        [bossName]: willBeChecked,
      },
    }));
  }, [progressByCharacter, setProgressByCharacter]);

  // Toggle boss enabled/disabled
  const toggleBossEnabled = useCallback((characterName: string, bossName: string, defaultEnabled = true) => {
    setEnabledByCharacter(prev => {
      const current = prev[characterName] || {};
      const currentVal = bossName in current ? current[bossName] : defaultEnabled;
      return {
        ...prev,
        [characterName]: {
          ...current,
          [bossName]: !currentVal,
        },
      };
    });
  }, []);

  // Check if boss is enabled for character
  const isBossEnabledForCharacter = useCallback((characterName: string, bossName: string): boolean => {
    const enabled = enabledByCharacter[characterName] || {};
    const hasAny = Object.keys(enabled).length > 0;
    const meta = getBossMeta(bossName);
    return hasAny ? !!enabled[bossName] : (meta?.defaultEnabled ?? true);
  }, [enabledByCharacter]);

  // Check if boss is temporarily disabled for character
  const isBossTempDisabledForCharacter = useCallback((characterName: string, bossName: string): boolean => {
    const tempDisabled = tempDisabledByCharacter[characterName] || {};
    return !!tempDisabled[bossName];
  }, [tempDisabledByCharacter]);

  // Get party size for boss
  const getPartySize = useCallback((characterName: string, bossName: string): number => {
    const pc = partyByCharacter[characterName];
    const n = pc?.[bossName];
    if (!n || !Number.isFinite(n)) return 1;
    return Math.min(6, Math.max(1, Math.floor(n)));
  }, [partyByCharacter]);

  // Set party size for boss
  const setPartySize = useCallback((characterName: string, bossName: string, size: number) => {
    const maxSize = getMaxPartySize(bossName);
    const validSize = Math.min(maxSize, Math.max(1, Math.floor(size)));

    setPartyByCharacter(prev => ({
      ...prev,
      [characterName]: {
        ...prev[characterName],
        [bossName]: validSize,
      },
    }));
  }, []);

  // Get weekly boss count for character
  const getWeeklyBossCount = useCallback((characterName: string): number => {
    const bosses = progressByCharacter[characterName] || {};
    const allBosses = listAllBosses();
    return allBosses.filter(b =>
      isBossEnabledForCharacter(characterName, b.name) &&
      !isBossTempDisabledForCharacter(characterName, b.name) &&
      bosses[b.name]
    ).length;
  }, [progressByCharacter, isBossEnabledForCharacter, isBossTempDisabledForCharacter]);

  // Get completion stats for character
  const getCompletionStats = useCallback((characterName: string, bossList: ReturnType<typeof listAllBosses>) => {
    const bosses = progressByCharacter[characterName] || {};
    let considered = bossList.filter(b => isBossEnabledForCharacter(characterName, b.name) && !isBossTempDisabledForCharacter(characterName, b.name));

    // For weekly stats, only include monthly bosses if they are checked
    const isMonthly = (bossName: string) => bossName.includes('Black Mage');
    considered = considered.filter(b => !isMonthly(b.name) || bosses[b.name]);

    // Always limit to 14 bosses total (including monthly if checked)
    const currentCount = getWeeklyBossCount(characterName);
    if (currentCount >= 14) {
      // Sort by value (highest first) and take top 14
      considered = considered
        .sort((a, b) => {
          const aVal = Math.floor(a.mesos / getPartySize(characterName, a.name));
          const bVal = Math.floor(b.mesos / getPartySize(characterName, b.name));
          return bVal - aVal;
        })
        .slice(0, 14);
    }

    const completed = considered.filter(b => bosses[b.name]).length;
    const total = considered.length;
    return { completed, total, percentage: total ? Math.round((completed / total) * 100) : 0 };
  }, [progressByCharacter, isBossEnabledForCharacter, isBossTempDisabledForCharacter, getWeeklyBossCount, getPartySize]);

  // Get collected value for character
  const getCollectedValue = useCallback((characterName: string, bossList: ReturnType<typeof listAllBosses>) => {
    const bosses = progressByCharacter[characterName] || {};
    const currentCount = getWeeklyBossCount(characterName);

    return bossList.reduce((sum, b) => {
      const isEnabled = isBossEnabledForCharacter(characterName, b.name);
      const isMonthly = b.name.includes('Black Mage');
      const party = getPartySize(characterName, b.name);
      const share = Math.floor(b.mesos / party);

      // If we're over the 14 boss limit, exclude monthly bosses from value calculations
      if (currentCount > 14 && isMonthly) {
        return sum;
      }

      return sum + (isEnabled && bosses[b.name] ? share : 0);
    }, 0);
  }, [progressByCharacter, getWeeklyBossCount, isBossEnabledForCharacter, getPartySize]);

  // Get max possible value for character
  const getMaxPossibleValue = useCallback((characterName: string, bossList: ReturnType<typeof listAllBosses>) => {
    const bosses = progressByCharacter[characterName] || {};
    const currentCount = getWeeklyBossCount(characterName);

    let considered = bossList.filter(b => {
      const isEnabled = isBossEnabledForCharacter(characterName, b.name);
      const isTempDisabled = isBossTempDisabledForCharacter(characterName, b.name);
      const isMonthly = b.name.includes('Black Mage');

      // For weekly calculations, only include monthly bosses if they are checked
      if (isMonthly && !bosses[b.name]) {
        return false;
      }

      return isEnabled && !isTempDisabled;
    });

    // If we're at or over the 14 boss limit, only include the top 14 highest-value bosses
    if (currentCount >= 14) {
      considered = considered
        .sort((a, b) => {
          const aVal = Math.floor(a.mesos / getPartySize(characterName, a.name));
          const bVal = Math.floor(b.mesos / getPartySize(characterName, b.name));
          return bVal - aVal;
        })
        .slice(0, 14);
    }

    return considered.reduce((sum, b) => {
      const party = getPartySize(characterName, b.name);
      const share = Math.floor(b.mesos / party);
      return sum + share;
    }, 0);
  }, [progressByCharacter, getWeeklyBossCount, isBossEnabledForCharacter, isBossTempDisabledForCharacter, getPartySize]);

  // Disable lowest value boss for character
  const disableLowestValueBoss = useCallback((characterName: string) => {
    const allBosses = listAllBosses();
    const enabledBosses = allBosses.filter(b => isBossEnabledForCharacter(characterName, b.name) && !isBossTempDisabledForCharacter(characterName, b.name));

    if (enabledBosses.length === 0) {
      return;
    }

    // Find the lowest value boss among enabled ones
    const lowestValueBoss = enabledBosses.reduce((lowest, current) => {
      const lowestValue = Math.floor(lowest.mesos / getPartySize(characterName, lowest.name));
      const currentValue = Math.floor(current.mesos / getPartySize(characterName, current.name));
      return currentValue < lowestValue ? current : lowest;
    });

    // Temporarily disable the lowest value boss
    setTempDisabledByCharacter((prev) => {
      const current = prev[characterName] || {};
      return {
        ...prev,
        [characterName]: {
          ...current,
          [lowestValueBoss.name]: true,
        },
      };
    });
  }, [isBossEnabledForCharacter, isBossTempDisabledForCharacter, getPartySize]);

  // Reset all progress
  const resetAllProgress = useCallback(() => {
    const allBosses = listAllBosses();
    setProgressByCharacter((prev) => {
      const next: Record<string, BossProgress> = {};
      Object.keys(prev).forEach((name) => {
        const bosses: BossProgress = {};
        allBosses.forEach((b) => { bosses[b.name] = false; });
        next[name] = bosses;
      });
      return next;
    });

    // Clear temporary disabled bosses
    setTempDisabledByCharacter({});
  }, [setProgressByCharacter]);

  return {
    progressByCharacter,
    enabledByCharacter,
    tempDisabledByCharacter,
    partyByCharacter,
    toggleBossComplete,
    toggleBossEnabled,
    isBossEnabledForCharacter,
    isBossTempDisabledForCharacter,
    getPartySize,
    setPartySize,
    getWeeklyBossCount,
    getCompletionStats,
    getCollectedValue,
    getMaxPossibleValue,
    disableLowestValueBoss,
    resetAllProgress,
  };
}
