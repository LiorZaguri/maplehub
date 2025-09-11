import { Character as RosterCharacter } from '@/features/roster/types/roster';
import { FragmentCharacter } from '../types';

export const mapRosterToFragmentCharacter = (rosterCharacter: RosterCharacter): FragmentCharacter => {
  return {
    ...rosterCharacter,
    hexaSkills: [],
    progression: {
      solErdaSpent: 0,
      solErdaTotal: 0,
      fragmentsSpent: 0,
      fragmentsTotal: 0,
      completionPercentage: 0,
    },
    dailyRate: {
      fragments: 0,
      waps: 0,
      dailies: 0,
      weeklies: 0,
    },
    estimatedCompletionDays: 0,
    fragmentProgress: 0, // Default fragment progress
    jobName: rosterCharacter.class, // Use class as jobName
  };
};

export const mapRosterToFragmentCharacters = (rosterCharacters: RosterCharacter[]): FragmentCharacter[] => {
  return rosterCharacters.map(mapRosterToFragmentCharacter);
};
