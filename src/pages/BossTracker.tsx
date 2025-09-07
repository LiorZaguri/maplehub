import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Sword, Calendar, Trophy, RotateCcw, Filter, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import Layout from '@/components/Layout';

import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { getBossMeta, formatMesos, listAllBosses, getMaxPartySize } from '@/lib/bossData';
import CharacterCard from '@/components/CharacterCard';
import { getCharacterWorldMultiplier } from '@/utils/bossUtils';

interface RosterCharacter {
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

interface BossInfo {
  name: string;
  value: number; // mesos value approximation
  defaultParty: number;
}

interface CharacterBossProgress {
  [bossName: string]: boolean;
}

type BossProgressByCharacter = Record<string, CharacterBossProgress>;
type BossEnabledByCharacter = Record<string, CharacterBossProgress>;
type CharacterExpMap = Record<string, number>;
type BossPartyByCharacter = Record<string, Record<string, number>>;

type FilterType = 'all' | 'finished' | 'unfinished';



const BossTracker = () => {
  const { toast } = useToast();
  const SHOW_BOSS_ICONS = true; // Re-enable icons now that we use local assets
  const navigate = useNavigate();

  // Ref to prevent multiple simultaneous disable operations
  const disableInProgressRef = useRef<Record<string, boolean>>({});
  
  // Build weekly/daily boss lists from the full dataset
  const allBosses = useMemo(() => listAllBosses(), []);
  const dailyVariantSet = useMemo(() => new Set<string>([
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
  ]), []);
  const isMonthlyBase = (base: string) => base.includes('Black Mage');
  const parseBase = (name: string) => {
    const parts = name.split(' ');
    return parts.slice(1).join(' ');
  };
  const parseBoss = (fullName: string): { difficulty: string; base: string } => {
    const parts = fullName.split(' ');
    const difficulty = parts[0];
    const base = parts.slice(1).join(' ');
    return { difficulty, base };
  };
  const weeklyBosses: BossInfo[] = useMemo(() => {
    return allBosses
      .filter(b => {
        const base = parseBase(b.name);
        return !dailyVariantSet.has(b.name) && !isMonthlyBase(base);
      })
      .map(b => ({ name: b.name, value: b.mesos, defaultParty: 1 }));
  }, [allBosses, dailyVariantSet]);
  const dailyBosses: BossInfo[] = useMemo(() => {
    return allBosses
      .filter(b => dailyVariantSet.has(b.name))
      .map(b => ({ name: b.name, value: b.mesos, defaultParty: 1 }));
  }, [allBosses, dailyVariantSet]);
  const monthlyBosses: BossInfo[] = useMemo(() => {
    return allBosses
      .filter(b => isMonthlyBase(parseBase(b.name)))
      .map(b => ({ name: b.name, value: b.mesos, defaultParty: 1 }));
  }, [allBosses]);



  // Single combined view (no tabs)

  // Load roster from localStorage to render columns per character like the reference
  const [roster, setRoster] = useState<RosterCharacter[]>(() => {
    try {
      const stored = localStorage.getItem('maplehub_roster');
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

  // Loading state for character order
  const [isLoadingOrder, setIsLoadingOrder] = useState(true);

  // Listen for roster changes from localStorage
  useEffect(() => {
    const handleStorageChange = () => {
      try {
        const stored = localStorage.getItem('maplehub_roster');
        if (!stored) {
          setIsLoadingOrder(false);
          return;
        }
        const parsed = JSON.parse(stored) as RosterCharacter[];

        // Load saved character order for BossTracker
        const savedOrder = localStorage.getItem('maplehub_bosstracker_character_order');
        if (savedOrder) {
          const orderIds = JSON.parse(savedOrder) as string[];
          // Reorder characters based on saved order
          const orderedCharacters = orderIds
            .map(id => parsed.find(c => c.id === id))
            .filter(Boolean) as RosterCharacter[];
          // Add any new characters that weren't in the saved order
          const newCharacters = parsed.filter(c => !orderIds.includes(c.id)).map((c) => ({
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

  // progress keyed by character name → bossName → checked
  const [progressByCharacter, setProgressByCharacter] = useState<BossProgressByCharacter>(() => {
    try {
      const stored = localStorage.getItem('maplehub_boss_progress');
      return stored ? (JSON.parse(stored) as BossProgressByCharacter) : {};
    } catch {
      return {};
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('maplehub_boss_progress', JSON.stringify(progressByCharacter));
    } catch {
      // ignore
    }
  }, [progressByCharacter]);

  // Per-character enabled matrix seeded from bossconfig.txt defaults (true/false)
  const [enabledByCharacter, setEnabledByCharacter] = useState<BossEnabledByCharacter>(() => {
    try {
      const stored = localStorage.getItem('maplehub_boss_enabled');
      return stored ? (JSON.parse(stored) as BossEnabledByCharacter) : {};
    } catch {
      return {};
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('maplehub_boss_enabled', JSON.stringify(enabledByCharacter));
    } catch {
      // ignore
    }
  }, [enabledByCharacter]);

  // Temporary boss disabling due to crystal limits (resets weekly)
  const [tempDisabledByCharacter, setTempDisabledByCharacter] = useState<BossEnabledByCharacter>(() => {
    try {
      const stored = localStorage.getItem('maplehub_temp_disabled_bosses');
      return stored ? (JSON.parse(stored) as BossEnabledByCharacter) : {};
    } catch {
      return {};
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('maplehub_temp_disabled_bosses', JSON.stringify(tempDisabledByCharacter));
    } catch {
      // ignore
    }
  }, [tempDisabledByCharacter]);

  // Character EXP storage for level percentage
  const [charExp, setCharExp] = useState<CharacterExpMap>(() => {
    try {
      const stored = localStorage.getItem('maplehub_char_exp');
      return stored ? (JSON.parse(stored) as CharacterExpMap) : {};
    } catch {
      return {};
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('maplehub_char_exp', JSON.stringify(charExp));
    } catch {
      // ignore
    }
  }, [charExp]);

  // Per-character party sizes for each boss variant (1-6)
  const [partyByCharacter, setPartyByCharacter] = useState<BossPartyByCharacter>(() => {
    try {
      const stored = localStorage.getItem('maplehub_boss_party');
      return stored ? (JSON.parse(stored) as BossPartyByCharacter) : {};
    } catch {
      return {};
    }
  });

  // Filter state for boss display
  const [bossFilter, setBossFilter] = useState<FilterType>('all');
  const [showReorderDialog, setShowReorderDialog] = useState(false);
  const [reorderCharacters, setReorderCharacters] = useState<RosterCharacter[]>([]);

  // Party size editing state
  const [editingPartySize, setEditingPartySize] = useState<{ characterName: string; bossName: string } | null>(null);
  const [partySizeInput, setPartySizeInput] = useState<string>('');

  useEffect(() => {
    try {
      localStorage.setItem('maplehub_boss_party', JSON.stringify(partyByCharacter));
    } catch {
      // ignore
    }
  }, [partyByCharacter]);

  // Auto-reset logic for weekly/daily bosses
  const [lastResetTimestamp, setLastResetTimestamp] = useState<number>(() => {
    try {
      const stored = localStorage.getItem('maplehub_last_reset_timestamp');
      return stored ? parseInt(stored) : 0;
    } catch {
      return 0;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('maplehub_last_reset_timestamp', lastResetTimestamp.toString());
    } catch {
      // ignore
    }
  }, [lastResetTimestamp]);

  // Auto-reset logic for monthly bosses
  const [lastMonthlyResetTimestamp, setLastMonthlyResetTimestamp] = useState<number>(() => {
    try {
      const stored = localStorage.getItem('maplehub_last_monthly_reset_timestamp');
      return stored ? parseInt(stored) : 0;
    } catch {
      return 0;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('maplehub_last_monthly_reset_timestamp', lastMonthlyResetTimestamp.toString());
    } catch {
      // ignore
    }
  }, [lastMonthlyResetTimestamp]);

  // Function to get the most recent Thursday 00:00 UTC timestamp
  const getMostRecentResetTimestamp = () => {
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

  // Function to get the most recent monthly reset timestamp (between last day of month and 1st of next month at UTC+0)
  const getMostRecentMonthlyResetTimestamp = () => {
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

  // Auto-reset effect - only trigger if user has existing data and reset just occurred
  useEffect(() => {
    // Don't auto-reset if this is a fresh install (lastResetTimestamp is 0)
    if (lastResetTimestamp === 0) return;

    const mostRecentReset = getMostRecentResetTimestamp();
    const now = Date.now();

    // Only auto-reset if:
    // 1. The most recent reset timestamp is newer than our last reset
    // 2. The reset happened within the last 10 minutes (to avoid resetting old data)
    // 3. We haven't already reset for this week's reset period
    const tenMinutesAgo = now - (10 * 60 * 1000);

    if (mostRecentReset > lastResetTimestamp && mostRecentReset >= tenMinutesAgo && mostRecentReset <= now) {
      // Perform auto-reset
      const combined = [...weeklyBosses, ...dailyBosses];
      setProgressByCharacter((prev) => {
        const next: BossProgressByCharacter = {};
        Object.keys(prev).forEach((name) => {
          const bosses = prev[name] || {};
          const updated: CharacterBossProgress = { ...bosses };
          combined.forEach((b) => { updated[b.name] = false; });
          next[name] = updated;
        });
        return next;
      });

      // Clear temporary disabled bosses
      setTempDisabledByCharacter({});

      // Update last reset timestamp
      setLastResetTimestamp(mostRecentReset);

      // Show notification
      toast({
        title: 'Weekly Reset',
        description: 'Boss progress has been automatically reset for the new week!',
        className: 'progress-complete'
      });
    }
  }, [lastResetTimestamp, weeklyBosses, dailyBosses, toast]);

  // Monthly auto-reset effect - only trigger if user has existing data and reset just occurred
  useEffect(() => {
    // Don't auto-reset if this is a fresh install (lastMonthlyResetTimestamp is 0)
    if (lastMonthlyResetTimestamp === 0) return;

    const mostRecentMonthlyReset = getMostRecentMonthlyResetTimestamp();
    const now = Date.now();

    // Only auto-reset if:
    // 1. The most recent monthly reset timestamp is newer than our last reset
    // 2. The reset happened within the last 10 minutes (to avoid resetting old data)
    // 3. We haven't already reset for this month's reset period
    const tenMinutesAgo = now - (10 * 60 * 1000);

    if (mostRecentMonthlyReset > lastMonthlyResetTimestamp && mostRecentMonthlyReset >= tenMinutesAgo && mostRecentMonthlyReset <= now) {
      // Perform monthly auto-reset - only reset monthly bosses
      setProgressByCharacter((prev) => {
        const next: BossProgressByCharacter = {};
        Object.keys(prev).forEach((name) => {
          const bosses = prev[name] || {};
          const updated: CharacterBossProgress = { ...bosses };
          monthlyBosses.forEach((b) => { updated[b.name] = false; });
          next[name] = updated;
        });
        return next;
      });

      // Update last monthly reset timestamp
      setLastMonthlyResetTimestamp(mostRecentMonthlyReset);

      // Show notification
      toast({
        title: 'Monthly Reset',
        description: 'Monthly boss progress has been automatically reset for the new month!',
        className: 'progress-complete'
      });
    }
  }, [lastMonthlyResetTimestamp, monthlyBosses, toast]);

  const getPartySize = (characterName: string, bossName: string): number => {
    const pc = partyByCharacter[characterName];
    const n = pc?.[bossName];
    if (!n || !Number.isFinite(n)) return 1;
    return Math.min(6, Math.max(1, Math.floor(n)));
  };

  // Function to get current boss completion count for a character (all bosses count towards crystal limit)
  const getWeeklyBossCount = (characterName: string): number => {
    const bosses = progressByCharacter[characterName] || {};
    const allBosses = [...weeklyBosses, ...dailyBosses, ...monthlyBosses];
    return allBosses.filter(b =>
      isBossEnabledForCharacter(characterName, b.name) &&
      !isBossTempDisabledForCharacter(characterName, b.name) &&
      bosses[b.name]
    ).length;
  };

  const toggleBossComplete = (characterName: string, bossName: string) => {
    // Check if this is a monthly boss
    const isMonthly = monthlyBosses.some(b => b.name === bossName);

    // Get current state
    const current = progressByCharacter[characterName] || {};
    const willBeChecked = !current[bossName];
    const currentCount = getWeeklyBossCount(characterName);

    // If we're trying to check any boss and it would exceed 14, prevent it
    if (willBeChecked && currentCount >= 14) {
      toast({
        title: 'Crystal Limit Reached',
        description: 'You cannot complete more than 14 weekly bosses. Please disable a boss first.',
        variant: 'destructive'
      });
      return;
    }

    // Update the boss completion
    setProgressByCharacter((prev) => ({
      ...prev,
      [characterName]: {
        ...current,
        [bossName]: willBeChecked,
      },
    }));
  };

  const isBossEnabledForCharacter = (characterName: string, bossName: string): boolean => {
    const enabled = enabledByCharacter[characterName] || {};
    const hasAny = Object.keys(enabled).length > 0;
    const meta = getBossMeta(bossName);
    return hasAny ? !!enabled[bossName] : (meta?.defaultEnabled ?? true);
  };

  const isBossTempDisabledForCharacter = (characterName: string, bossName: string): boolean => {
    const tempDisabled = tempDisabledByCharacter[characterName] || {};
    return !!tempDisabled[bossName];
  };

  const getCompletionStats = (characterName: string, bossList: BossInfo[], includeMonthlyChecked = false) => {
    const bosses = progressByCharacter[characterName] || {};
    let considered = bossList.filter(b => isBossEnabledForCharacter(characterName, b.name) && !isBossTempDisabledForCharacter(characterName, b.name));

    // For weekly stats, only include monthly bosses if they are checked
    if (!includeMonthlyChecked) {
      const isMonthly = (bossName: string) => monthlyBosses.some(b => b.name === bossName);
      considered = considered.filter(b => !isMonthly(b.name) || bosses[b.name]);
    }

    // Always limit to 14 bosses total (including monthly if checked)
    const currentCount = getWeeklyBossCount(characterName);
    if (currentCount >= 14) {
      // Sort by value (highest first) and take top 14
      considered = considered
        .sort((a, b) => {
          const aVal = Math.floor(a.value / getPartySize(characterName, a.name));
          const bVal = Math.floor(b.value / getPartySize(characterName, b.name));
          return bVal - aVal;
        })
        .slice(0, 14);
    }

    const completed = considered.filter(b => bosses[b.name]).length;
    const total = considered.length;
    return { completed, total, percentage: total ? Math.round((completed / total) * 100) : 0 };
  };

  const getCollectedValue = (characterName: string, bossList: BossInfo[]) => {
    const bosses = progressByCharacter[characterName] || {};
    const currentCount = getWeeklyBossCount(characterName);
    const character = roster.find(c => c.name === characterName);
    const worldMultiplier = getCharacterWorldMultiplier(character || {} as RosterCharacter);

    return bossList.reduce((sum, b) => {
      const isEnabled = isBossEnabledForCharacter(characterName, b.name);
      const isMonthly = monthlyBosses.some(mb => mb.name === b.name);
      const party = getPartySize(characterName, b.name);
      const share = Math.floor((b.value / party) * worldMultiplier);

      // If we're over the 14 boss limit, exclude monthly bosses from value calculations
      if (currentCount > 14 && isMonthly) {
        return sum;
      }

      return sum + (isEnabled && bosses[b.name] ? share : 0);
    }, 0);
  };
  
  const getMaxPossibleValue = (characterName: string, bossList: BossInfo[], includeMonthlyChecked = false) => {
    const bosses = progressByCharacter[characterName] || {};
    const currentCount = getWeeklyBossCount(characterName);
    const character = roster.find(c => c.name === characterName);
    const worldMultiplier = getCharacterWorldMultiplier(character || {} as RosterCharacter);

    let considered = bossList.filter(b => {
      const isEnabled = isBossEnabledForCharacter(characterName, b.name);
      const isTempDisabled = isBossTempDisabledForCharacter(characterName, b.name);
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
          const aVal = Math.floor((a.value / getPartySize(characterName, a.name)) * worldMultiplier);
          const bVal = Math.floor((b.value / getPartySize(characterName, b.name)) * worldMultiplier);
          return bVal - aVal;
        })
        .slice(0, 14);
    }

    return considered.reduce((sum, b) => {
      const party = getPartySize(characterName, b.name);
      const share = Math.floor((b.value / party) * worldMultiplier);
      return sum + share;
    }, 0);
  };

  // Filter characters based on completion status
  const getFilteredCharacters = (characters: RosterCharacter[], bossList: BossInfo[]): RosterCharacter[] => {
    switch (bossFilter) {
      case 'finished':
        return characters.filter(char => {
          const stats = getCompletionStats(char.name, bossList);
          return stats.percentage === 100 && stats.total > 0;
        });
      case 'unfinished':
        return characters.filter(char => {
          const stats = getCompletionStats(char.name, bossList);
          return stats.percentage < 100 || stats.total === 0;
        });
      case 'all':
      default:
        return characters;
    }
  };

  const openBossEditor = (characterName: string) => {
    // Navigate to Roster page and auto-open Edit Bosses dialog for this character
    navigate(`/?editBosses=${encodeURIComponent(characterName)}`);
  };
  const resetAllProgress = () => {
    const combined = [...weeklyBosses, ...dailyBosses, ...monthlyBosses];
    setProgressByCharacter((prev) => {
      const next: BossProgressByCharacter = {};
      Object.keys(prev).forEach((name) => {
        const bosses = prev[name] || {};
        const updated: CharacterBossProgress = { ...bosses };
        combined.forEach((b) => { updated[b.name] = false; });
        next[name] = updated;
      });
      return next;
    });

    // Clear temporary disabled bosses
    setTempDisabledByCharacter({});

    // Update last reset timestamps to prevent auto-reset conflicts
    setLastResetTimestamp(getMostRecentResetTimestamp());
    setLastMonthlyResetTimestamp(getMostRecentMonthlyResetTimestamp());

    toast({ title: 'Reset', description: 'All boss progress has been reset!', className: 'progress-complete' });
  };

  const getTimeUntilReset = useMemo(() => {
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
  }, []);

  // Party size editing functions
  const startEditingPartySize = (characterName: string, bossName: string) => {
    const currentSize = getPartySize(characterName, bossName);
    setPartySizeInput(currentSize.toString());
    setEditingPartySize({ characterName, bossName });
  };

  const savePartySize = () => {
    if (!editingPartySize) return;

    const { characterName, bossName } = editingPartySize;
    const newSize = parseInt(partySizeInput);
    const maxPartySize = getMaxPartySize(bossName);

    if (isNaN(newSize) || newSize < 1 || newSize > maxPartySize) {
      toast({
        title: 'Invalid Party Size',
        description: `Party size must be between 1 and ${maxPartySize} for ${bossName}.`,
        variant: 'destructive'
      });
      return;
    }

    setPartyByCharacter((prev) => ({
      ...prev,
      [characterName]: {
        ...prev[characterName],
        [bossName]: newSize,
      },
    }));

    setEditingPartySize(null);
    setPartySizeInput('');
  };

  const cancelPartySizeEdit = () => {
    setEditingPartySize(null);
    setPartySizeInput('');
  };

  const handlePartySizeKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      savePartySize();
    } else if (e.key === 'Escape') {
      cancelPartySizeEdit();
    }
  };



  return (
    <Layout>
      <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Boss Tracker
          </h1>
          <p className="text-muted-foreground mt-1">
            Track weekly and daily boss completions across all characters
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Button
            onClick={() => {
              // Load current character order for reordering (preserve current order)
              setReorderCharacters([...roster]);
              setShowReorderDialog(true);
            }}
            variant="outline"
            size="sm"
            className="text-muted-foreground hover:text-primary w-full sm:w-auto"
          >
            <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
            </svg>
            Reorder
          </Button>
          <Button
            onClick={() => resetAllProgress()}
            variant="outline"
            size="sm"
            className="text-muted-foreground hover:text-primary w-full sm:w-auto"
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset All
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="card-glow">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Calendar className="h-8 w-8 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Total meso collected:</p>
                <p className={`text-2xl font-bold ${(() => {
                  // Sum of each character's current Collected value (as shown in their individual cards)
                  const totalCollected = roster.reduce((acc, c) => {
                    return acc + getCollectedValue(c.name, [...weeklyBosses, ...dailyBosses, ...monthlyBosses]);
                  }, 0);
                  // Sum of each character's current Max Possible value (as shown in their individual cards)
                  const totalMax = roster.reduce((acc, c) => {
                    return acc + getMaxPossibleValue(c.name, [...weeklyBosses, ...dailyBosses, ...monthlyBosses]);
                  }, 0);
                  return totalCollected >= totalMax ? 'text-success' : '';
                })()}`}>{(() => {
                  // Sum of each character's current Collected value (as shown in their individual cards)
                  const totalCollected = roster.reduce((acc, c) => {
                    return acc + getCollectedValue(c.name, [...weeklyBosses, ...dailyBosses, ...monthlyBosses]);
                  }, 0);
                  return totalCollected.toLocaleString();
                })()}</p>
                <p className="text-sm text-muted-foreground mt-1">Max possible meso:</p>
                <p className="text-xl font-bold">{(() => {
                  // Sum of each character's current Max Possible value (as shown in their individual cards)
                  const totalMax = roster.reduce((acc, c) => {
                    return acc + getMaxPossibleValue(c.name, [...weeklyBosses, ...dailyBosses, ...monthlyBosses]);
                  }, 0);
                  return totalMax.toLocaleString();
                })()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-glow">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Trophy className="h-8 w-8 text-accent" />
              <div>
                <p className="text-sm text-muted-foreground">Weekly crystals remaining:</p>
                <p className={`text-2xl font-bold ${(() => {
                  // For crystals remaining, count ALL checked bosses (weekly + daily + monthly)
                  const allCheckedBosses = roster.reduce((acc, c) => {
                    const bosses = progressByCharacter[c.name] || {};
                    const checkedCount = [...weeklyBosses, ...dailyBosses, ...monthlyBosses]
                      .filter(b => isBossEnabledForCharacter(c.name, b.name) && bosses[b.name]).length;
                    return acc + checkedCount;
                  }, 0);
                  const remaining = Math.max(0, 180 - allCheckedBosses);
                  return remaining === 0 ? 'text-destructive' : '';
                })()}`}>{(() => {
                  // For crystals remaining, count ALL checked bosses (weekly + daily + monthly)
                  const allCheckedBosses = roster.reduce((acc, c) => {
                    const bosses = progressByCharacter[c.name] || {};
                    const checkedCount = [...weeklyBosses, ...dailyBosses, ...monthlyBosses]
                      .filter(b => isBossEnabledForCharacter(c.name, b.name) && bosses[b.name]).length;
                    return acc + checkedCount;
                  }, 0);
                  const remaining = Math.max(0, 180 - allCheckedBosses);
                  return `${remaining.toLocaleString()}`;
                })()}</p>
                <p className="text-sm text-muted-foreground mt-1">Weekly bosses available:</p>
                <p className={`text-xl font-bold ${(() => {
                  // For weekly bosses available, count available bosses per character (limited to 14 each)
                  const totalAvailable = roster.reduce((acc, c) => {
                    const weeklyDailyStats = getCompletionStats(c.name, [...weeklyBosses, ...dailyBosses]);
                    const monthlyChecked = monthlyBosses.filter(b =>
                      isBossEnabledForCharacter(c.name, b.name) &&
                      (progressByCharacter[c.name] || {})[b.name]
                    ).length;
                    // Each character can have max 14 bosses available
                    const characterTotal = Math.min(14, weeklyDailyStats.total + monthlyChecked);
                    return acc + characterTotal;
                  }, 0);
                  return totalAvailable > 180 ? 'text-destructive' : '';
                })()}`}>{(() => {
                  // For weekly bosses available, count available bosses per character (limited to 14 each)
                  const totalAvailable = roster.reduce((acc, c) => {
                    const weeklyDailyStats = getCompletionStats(c.name, [...weeklyBosses, ...dailyBosses]);
                    const monthlyChecked = monthlyBosses.filter(b =>
                      isBossEnabledForCharacter(c.name, b.name) &&
                      (progressByCharacter[c.name] || {})[b.name]
                    ).length;
                    // Each character can have max 14 bosses available
                    const characterTotal = Math.min(14, weeklyDailyStats.total + monthlyChecked);
                    return acc + characterTotal;
                  }, 0);
                  return `${totalAvailable.toLocaleString()} / 180`;
                })()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-glow">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Sword className="h-8 w-8 text-secondary" />
              <div>
                <p className="text-sm text-muted-foreground">Total characters done:</p>
                <p className={`text-2xl font-bold ${(() => {
                  const combined = [...weeklyBosses, ...dailyBosses, ...monthlyBosses];
                  const done = roster.filter(r => {
                    const stats = getCompletionStats(r.name, combined);
                    return stats.completed === stats.total;
                  }).length;
                  const total = roster.length;
                  return done === total && total > 0 ? 'text-success' : '';
                })()}`}>{(() => {
                  const combined = [...weeklyBosses, ...dailyBosses, ...monthlyBosses];
                  const done = roster.filter(r => {
                    const stats = getCompletionStats(r.name, combined);
                    return stats.completed === stats.total;
                  }).length;
                  const total = roster.length;
                  return `${done} / ${total}`;
                })()}</p>
                <p className="text-sm text-muted-foreground mt-1">Weekly reset:</p>
                <p className="text-xl font-bold">{getTimeUntilReset}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        {/* Filter Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Filter characters:</span>
            <ToggleGroup type="single" value={bossFilter} onValueChange={(value) => setBossFilter(value as FilterType || 'all')}>
              <ToggleGroupItem value="all" size="sm">All</ToggleGroupItem>
              <ToggleGroupItem value="finished" size="sm">Finished</ToggleGroupItem>
              <ToggleGroupItem value="unfinished" size="sm">Unfinished</ToggleGroupItem>
            </ToggleGroup>
          </div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
          {(() => {
            // Show loading state while order is loading
            if (isLoadingOrder) {
              return Array.from({ length: 6 }, (_, i) => (
                <Card key={i} className="card-gaming">
                  <CardHeader className="pb-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-muted rounded animate-pulse" />
                      <div className="min-w-0 flex-1">
                        <div className="h-4 bg-muted rounded animate-pulse mb-2" />
                        <div className="h-3 bg-muted rounded animate-pulse w-3/4" />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-2">
                      {Array.from({ length: 3 }, (_, j) => (
                        <div key={j} className="h-8 bg-muted rounded animate-pulse" />
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ));
            }

            if (roster.length === 0) {
              return (
                <Card className="card-gaming">
                  <CardContent className="pt-6">Add characters in Roster to start tracking.</CardContent>
                </Card>
              );
            }

            const bosses = [...weeklyBosses, ...dailyBosses, ...monthlyBosses];
            const filtered = getFilteredCharacters(roster, bosses);

            return filtered.map((c) => {
            const stats = getCompletionStats(c.name, bosses);
            const visibleBosses = bosses.filter((b) => isBossEnabledForCharacter(c.name, b.name));
            // For check all button state, only consider weekly/daily bosses since monthly are excluded from check all
            const weeklyDailyBosses = visibleBosses.filter(b => !monthlyBosses.some(mb => mb.name === b.name));
            const allChecked = weeklyDailyBosses.length > 0 && weeklyDailyBosses.every(b => (progressByCharacter[c.name] || {})[b.name]);

            
            return (
              <div key={c.id} className="space-y-3">
                <CharacterCard
                  character={c}
                  variant="boss-tracker"
                  completionStats={stats}
                  allBossesChecked={allChecked}
                  onToggleAllBosses={(characterName, checkAll) => {
                    setProgressByCharacter((prev) => {
                      const current = prev[characterName] || {};
                      const updated: CharacterBossProgress = { ...current };
                      // Only toggle weekly and daily bosses, exclude monthly bosses
                      const weeklyDailyBosses = visibleBosses.filter(b =>
                        !monthlyBosses.some(mb => mb.name === b.name)
                      );
                      weeklyDailyBosses.forEach(b => { updated[b.name] = checkAll; });
                      return { ...prev, [characterName]: updated };
                    });
                  }}
                  onEditBosses={(characterName) => openBossEditor(characterName)}
                />
                
                {/* Boss list content below the card */}
                <Card className="card-gaming">
                  
                  <CardContent className="p-3">
                    <div className="overflow-x-hidden">
                      {/* Desktop Table */}
                      <div className="hidden sm:block">
                        <Table className="w-full table-fixed text-sm leading-tight">
                          <TableHeader>
                            <TableRow>
                              <TableHead className="w-6 p-0.5"></TableHead>
                              <TableHead className="p-0.5">Boss</TableHead>
                              <TableHead className="w-10 md:w-14 text-center p-0.5">Party</TableHead>
                              <TableHead className="w-24 md:w-28 text-right p-0.5">Value</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                          {[...visibleBosses]
                          .sort((a, b) => {
                            const aVal = Math.floor(a.value / getPartySize(c.name, a.name));
                            const bVal = Math.floor(b.value / getPartySize(c.name, b.name));
                            return bVal - aVal || a.name.localeCompare(b.name); // tie-break by name
                          })
                              .map((b) => {
                              const meta = getBossMeta(b.name);
                              return (
                                <TableRow
                                  key={b.name}
                                  className={`hover:bg-muted/50 h-7 cursor-pointer ${isBossTempDisabledForCharacter(c.name, b.name) ? 'opacity-50' : ''}`}
                                  onClick={() => !isBossTempDisabledForCharacter(c.name, b.name) && toggleBossComplete(c.name, b.name)}
                                >
                                  <TableCell className="p-0">
                                    <div onClick={(e) => e.stopPropagation()}>
                                      <Checkbox
                                        checked={(progressByCharacter[c.name] || {})[b.name] || false}
                                        disabled={isBossTempDisabledForCharacter(c.name, b.name) || (getWeeklyBossCount(c.name) >= 14 && !(progressByCharacter[c.name] || {})[b.name])}
                                        onCheckedChange={() => toggleBossComplete(c.name, b.name)}
                                        className="h-4 w-4 data-[state=checked]:bg-success data-[state=checked]:border-success"
                                      />
                                    </div>
                                  </TableCell>
                                  <TableCell className="font-medium text-primary p-0">
                                    <div className="flex items-center gap-1 min-w-0">
                                      {SHOW_BOSS_ICONS && meta?.imageUrl && (
                                        <img
                                          src={meta.imageUrl}
                                          alt={b.name}
                                          className={`h-5 w-5 rounded-sm ${isBossTempDisabledForCharacter(c.name, b.name) ? 'grayscale' : ''}`}
                                          loading="lazy"
                                          referrerPolicy="no-referrer"
                                          onError={(e) => {
                                            const img = e.currentTarget as HTMLImageElement;
                                            if (img.src !== window.location.origin + '/placeholder.svg') {
                                              img.src = '/placeholder.svg';
                                            }
                                          }}
                                        />
                                      )}
                                      <span className={`truncate whitespace-nowrap max-w-[120px] md:max-w-[170px] text-sm ${isBossTempDisabledForCharacter(c.name, b.name) ? 'text-muted-foreground' : ''}`}>{b.name}</span>
                                    </div>
                                  </TableCell>
                                  <TableCell className={`text-center p-0 text-sm ${isBossTempDisabledForCharacter(c.name, b.name) ? 'text-muted-foreground' : ''}`}>
                                    <div onClick={(e) => e.stopPropagation()}>
                                      {editingPartySize?.characterName === c.name && editingPartySize?.bossName === b.name ? (
                                        <input
                                          id={`party-size-${c.name}-${b.name}`}
                                          name={`party-size-${c.name}-${b.name}`}
                                          type="number"
                                          value={partySizeInput}
                                          onChange={(e) => setPartySizeInput(e.target.value)}
                                          onKeyDown={handlePartySizeKeyDown}
                                          onBlur={savePartySize}
                                          className="w-8 h-6 text-center text-xs border rounded bg-background focus:outline-none focus:ring-1 focus:ring-primary"
                                          min="1"
                                          max={getMaxPartySize(b.name)}
                                          autoFocus
                                        />
                                      ) : (
                                        <button
                                          onClick={() => startEditingPartySize(c.name, b.name)}
                                          className="hover:bg-muted/50 px-1 py-0.5 rounded text-xs transition-colors"
                                          disabled={isBossTempDisabledForCharacter(c.name, b.name)}
                                        >
                                          {getPartySize(c.name, b.name)}
                                        </button>
                                      )}
                                    </div>
                                  </TableCell>
                                  <TableCell className={`text-right font-mono p-0 text-sm ${isBossTempDisabledForCharacter(c.name, b.name) ? 'text-muted-foreground' : ''}`}>{formatMesos(Math.floor((b.value / getPartySize(c.name, b.name)) * getCharacterWorldMultiplier(c)))}</TableCell>
                                </TableRow>
                              );
                            })}
                            <TableRow className="hover:bg-muted/50 border-b-0 h-7">
                              <TableCell colSpan={2} className="text-right text-muted-foreground p-0 text-sm">Collected</TableCell>
                              <TableCell colSpan={2} className="text-right font-mono text-accent p-0 text-sm">{formatMesos(getCollectedValue(c.name, [...weeklyBosses, ...dailyBosses, ...monthlyBosses]))}</TableCell>
                            </TableRow>
                            <TableRow className="hover:bg-muted/50 border-b-0 h-7">
                              <TableCell colSpan={2} className="text-right text-muted-foreground p-0 text-sm">Max Possible</TableCell>
                              <TableCell colSpan={2} className="text-right font-mono p-0 text-sm">{formatMesos(getMaxPossibleValue(c.name, [...weeklyBosses, ...dailyBosses, ...monthlyBosses]))}</TableCell>
                            </TableRow>
                          </TableBody>
                        </Table>
                      </div>
                          
                      {/* Mobile Cards */}
                      <div className="sm:hidden space-y-2">
                        {[...visibleBosses]
                          .sort((a, b) => {
                            const aVal = Math.floor(a.value / getPartySize(c.name, a.name));
                            const bVal = Math.floor(b.value / getPartySize(c.name, b.name));
                            return bVal - aVal || a.name.localeCompare(b.name); // tie-break by name
                          })
                          .map((b) => {
                          const meta = getBossMeta(b.name);
                          return (
                            <div
                              key={b.name}
                              className={`flex items-center justify-between p-2 border rounded hover:bg-muted/50 cursor-pointer ${isBossTempDisabledForCharacter(c.name, b.name) ? 'opacity-50' : ''}`}
                              onClick={() => !isBossTempDisabledForCharacter(c.name, b.name) && toggleBossComplete(c.name, b.name)}
                            >
                              <div className="flex items-center gap-2 flex-1 min-w-0">
                                <div onClick={(e) => e.stopPropagation()}>
                                  <Checkbox
                                    checked={(progressByCharacter[c.name] || {})[b.name] || false}
                                    disabled={isBossTempDisabledForCharacter(c.name, b.name) || (getWeeklyBossCount(c.name) >= 14 && !(progressByCharacter[c.name] || {})[b.name])}
                                    onCheckedChange={() => toggleBossComplete(c.name, b.name)}
                                    className="h-4 w-4 data-[state=checked]:bg-success data-[state=checked]:border-success"
                                  />
                                </div>

                                <div className="flex items-center gap-1 min-w-0 flex-1">
                                  {SHOW_BOSS_ICONS && meta?.imageUrl && (
                                    <img
                                      src={meta.imageUrl}
                                      alt={b.name}
                                      className={`h-4 w-4 rounded-sm flex-shrink-0 ${isBossTempDisabledForCharacter(c.name, b.name) ? 'grayscale' : ''}`}
                                      loading="lazy"
                                      referrerPolicy="no-referrer"
                                      onError={(e) => {
                                        const img = e.currentTarget as HTMLImageElement;
                                        if (img.src !== window.location.origin + '/placeholder.svg') {
                                          img.src = '/placeholder.svg';
                                        }
                                      }}
                                    />
                                  )}
                                  <span className={`truncate whitespace-nowrap text-sm ${isBossTempDisabledForCharacter(c.name, b.name) ? 'text-muted-foreground' : ''}`}>{b.name}</span>
                                </div>
                              </div>
                              <div className={`text-right text-xs ${isBossTempDisabledForCharacter(c.name, b.name) ? 'text-muted-foreground' : ''}`}>
                                <div className="flex flex-col items-end gap-1">
                                  <span className="text-xs">Party:</span>
                                  <div onClick={(e) => e.stopPropagation()}>
                                    {editingPartySize?.characterName === c.name && editingPartySize?.bossName === b.name ? (
                                      <input
                                        id={`party-size-mobile-${c.name}-${b.name}`}
                                        name={`party-size-mobile-${c.name}-${b.name}`}
                                        type="number"
                                        value={partySizeInput}
                                        onChange={(e) => setPartySizeInput(e.target.value)}
                                        onKeyDown={handlePartySizeKeyDown}
                                        onBlur={savePartySize}
                                        className="w-6 h-4 text-center text-xs border rounded bg-background focus:outline-none focus:ring-1 focus:ring-primary"
                                        min="1"
                                        max={getMaxPartySize(b.name)}
                                        autoFocus
                                      />
                                    ) : (
                                      <button
                                        onClick={() => startEditingPartySize(c.name, b.name)}
                                        className="hover:bg-muted/50 px-1 rounded text-xs transition-colors"
                                        disabled={isBossTempDisabledForCharacter(c.name, b.name)}
                                      >
                                        {getPartySize(c.name, b.name)}
                                      </button>
                                    )}
                                  </div>
                                </div>
                                <div className="font-mono">{formatMesos(Math.floor((b.value / getPartySize(c.name, b.name)) * getCharacterWorldMultiplier(c)))}</div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            );
          });
        })()}
        </div>
      </div>

      {/* Reorder Characters Dialog */}
      <Dialog open={showReorderDialog} onOpenChange={setShowReorderDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Reorder Characters</DialogTitle>
            <p className="text-sm text-muted-foreground">
              Use the up/down buttons to change the order of characters in the Boss Tracker
            </p>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2 max-h-96 overflow-y-auto scrollbar-hide">
              {reorderCharacters.map((character, index) => (
                <div
                  key={character.id}
                  className="flex items-center gap-3 p-3 border rounded-lg bg-card"
                >
                  <div className="flex items-center gap-2 flex-1">
                    <img
                      src={character.avatarUrl || '/placeholder.svg'}
                      alt={character.name}
                      className="w-8 h-8 rounded object-cover"
                      onError={(e) => {
                        const img = e.currentTarget as HTMLImageElement;
                        img.src = '/placeholder.svg';
                      }}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium truncate">{character.name}</span>
                        {character.isMain && <Star className="h-3 w-3 text-amber-400 flex-shrink-0" />}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Lv. {character.level} • {character.class}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-sm text-muted-foreground w-8 text-center">#{index + 1}</span>
                    <div className="flex flex-col gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={() => {
                          if (index > 0) {
                            const newOrder = [...reorderCharacters];
                            [newOrder[index], newOrder[index - 1]] = [newOrder[index - 1], newOrder[index]];
                            setReorderCharacters(newOrder);
                          }
                        }}
                        disabled={index === 0}
                      >
                        <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                        </svg>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={() => {
                          if (index < reorderCharacters.length - 1) {
                            const newOrder = [...reorderCharacters];
                            [newOrder[index], newOrder[index + 1]] = [newOrder[index + 1], newOrder[index]];
                            setReorderCharacters(newOrder);
                          }
                        }}
                        disabled={index === reorderCharacters.length - 1}
                      >
                        <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => {
                  setShowReorderDialog(false);
                  setReorderCharacters([]);
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  // Save the new order to localStorage with a unique key for BossTracker
                  const characterOrder = reorderCharacters.map(c => c.id);
                  localStorage.setItem('maplehub_bosstracker_character_order', JSON.stringify(characterOrder));

                  // Update the roster state to reflect the new order
                  const orderedRoster = reorderCharacters.map(char => {
                    const original = roster.find(c => c.id === char.id);
                    return original || char;
                  });
                  setRoster(orderedRoster);

                  setShowReorderDialog(false);
                  setReorderCharacters([]);

                  toast({
                    title: "Order Updated",
                    description: "Character order has been saved for Boss Tracker",
                    className: "progress-complete",
                    duration: 4000
                  });
                }}
                className="btn-hero"
              >
                Save Order
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      </div>
    </Layout>
  );
};

export default BossTracker;
