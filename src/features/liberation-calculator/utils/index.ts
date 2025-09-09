// Liberation Calculator - Design Skeleton Only
// All calculations and functionality removed for clean UI skeleton

import { LiberationCharacter } from '../types';
import { Character as RosterCharacter } from '@/features/roster/types/roster';

// Re-export new utility functions
export * from './points';
export * from './date';

export const getTodayDateString = (): string => {
  const today = new Date();
  return today.toISOString().split('T')[0];
};

export const createInitialBossSelections = () => {
  // Return boss selection data matching the image
  return [
    {
      bossName: 'Lotus',
      difficulty: 'hard',
      partySize: 1,
      weeklyShare: 50,
      isClearing: true,
    },
    {
      bossName: 'Damien',
      difficulty: 'hard', 
      partySize: 1,
      weeklyShare: 50,
      isClearing: true,
    },
    {
      bossName: 'Lucid',
      difficulty: 'hard',
      partySize: 1,
      weeklyShare: 65,
      isClearing: true,
    },
    {
      bossName: 'Will',
      difficulty: 'hard',
      partySize: 1,
      weeklyShare: 75,
      isClearing: true,
    },
    {
      bossName: 'Gloom',
      difficulty: 'chaos',
      partySize: 1,
      weeklyShare: 65,
      isClearing: true,
    },
    {
      bossName: 'Verus Hilla',
      difficulty: 'extreme',
      partySize: 2,
      weeklyShare: 45,
      isClearing: true,
    },
    {
      bossName: 'Darknell',
      difficulty: 'hard',
      partySize: 2,
      weeklyShare: 37,
      isClearing: true,
    }
  ];
};


export const generateMockLiberationData = () => {
  // Generate mock liberation data for skeleton
  return {
    completionRate: Math.floor(Math.random() * 100),
    tracesCollected: Math.floor(Math.random() * 6500),
    bossProgress: Math.floor(Math.random() * 100),
    daysRemaining: Math.floor(Math.random() * 365),
  };
};

export const mapRosterToLiberationCharacter = (
  rosterChar: RosterCharacter,
  liberationData: ReturnType<typeof generateMockLiberationData>
): LiberationCharacter => {
  return {
    // Base Character properties
    id: rosterChar.id,
    name: rosterChar.name,
    class: rosterChar.class,
    level: rosterChar.level,
    exp: rosterChar.exp,
    reboot: rosterChar.reboot,
    lastUpdated: rosterChar.lastUpdated,
    avatarUrl: rosterChar.avatarUrl,
    isMain: rosterChar.isMain,
    legionLevel: rosterChar.legionLevel,
    raidPower: rosterChar.raidPower,
    region: rosterChar.region,
    worldName: rosterChar.worldName,
    additionalData: rosterChar.additionalData,
    // Liberation-specific properties
    completionRate: liberationData.completionRate,
    tracesCollected: liberationData.tracesCollected,
    bossProgress: liberationData.bossProgress,
    daysRemaining: liberationData.daysRemaining,
  };
};

// All debug console.log statements and test functions have been removed to prevent console spam
