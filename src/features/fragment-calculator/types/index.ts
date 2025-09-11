import { Character as RosterCharacter } from '@/features/roster/types/roster';

export type SkillType = 'Origin' | 'Mastery' | 'Boost' | 'Hexa Stat' | 'Common';

export interface HEXASkill {
  id: string;
  name: string;
  icon: string;
  currentLevel: number;
  targetLevel: number;
  skillType: SkillType;
  maxLevel: number;
  isComplete: boolean;
  costs?: {
    solErda: number;
    fragments: number;
  };
}

// User data that should be persisted in localStorage
export interface HEXASkillUserData {
  id: string; // Used to match with the skill
  currentLevel: number;
  targetLevel: number;
  isComplete: boolean;
}

export interface HEXAProgression {
  solErdaSpent: number;
  solErdaTotal: number;
  fragmentsSpent: number;
  fragmentsTotal: number;
  completionPercentage: number;
}

export interface FragmentCharacter extends RosterCharacter {
  hexaSkills: HEXASkill[];
  progression: HEXAProgression;
  nextUpgrade?: HEXASkill;
  dailyRate: {
    fragments: number;
    waps: number;
    dailies: number;
    weeklies: number;
  };
  estimatedCompletionDays: number;
  fragmentProgress?: number; // Keep for backward compatibility
  jobName: string; // The actual job name for HEXA skill mapping
}

export interface FragmentCalculatorState {
  selectedCharacters: FragmentCharacter[];
  activeCharacter: FragmentCharacter | null;
  isCharacterSheetOpen: boolean;
  viewMode: 'compact' | 'rich';
  isCalculating: boolean;
}

export interface FragmentCalculatorActions {
  handleCharacterSelect: (character: FragmentCharacter) => void;
  handleCharacterRemove: (characterId: string) => void;
  handleCharacterClick: (character: FragmentCharacter) => void;
  setIsCharacterSheetOpen: (open: boolean) => void;
  setViewMode: (mode: 'compact' | 'rich') => void;
  updateSkillLevel: (characterId: string, skillId: string, level: number, type: 'current' | 'target') => void;
  updateSkillType: (characterId: string, skillId: string, type: SkillType) => void;
  calculateProgress: (characterId: string) => void;
  resetCharacter: (characterId: string) => void;
  maxAllSkills: (characterId: string) => void;
}

export interface FragmentCalculatorHookReturn extends FragmentCalculatorState, FragmentCalculatorActions {
  // Additional properties can be added here
}
