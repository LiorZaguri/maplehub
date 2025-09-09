import { Character } from '@/features/roster/types/roster';
import { BossClear, LiberationType } from '../types/liberation';
import { LIBERATION_REQUIREMENTS } from '../constants/liberationData';

/**
 * Filters characters to only show those level 255 and above
 */
export const getEligibleCharacters = (characters: Character[]): Character[] => {
  return characters.filter(character => character.level >= 255);
};

/**
 * Creates default boss clear configurations for a new character
 */
export const createDefaultBossClears = (liberationType: LiberationType): BossClear[] => {
  return [
    // Lotus - Normal difficulty, 6 players
    {
      bossId: 'lotus',
      difficulty: 'normal' as const,
      clearedThisWeek: true,
      partySize: 6
    },
    // Damien - Normal difficulty, 6 players
    {
      bossId: 'damien',
      difficulty: 'normal' as const,
      clearedThisWeek: true,
      partySize: 6
    },
    // Lucid - Easy difficulty, 6 players
    {
      bossId: 'lucid',
      difficulty: 'easy' as const,
      clearedThisWeek: true,
      partySize: 6
    }
  ];
};

/**
 * Validates if a character meets the liberation requirements
 */
export const validateCharacterForLiberation = (character: Character): boolean => {
  return character.level >= 255;
};

/**
 * Gets the first quest for the specified liberation type
 */
export const getFirstQuestForLiberationType = (liberationType: LiberationType): string => {
  return LIBERATION_REQUIREMENTS[liberationType].quests[0];
};
