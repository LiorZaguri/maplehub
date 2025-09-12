import { useEffect, useMemo, useRef, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { RosterCharacter, BossProgressByCharacter, BossEnabledByCharacter, BossPartyByCharacter, FilterType } from '../types/bossTracker';
import { BossInfo } from '../types/bossTracker';
import {
  getPartySize,
  getWeeklyBossCount,
  isBossEnabledForCharacter,
  isBossTempDisabledForCharacter,
  getCompletionStats,
  getCollectedValue,
  getMaxPossibleValue,
  getFilteredCharacters,
  getMostRecentResetTimestamp,
  getMostRecentMonthlyResetTimestamp,
  getTimeUntilReset
} from '../utils/bossUtils';
import {
  loadBossProgress,
  saveBossProgress,
  loadBossEnabled,
  saveBossEnabled,
  loadTempDisabledBosses,
  saveTempDisabledBosses,
  loadBossParty,
  saveBossParty,
  loadLastResetTimestamp,
  saveLastResetTimestamp,
  loadLastMonthlyResetTimestamp,
  saveLastMonthlyResetTimestamp,
  loadCharacterOrder,
  saveCharacterOrder,
  performWeeklyReset,
  performMonthlyReset,
  shouldPerformWeeklyReset,
  shouldPerformMonthlyReset
} from '../services/bossTrackerService';
import { STORAGE_KEYS } from '../constants/bossTracker';
import { getBossMeta, getMaxPartySize } from '@/lib/bossData';
import { getAllBossLists } from '../utils/bossListUtils';

export const useBossTracker = () => {
  const { toast } = useToast();
  const SHOW_BOSS_ICONS = true; // Re-enable icons now that we use local assets

  // Ref to prevent multiple simultaneous disable operations
  const disableInProgressRef = useRef<Record<string, boolean>>({});

  // Get boss lists from centralized utility
  const { weeklyBosses, dailyBosses, monthlyBosses } = useMemo(() => getAllBossLists(), []);

  // State management
  const [roster, setRoster] = useState<RosterCharacter[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.ROSTER);
      if (!stored) return [];
      const parsed = JSON.parse(stored) as Array<any>;
      return parsed.map((c) => ({
        id: c.id,
        name: c.name,
        class: c.class,
        level: c.level,
        avatarUrl: c.avatarUrl,
        exp: c.exp,
        isMain: c.isMain,
        raidPower: c.raidPower,
        legionLevel: c.legionLevel,
        worldName: c.worldName
      }));
    } catch {
      return [];
    }
  });

  const [isLoadingOrder, setIsLoadingOrder] = useState(true);
  const [progressByCharacter, setProgressByCharacter] = useState<BossProgressByCharacter>(() => loadBossProgress());
  const [enabledByCharacter, setEnabledByCharacter] = useState<BossEnabledByCharacter>(() => loadBossEnabled());
  const [tempDisabledByCharacter, setTempDisabledByCharacter] = useState<BossEnabledByCharacter>(() => loadTempDisabledBosses());
  const [partyByCharacter, setPartyByCharacter] = useState<BossPartyByCharacter>(() => loadBossParty());
  const [lastResetTimestamp, setLastResetTimestamp] = useState<number>(() => loadLastResetTimestamp());
  const [lastMonthlyResetTimestamp, setLastMonthlyResetTimestamp] = useState<number>(() => loadLastMonthlyResetTimestamp());
  const [bossFilter, setBossFilter] = useState<FilterType>('all');

  // Save to localStorage when state changes
  useEffect(() => {
    saveBossProgress(progressByCharacter);
  }, [progressByCharacter]);

  useEffect(() => {
    saveBossEnabled(enabledByCharacter);
  }, [enabledByCharacter]);

  useEffect(() => {
    saveTempDisabledBosses(tempDisabledByCharacter);
  }, [tempDisabledByCharacter]);

  useEffect(() => {
    saveBossParty(partyByCharacter);
  }, [partyByCharacter]);

  useEffect(() => {
    saveLastResetTimestamp(lastResetTimestamp);
  }, [lastResetTimestamp]);

  useEffect(() => {
    saveLastMonthlyResetTimestamp(lastMonthlyResetTimestamp);
  }, [lastMonthlyResetTimestamp]);

  // Listen for roster changes from localStorage
  useEffect(() => {
    const handleStorageChange = () => {
      try {
        const stored = localStorage.getItem(STORAGE_KEYS.ROSTER);
        if (!stored) {
          setIsLoadingOrder(false);
          return;
        }
        const parsed = JSON.parse(stored) as RosterCharacter[];

        // Load saved character order for BossTracker
        const savedOrder = loadCharacterOrder();
        if (savedOrder) {
          // Reorder characters based on saved order
          const orderedCharacters = savedOrder
            .map(id => parsed.find(c => c.id === id))
            .filter(Boolean) as RosterCharacter[];
          // Add any new characters that weren't in the saved order
          const newCharacters = parsed.filter(c => !savedOrder.includes(c.id)).map((c) => ({
            id: c.id,
            name: c.name,
            class: c.class,
            level: c.level,
            avatarUrl: c.avatarUrl,
            exp: c.exp,
            isMain: c.isMain,
            raidPower: c.raidPower,
            legionLevel: c.legionLevel,
            worldName: c.worldName
          }));
          setRoster([...orderedCharacters, ...newCharacters]);
        } else {
          // Default order: main character first, then others
          const mainCharacter = parsed.find(c => c.isMain);
          const otherCharacters = parsed.filter(c => !c.isMain);
          setRoster(mainCharacter ? [mainCharacter, ...otherCharacters] : parsed);
        }
        setIsLoadingOrder(false);
      } catch {
        setIsLoadingOrder(false);
      }
    };

    // Load initial order on mount
    handleStorageChange();

    // Listen for storage changes
    window.addEventListener('storage', handleStorageChange);

    // Also listen for custom events (for same-tab updates)
    const handleRosterUpdate = () => handleStorageChange();
    window.addEventListener('rosterUpdate', handleRosterUpdate);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('rosterUpdate', handleRosterUpdate);
    };
  }, []);

  // Auto-reset logic for weekly/daily bosses
  useEffect(() => {
    if (shouldPerformWeeklyReset(lastResetTimestamp)) {
      setProgressByCharacter(prev => performWeeklyReset(prev, weeklyBosses, dailyBosses));
      setTempDisabledByCharacter({});
      setLastResetTimestamp(getMostRecentResetTimestamp());

      toast({
        title: 'Weekly Reset',
        description: 'Boss progress has been automatically reset for the new week!',
        className: 'progress-complete'
      });
    }
  }, [lastResetTimestamp, weeklyBosses, dailyBosses, toast]);

  // Monthly auto-reset effect
  useEffect(() => {
    if (shouldPerformMonthlyReset(lastMonthlyResetTimestamp)) {
      setProgressByCharacter(prev => performMonthlyReset(prev, monthlyBosses));
      setLastMonthlyResetTimestamp(getMostRecentMonthlyResetTimestamp());

      toast({
        title: 'Monthly Reset',
        description: 'Monthly boss progress has been automatically reset for the new month!',
        className: 'progress-complete'
      });
    }
  }, [lastMonthlyResetTimestamp, monthlyBosses, toast]);

  // Business logic functions
  const toggleBossComplete = (characterName: string, bossName: string) => {
    const isMonthly = monthlyBosses.some(b => b.name === bossName);
    const current = progressByCharacter[characterName] || {};
    const willBeChecked = !current[bossName];
    const currentCount = getWeeklyBossCount(characterName, progressByCharacter, enabledByCharacter, tempDisabledByCharacter, weeklyBosses, dailyBosses, monthlyBosses);

    // If we're trying to check any boss and it would exceed 14, prevent it
    if (willBeChecked && currentCount >= 14) {
      toast({
        title: 'Crystal Limit Reached',
        description: 'You cannot complete more than 14 weekly bosses. Please disable a boss first.',
        variant: 'destructive'
      });
      return;
    }

    setProgressByCharacter((prev) => ({
      ...prev,
      [characterName]: {
        ...current,
        [bossName]: willBeChecked,
      },
    }));
  };

  const toggleBossEnabled = (characterName: string, bossName: string, defaultEnabled = true) => {
    setEnabledByCharacter((prev) => {
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
  };

  const disableLowestValueBoss = (characterName: string) => {
    if (disableInProgressRef.current[characterName]) {
      return;
    }

    disableInProgressRef.current[characterName] = true;

    const weeklyDailyBosses = [...weeklyBosses, ...dailyBosses];
    const enabledBosses = weeklyDailyBosses.filter(b => isBossEnabledForCharacter(characterName, b.name, enabledByCharacter) && !isBossTempDisabledForCharacter(characterName, b.name, tempDisabledByCharacter));

    if (enabledBosses.length === 0) {
      disableInProgressRef.current[characterName] = false;
      return;
    }

    const lowestValueBoss = enabledBosses.reduce((lowest, current) => {
      const lowestValue = Math.floor(lowest.value / getPartySize(characterName, lowest.name, partyByCharacter));
      const currentValue = Math.floor(current.value / getPartySize(characterName, current.name, partyByCharacter));
      return currentValue < lowestValue ? current : lowest;
    });

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

    toast({
      title: 'Boss Temporarily Disabled',
      description: `${lowestValueBoss.name} has been temporarily disabled for ${characterName} to stay within the 14 crystal limit.`,
      className: 'bg-orange-500 text-white'
    });

    setTimeout(() => {
      disableInProgressRef.current[characterName] = false;
    }, 100);
  };

  const resetAllProgress = () => {
    const combined = [...weeklyBosses, ...dailyBosses, ...monthlyBosses];
    setProgressByCharacter((prev) => {
      const next: BossProgressByCharacter = {};
      Object.keys(prev).forEach((name) => {
        const bosses = prev[name] || {};
        const updated: Record<string, boolean> = { ...bosses };
        combined.forEach((b) => { updated[b.name] = false; });
        next[name] = updated;
      });
      return next;
    });

    setTempDisabledByCharacter({});
    setLastResetTimestamp(getMostRecentResetTimestamp());
    setLastMonthlyResetTimestamp(getMostRecentMonthlyResetTimestamp());

    toast({ title: 'Reset', description: 'All boss progress has been reset!', className: 'progress-complete' });
  };

  const saveCharacterOrderToStorage = (order: string[]) => {
    saveCharacterOrder(order);
    const orderedRoster = order
      .map(id => roster.find(c => c.id === id))
      .filter(Boolean) as RosterCharacter[];
    const newCharacters = roster.filter(c => !order.includes(c.id));
    setRoster([...orderedRoster, ...newCharacters]);
  };

  // Computed values
  const filteredCharacters = useMemo(() => {
    const bosses = [...weeklyBosses, ...dailyBosses, ...monthlyBosses];
    return getFilteredCharacters(roster, bosses, progressByCharacter, enabledByCharacter, tempDisabledByCharacter, monthlyBosses, bossFilter);
  }, [roster, weeklyBosses, dailyBosses, monthlyBosses, progressByCharacter, enabledByCharacter, tempDisabledByCharacter, bossFilter]);

  const timeUntilReset = useMemo(() => getTimeUntilReset(), []);

  return {
    // Data
    roster,
    filteredCharacters,
    progressByCharacter,
    enabledByCharacter,
    tempDisabledByCharacter,
    partyByCharacter,
    weeklyBosses,
    dailyBosses,
    monthlyBosses,
    bossFilter,
    isLoadingOrder,
    timeUntilReset,
    SHOW_BOSS_ICONS,

    // Actions
    setBossFilter,
    toggleBossComplete,
    toggleBossEnabled,
    disableLowestValueBoss,
    resetAllProgress,
    saveCharacterOrderToStorage,
    setPartyByCharacter,
    setProgressByCharacter,
    setRoster,

    // Utility functions
    getPartySize: (characterName: string, bossName: string) => getPartySize(characterName, bossName, partyByCharacter),
    getWeeklyBossCount: (characterName: string) => getWeeklyBossCount(characterName, progressByCharacter, enabledByCharacter, tempDisabledByCharacter, weeklyBosses, dailyBosses, monthlyBosses),
    isBossEnabledForCharacter: (characterName: string, bossName: string) => isBossEnabledForCharacter(characterName, bossName, enabledByCharacter),
    isBossTempDisabledForCharacter: (characterName: string, bossName: string) => isBossTempDisabledForCharacter(characterName, bossName, tempDisabledByCharacter),
    getCompletionStats: (characterName: string, bossList: BossInfo[]) => getCompletionStats(characterName, bossList, progressByCharacter, enabledByCharacter, tempDisabledByCharacter, monthlyBosses),
    getCollectedValue: (characterName: string, bossList: BossInfo[]) => getCollectedValue(characterName, bossList, progressByCharacter, enabledByCharacter, partyByCharacter, monthlyBosses, roster),
    getMaxPossibleValue: (characterName: string, bossList: BossInfo[]) => getMaxPossibleValue(characterName, bossList, progressByCharacter, enabledByCharacter, tempDisabledByCharacter, partyByCharacter, monthlyBosses, false, roster),
    getBossMeta,
    getMaxPartySize,
  };
};
