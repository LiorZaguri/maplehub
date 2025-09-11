import { SkillType } from '../types';

// Sol Erda cost table based on the provided data
export const SOL_ERDA_COST_ARRAYS: Record<SkillType, number[]> = {
  'Origin': [5, 1, 1, 1, 2, 2, 2, 3, 3, 10, 3, 3, 4, 4, 4, 4, 4, 4, 5, 15, 5, 5, 5, 5, 5, 6, 6, 6, 7, 20],
  'Mastery': [3, 1, 1, 1, 1, 1, 1, 2, 2, 5, 2, 2, 2, 2, 2, 2, 2, 2, 3, 8, 3, 3, 3, 3, 3, 3, 3, 3, 4, 10],
  'Boost': [4, 1, 1, 1, 2, 2, 2, 3, 3, 8, 3, 3, 3, 3, 3, 3, 3, 3, 4, 12, 4, 4, 4, 4, 4, 5, 5, 5, 6, 15],
  'Common': [7, 2, 2, 2, 3, 3, 3, 5, 5, 14, 5, 5, 6, 6, 6, 6, 6, 6, 7, 17, 7, 7, 7, 7, 7, 9, 9, 9, 10, 20],
  'Hexa Stat': [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
};

// Cost tables based on the working calculator logic
// These are the actual cost arrays from the working calculator
export const FRAGMENT_COST_ARRAYS: Record<SkillType, number[]> = {
  'Origin': [
    100, 30, 35, 40, 45, 50, 55, 60, 65, 200, 80, 90, 100, 110, 120, 130, 140,
    150, 160, 350, 170, 180, 190, 200, 210, 220, 230, 240, 250, 500
  ],
  'Mastery': [
    50, 15, 18, 20, 23, 25, 28, 30, 33, 100, 40, 45, 50, 55, 60, 65, 70, 75,
    80, 175, 85, 90, 95, 100, 105, 110, 115, 120, 125, 250
  ],
  'Boost': [
    75, 23, 27, 30, 34, 38, 42, 45, 49, 150, 60, 68, 75, 83, 90, 98, 105, 113,
    120, 263, 128, 135, 143, 150, 158, 165, 173, 180, 188, 375
  ],
  'Common': [
    125, 38, 44, 50, 57, 63, 69, 75, 82, 300, 110, 124, 138, 152, 165, 179,
    193, 207, 220, 525, 234, 248, 262, 275, 289, 303, 317, 330, 344, 750
  ],
  'Hexa Stat': [
    600, 700, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0
  ]
};

// Calculate cumulative cost up to a specific level (matching working calculator logic)
export const getCumulativeCost = (skillType: SkillType, level: number): number => {
  const costArray = FRAGMENT_COST_ARRAYS[skillType];
  if (level <= 0) return 0;
  if (level > costArray.length) return 0;
  
  return costArray.slice(0, level).reduce((a, b) => a + b, 0);
};

// Calculate cumulative Sol Erda cost up to a specific level
export const getCumulativeSolErdaCost = (skillType: SkillType, level: number): number => {
  const costArray = SOL_ERDA_COST_ARRAYS[skillType];
  if (level <= 0) return 0;
  if (level > costArray.length) return 0;
  
  return costArray.slice(0, level).reduce((a, b) => a + b, 0);
};

// Calculate cost for a specific level upgrade (fragments and Sol Erda)
export const getLevelCost = (skillType: SkillType, level: number): { solErda: number; fragments: number } => {
  const fragmentCostArray = FRAGMENT_COST_ARRAYS[skillType];
  const solErdaCostArray = SOL_ERDA_COST_ARRAYS[skillType];
  
  const fragmentCost = fragmentCostArray[level - 1] || 0; // Array is 0-indexed, level is 1-indexed
  const solErdaCost = solErdaCostArray[level - 1] || 0;
  
  return { solErda: solErdaCost, fragments: fragmentCost };
};

// Calculate total cost from current level to target level (fragments and Sol Erda)
export const getTotalCost = (skillType: SkillType, currentLevel: number, targetLevel: number): { solErda: number; fragments: number } => {
  if (currentLevel >= targetLevel) {
    return { solErda: 0, fragments: 0 };
  }

  const currentFragmentCost = getCumulativeCost(skillType, currentLevel);
  const targetFragmentCost = getCumulativeCost(skillType, targetLevel);
  
  const currentSolErdaCost = getCumulativeSolErdaCost(skillType, currentLevel);
  const targetSolErdaCost = getCumulativeSolErdaCost(skillType, targetLevel);
  
  return { 
    solErda: targetSolErdaCost - currentSolErdaCost, 
    fragments: targetFragmentCost - currentFragmentCost 
  };
};

// Calculate total cost for all levels (0 to max)
export const getTotalCostToMax = (skillType: SkillType, maxLevel: number): { solErda: number; fragments: number } => {
  return { 
    solErda: getCumulativeSolErdaCost(skillType, maxLevel), 
    fragments: getCumulativeCost(skillType, maxLevel) 
  };
};

// Get cost for next level upgrade
export const getNextLevelCost = (skillType: SkillType, currentLevel: number): { solErda: number; fragments: number } => {
  if (currentLevel >= 30) {
    return { solErda: 0, fragments: 0 };
  }
  
  return getLevelCost(skillType, currentLevel + 1);
};
