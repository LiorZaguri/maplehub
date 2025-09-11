import { HEXASkill, SkillType } from '../types';
import { getTotalCost } from './costTables';
import { 
  getClassLevelingOrder, 
  getSkillPriorityInClass, 
  isOptimalStoppingPointForClass,
  getNextOptimalLevelForClass 
} from './classLevelingOrders';

// Class-specific leveling order based on optimal progression
// This follows the exact order from tempOrder file
// Format: { skillType, targetLevel, skillName? } where targetLevel is the goal to work towards
export const CLASS_LEVELING_ORDER = [
  { skillType: 'Origin', targetLevel: 1 },
  { skillType: 'Mastery', targetLevel: 1, skillName: 'M3' },
  { skillType: 'Mastery', targetLevel: 1, skillName: 'M2' },
  { skillType: 'Mastery', targetLevel: 1, skillName: 'M1' },
  { skillType: 'Mastery', targetLevel: 3, skillName: 'M2' }, // Will level M2 to 2, then 3
  { skillType: 'Mastery', targetLevel: 2, skillName: 'M1' },
  { skillType: 'Mastery', targetLevel: 1, skillName: 'M4' },
  { skillType: 'Mastery', targetLevel: 4, skillName: 'M2' }, // Will level M2 to 4
  { skillType: 'Mastery', targetLevel: 2, skillName: 'M3' },
  { skillType: 'Mastery', targetLevel: 3, skillName: 'M1' },
  { skillType: 'Mastery', targetLevel: 5, skillName: 'M2' },
  { skillType: 'Boost', targetLevel: 1, skillName: 'Boost1' },
  { skillType: 'Boost', targetLevel: 1, skillName: 'Boost4' },
  { skillType: 'Mastery', targetLevel: 6, skillName: 'M2' },
  { skillType: 'Mastery', targetLevel: 4, skillName: 'M1' },
  { skillType: 'Mastery', targetLevel: 3, skillName: 'M3' },
  { skillType: 'Mastery', targetLevel: 7, skillName: 'M2' },
  { skillType: 'Mastery', targetLevel: 5, skillName: 'M1' },
  { skillType: 'Mastery', targetLevel: 4, skillName: 'M3' },
  { skillType: 'Mastery', targetLevel: 8, skillName: 'M2' },
  { skillType: 'Mastery', targetLevel: 6, skillName: 'M1' },
  { skillType: 'Mastery', targetLevel: 9, skillName: 'M2' },
  { skillType: 'Hexa Stat', targetLevel: 1 },
  { skillType: 'Mastery', targetLevel: 5, skillName: 'M3' },
  { skillType: 'Mastery', targetLevel: 2, skillName: 'M4' },
  { skillType: 'Mastery', targetLevel: 7, skillName: 'M1' },
  { skillType: 'Mastery', targetLevel: 6, skillName: 'M3' },
  { skillType: 'Mastery', targetLevel: 8, skillName: 'M1' },
  { skillType: 'Mastery', targetLevel: 3, skillName: 'M4' },
  { skillType: 'Mastery', targetLevel: 7, skillName: 'M3' },
  { skillType: 'Mastery', targetLevel: 9, skillName: 'M1' },
  { skillType: 'Mastery', targetLevel: 8, skillName: 'M3' },
  { skillType: 'Boost', targetLevel: 1, skillName: 'Boost3' },
  { skillType: 'Mastery', targetLevel: 4, skillName: 'M4' },
  { skillType: 'Mastery', targetLevel: 9, skillName: 'M3' },
  { skillType: 'Mastery', targetLevel: 6, skillName: 'M4' }, // Will level M4 to 5, then 6
  { skillType: 'Boost', targetLevel: 1, skillName: 'Boost2' },
  { skillType: 'Mastery', targetLevel: 15, skillName: 'M2' }, // Will level M2 from 10 to 15
  { skillType: 'Mastery', targetLevel: 7, skillName: 'M4' },
  { skillType: 'Mastery', targetLevel: 17, skillName: 'M2' },
  { skillType: 'Mastery', targetLevel: 8, skillName: 'M4' },
  { skillType: 'Mastery', targetLevel: 10, skillName: 'M1' },
  { skillType: 'Mastery', targetLevel: 11, skillName: 'M1' },
  { skillType: 'Mastery', targetLevel: 12, skillName: 'M1' },
  { skillType: 'Mastery', targetLevel: 13, skillName: 'M1' },
  { skillType: 'Mastery', targetLevel: 14, skillName: 'M1' },
  { skillType: 'Mastery', targetLevel: 9, skillName: 'M4' },
  { skillType: 'Mastery', targetLevel: 18, skillName: 'M2' },
  { skillType: 'Mastery', targetLevel: 15, skillName: 'M1' },
  { skillType: 'Boost', targetLevel: 2, skillName: 'Boost1' },
  { skillType: 'Mastery', targetLevel: 19, skillName: 'M2' },
  { skillType: 'Boost', targetLevel: 2, skillName: 'Boost4' },
  { skillType: 'Mastery', targetLevel: 16, skillName: 'M1' },
  { skillType: 'Hexa Stat', targetLevel: 2 },
  { skillType: 'Mastery', targetLevel: 15, skillName: 'M3' }, // Will level M3 from 10 to 15
  { skillType: 'Mastery', targetLevel: 17, skillName: 'M1' },
  { skillType: 'Boost', targetLevel: 3, skillName: 'Boost1' },
  { skillType: 'Mastery', targetLevel: 18, skillName: 'M1' },
  { skillType: 'Mastery', targetLevel: 16, skillName: 'M3' },
  { skillType: 'Boost', targetLevel: 3, skillName: 'Boost4' },
  { skillType: 'Mastery', targetLevel: 19, skillName: 'M1' },
  { skillType: 'Mastery', targetLevel: 17, skillName: 'M3' },
  { skillType: 'Boost', targetLevel: 4, skillName: 'Boost1' },
  { skillType: 'Boost', targetLevel: 4, skillName: 'Boost4' },
  { skillType: 'Mastery', targetLevel: 25, skillName: 'M2' }, // Will level M2 from 20 to 25
  { skillType: 'Mastery', targetLevel: 18, skillName: 'M3' },
  { skillType: 'Mastery', targetLevel: 26, skillName: 'M2' },
  { skillType: 'Boost', targetLevel: 10, skillName: 'Boost1' }, // Will level Boost1 from 5 to 10
  { skillType: 'Boost', targetLevel: 10, skillName: 'Boost4' },
  { skillType: 'Mastery', targetLevel: 27, skillName: 'M2' },
  { skillType: 'Mastery', targetLevel: 19, skillName: 'M3' },
  { skillType: 'Mastery', targetLevel: 28, skillName: 'M2' },
  { skillType: 'Mastery', targetLevel: 29, skillName: 'M2' },
  { skillType: 'Mastery', targetLevel: 15, skillName: 'M4' }, // Will level M4 from 10 to 15
  { skillType: 'Mastery', targetLevel: 25, skillName: 'M1' }, // Will level M1 from 20 to 25
  { skillType: 'Mastery', targetLevel: 16, skillName: 'M4' },
  { skillType: 'Boost', targetLevel: 2, skillName: 'Boost3' },
  { skillType: 'Mastery', targetLevel: 28, skillName: 'M1' },
  { skillType: 'Mastery', targetLevel: 29, skillName: 'M1' },
  { skillType: 'Mastery', targetLevel: 17, skillName: 'M4' },
  { skillType: 'Mastery', targetLevel: 25, skillName: 'M3' }, // Will level M3 from 20 to 25
  { skillType: 'Mastery', targetLevel: 18, skillName: 'M4' },
  { skillType: 'Boost', targetLevel: 3, skillName: 'Boost3' },
  { skillType: 'Mastery', targetLevel: 28, skillName: 'M3' },
  { skillType: 'Mastery', targetLevel: 29, skillName: 'M3' },
  { skillType: 'Origin', targetLevel: 2 },
  { skillType: 'Origin', targetLevel: 3 },
  { skillType: 'Origin', targetLevel: 4 },
  { skillType: 'Origin', targetLevel: 5 },
  { skillType: 'Origin', targetLevel: 6 },
  { skillType: 'Origin', targetLevel: 7 },
  { skillType: 'Origin', targetLevel: 8 },
  { skillType: 'Origin', targetLevel: 9 },
  { skillType: 'Mastery', targetLevel: 19, skillName: 'M4' },
  { skillType: 'Origin', targetLevel: 10 },
  { skillType: 'Origin', targetLevel: 11 },
  { skillType: 'Origin', targetLevel: 12 },
  { skillType: 'Origin', targetLevel: 13 },
  { skillType: 'Boost', targetLevel: 2, skillName: 'Boost2' },
  { skillType: 'Origin', targetLevel: 14 },
  { skillType: 'Boost', targetLevel: 4, skillName: 'Boost3' },
  { skillType: 'Boost', targetLevel: 11, skillName: 'Boost1' },
  { skillType: 'Boost', targetLevel: 11, skillName: 'Boost4' },
  { skillType: 'Boost', targetLevel: 10, skillName: 'Boost3' },
  { skillType: 'Origin', targetLevel: 15 },
  { skillType: 'Boost', targetLevel: 3, skillName: 'Boost2' },
  { skillType: 'Origin', targetLevel: 16 },
  { skillType: 'Boost', targetLevel: 12, skillName: 'Boost1' },
  { skillType: 'Boost', targetLevel: 12, skillName: 'Boost4' },
  { skillType: 'Mastery', targetLevel: 25, skillName: 'M4' }, // Will level M4 from 20 to 25
  { skillType: 'Origin', targetLevel: 17 },
  { skillType: 'Mastery', targetLevel: 30, skillName: 'M2' },
  { skillType: 'Boost', targetLevel: 20, skillName: 'Boost1' }, // Will level Boost1 from 13 to 20
  { skillType: 'Boost', targetLevel: 20, skillName: 'Boost4' },
  { skillType: 'Mastery', targetLevel: 27, skillName: 'M4' },
  { skillType: 'Origin', targetLevel: 18 },
  { skillType: 'Boost', targetLevel: 10, skillName: 'Boost2' },
  { skillType: 'Mastery', targetLevel: 28, skillName: 'M4' },
  { skillType: 'Mastery', targetLevel: 29, skillName: 'M4' },
  { skillType: 'Origin', targetLevel: 19 },
  { skillType: 'Origin', targetLevel: 20 },
  { skillType: 'Origin', targetLevel: 21 },
  { skillType: 'Boost', targetLevel: 30, skillName: 'Boost1' }, // Will level Boost1 from 21 to 30
  { skillType: 'Origin', targetLevel: 22 },
  { skillType: 'Mastery', targetLevel: 30, skillName: 'M1' },
  { skillType: 'Boost', targetLevel: 30, skillName: 'Boost4' },
  { skillType: 'Origin', targetLevel: 23 },
  { skillType: 'Origin', targetLevel: 24 },
  { skillType: 'Origin', targetLevel: 25 },
  { skillType: 'Origin', targetLevel: 26 },
  { skillType: 'Origin', targetLevel: 27 },
  { skillType: 'Origin', targetLevel: 28 },
  { skillType: 'Origin', targetLevel: 29 },
  { skillType: 'Origin', targetLevel: 30 },
  { skillType: 'Mastery', targetLevel: 30, skillName: 'M3' },
  { skillType: 'Boost', targetLevel: 20, skillName: 'Boost3' }, // Will level Boost3 from 11 to 20
  { skillType: 'Mastery', targetLevel: 30, skillName: 'M4' },
  { skillType: 'Boost', targetLevel: 12, skillName: 'Boost2' },
  { skillType: 'Boost', targetLevel: 30, skillName: 'Boost3' }, // Will level Boost3 from 21 to 30
  { skillType: 'Boost', targetLevel: 30, skillName: 'Boost2' }, // Will level Boost2 from 13 to 30

];

// Optimal stopping points based on cost efficiency and FD gains
// Mastery/Origin: Linear gains with cost jumps at these levels
// Boost: Significant FD gains at these thresholds
export const OPTIMAL_STOPPING_POINTS = {
  'Mastery': [1, 9, 19, 29], // Cost jumps at these levels
  'Origin': [1, 9, 19, 29],  // Same as Mastery - linear gains with cost jumps
  'Boost': [1, 10, 20, 30],  // Significant FD gains at these levels
  'Hexa Stat': [1, 5, 10, 15, 20, 25, 30], // More granular for stat skills
  'Common': [1, 5, 10, 15, 20, 25, 30] // More granular for common skills
} as const;

// User-defined skill priorities and configurations
export interface SkillPriorityConfig {
  skillId: string;
  priority: number; // Lower number = higher priority
  optimalStoppingPoints: readonly number[];
  isUtilitySkill: boolean; // Skills that provide utility rather than damage
  damageContribution: number; // Percentage of total BA this skill contributes
  customNotes?: string;
}

// Class-specific configuration
export interface ClassPriorityConfig {
  className: string;
  skillConfigs: SkillPriorityConfig[];
  globalOptimalStoppingPoints?: Partial<Record<SkillType, number[]>>;
}

export interface PriorityScore {
  skill: HEXASkill;
  score: number;
  reason: string;
  isOptimalStoppingPoint: boolean;
  nextOptimalLevel?: number;
  damageEfficiency?: number; // FD per fragment if available
}

/**
 * Calculate the priority score for a skill based on customizable configuration
 */
export function calculatePriorityScore(
  skill: HEXASkill, 
  config?: SkillPriorityConfig
): PriorityScore {
  const skillType = skill.skillType;
  const currentLevel = skill.currentLevel;
  const maxLevel = skill.maxLevel;
  
  // If skill is already at max level, it has no priority
  if (currentLevel >= maxLevel) {
    return {
      skill,
      score: -1,
      reason: 'Already at max level',
      isOptimalStoppingPoint: false
    };
  }

  // Use custom config or default stopping points
  const optimalPoints = config?.optimalStoppingPoints || OPTIMAL_STOPPING_POINTS[skillType];
  
  // Find the next optimal stopping point
  const nextOptimalLevel = optimalPoints.find(level => level > currentLevel);
  const isAtOptimalPoint = optimalPoints.includes(currentLevel as any);
  const nextLevelIsOptimal = optimalPoints.includes((currentLevel + 1) as any);
  
  // Calculate base priority score
  let score = 0;
  let reason = '';
  
  // Base score from custom priority (if configured)
  if (config) {
    score += (100 - config.priority) * 100; // Lower priority number = higher score
    
    // Bonus/penalty based on damage contribution
    if (config.damageContribution > 0) {
      score += config.damageContribution * 10;
    }
    
    // Penalty for utility skills (unless specifically prioritized)
    if (config.isUtilitySkill && config.priority > 50) {
      score -= 200;
      reason += 'Utility skill with low priority. ';
    }
  } else {
    // Default scoring when no config is provided
    const defaultTypePriority = { 'Origin': 1, 'Mastery': 2, 'Boost': 3, 'Hexa Stat': 4, 'Common': 5 };
    score += (6 - defaultTypePriority[skillType]) * 100;
  }
  
  // Bonus for being at optimal stopping points
  if (isAtOptimalPoint) {
    score += 100;
    reason += 'At optimal stopping point. ';
  }
  
  // Bonus for next level being optimal
  if (nextLevelIsOptimal) {
    score += 150;
    reason += 'Next level is optimal stopping point. ';
  }
  
  // Bonus for being close to optimal stopping points
  if (nextOptimalLevel) {
    const distanceToOptimal = nextOptimalLevel - currentLevel;
    if (distanceToOptimal <= 2) {
      score += 50;
      reason += 'Close to optimal stopping point. ';
    }
  }
  
  // Bonus for lower levels (easier to upgrade)
  score += (maxLevel - currentLevel) * 5;
  
  // Default reason if none set
  if (!reason) {
    if (config?.customNotes) {
      reason = config.customNotes;
    } else {
      reason = `Standard priority for ${skillType} skill.`;
    }
  }
  
  return {
    skill,
    score,
    reason: reason.trim(),
    isOptimalStoppingPoint: isAtOptimalPoint,
    nextOptimalLevel
  };
}

/**
 * Get the next upgrade priority based on class-specific leveling order
 */
export function getNextUpgradePriority(
  skills: HEXASkill[], 
  classConfig?: ClassPriorityConfig,
  className?: string
): HEXASkill | null {
  if (skills.length === 0) return null;
  
  if (className) {
    const classOrder = getClassLevelingOrder(className);
    if (classOrder) {
      console.log(`🔧 DEBUG: ORDER:`, classOrder.slice(0, 10)); // Show first 10 steps
      
      // Find the first skill in the leveling order that needs to be upgraded
      for (const step of classOrder) {
        const skill = skills.find(s => {
          const skillPosition = getSkillPositionFromId(s.id);
          return skillPosition === step.skillPosition && 
                 s.currentLevel < step.targetLevel && 
                 s.currentLevel < s.maxLevel &&
                 !s.id.includes('-skill-10') && // Not Ascent
                 s.name !== 'Sol Janus'; // Not Sol Janus
        });
        
        if (skill) {

          // Return skill with target level set to just the next level
          return {
            ...skill,
            targetLevel: skill.currentLevel + 1
          };
        }
      }
      
      return null;
    } else {
    }
  } else {
  }
  
  // Fallback to legacy calculation if no custom order or className
  const priorityScores = skills
    .filter(skill => {
      // Filter out disabled skills
      const isAscentDisabled = skill.id.includes('-skill-10'); // Ascent is always the 10th skill
      const isNotInLevelingOrder = skill.name === 'Sol Janus';
      
      return skill.currentLevel < skill.maxLevel && !isAscentDisabled && !isNotInLevelingOrder;
    })
    .map(skill => calculateClassBasedPriority(skill))
    .sort((a, b) => b.score - a.score); // Sort by score descending
  
  if (priorityScores.length === 0) return null;
  // Debug: Show all priority scores
  console.log(`🔧 DEBUG: Priority scores for ${className || 'Unknown'}:`);
  priorityScores.slice(0, 5).forEach((score, index) => {
    console.log(`  ${index + 1}. ${score.skill.name} (${score.skill.skillType}) - Score: ${score.score} - Reason: ${score.reason}`);
  });
  
  // Return the skill with the highest priority score, with target level set to just the next level
  return {
    ...priorityScores[0].skill,
    targetLevel: priorityScores[0].skill.currentLevel + 1
  };
}


/**
 * Get all skills sorted by priority with configuration
 */
export function getSkillsByPriority(
  skills: HEXASkill[], 
  classConfig?: ClassPriorityConfig,
  className?: string
): PriorityScore[] {
  // Debug logging for leveling order (only log once per call)
  if (className) {
    const classOrder = getClassLevelingOrder(className);
    if (classOrder) {

    } else {

    }
  }
  
  return skills
    .filter(skill => {
      // Filter out disabled skills
      const isAscentDisabled = skill.id.includes('-skill-10'); // Ascent is always the 10th skill
      const isNotInLevelingOrder = skill.name === 'Sol Janus';
      
      return skill.currentLevel < skill.maxLevel && !isAscentDisabled && !isNotInLevelingOrder;
    })
    .map(skill => {
      // Use custom class-based priority if className is provided, otherwise use config-based
      if (className) {
        return calculateCustomClassBasedPriority(skill, className);
      } else {
        const skillConfig = classConfig?.skillConfigs.find(config => config.skillId === skill.id);
        return calculatePriorityScore(skill, skillConfig);
      }
    })
    .sort((a, b) => b.score - a.score);
}

/**
 * Check if a level is an optimal stopping point for a skill type
 */
export function isOptimalStoppingPoint(
  skillType: SkillType, 
  level: number, 
  customPoints?: number[]
): boolean {
  const optimalPoints = customPoints || OPTIMAL_STOPPING_POINTS[skillType];
  return optimalPoints.includes(level as any);
}

/**
 * Get the next optimal stopping point for a skill
 */
export function getNextOptimalStoppingPoint(
  skill: HEXASkill, 
  customPoints?: number[]
): number | null {
  const optimalPoints = customPoints || OPTIMAL_STOPPING_POINTS[skill.skillType];
  return optimalPoints.find(level => level > skill.currentLevel) || null;
}

/**
 * Get skill position from skill ID
 */
function getSkillPositionFromId(skillId: string): number {
  // Extract skill number from ID like "hero-skill-1", "hero-skill-10", "hero-separated-skill-1"
  const match = skillId.match(/-skill-(\d+)$/);
  if (match) {
    return parseInt(match[1]);
  }
  
  // Handle separated skills
  const separatedMatch = skillId.match(/-separated-skill-(\d+)$/);
  if (separatedMatch) {
    return parseInt(separatedMatch[1]) + 10; // separated-skill-1 = position 11, separated-skill-2 = position 12
  }
  
  return 999; // Unknown position
}

/**
 * Get the priority position of a skill in the class-specific leveling order
 */
export function getSkillPriorityPosition(skill: HEXASkill): number {
  // Get skill position based on skill ID (which includes the skill number)
  const skillPosition = getSkillPositionFromId(skill.id);
  
  // Find all matching entries for this skill based on position and type
  const matchingEntries = CLASS_LEVELING_ORDER
    .map((order, index) => ({ order, index }))
    .filter(({ order }) => {
      if (order.skillType !== skill.skillType) return false;
      
      // For skills with specific names, match by position instead of name
      if (order.skillName) {
        if (order.skillName.startsWith('M')) {
          // M1, M2, M3, M4 -> positions 2, 7, 8, 9 (Mastery skills)
          const masteryNumber = parseInt(order.skillName.substring(1));
          return skillPosition === (masteryNumber === 1 ? 2 : masteryNumber === 2 ? 7 : masteryNumber === 3 ? 8 : 9);
        } else if (order.skillName.startsWith('Boost')) {
          // Boost1, Boost2, Boost3, Boost4 -> positions 3, 4, 5, 6 (Boost skills)
          const boostNumber = parseInt(order.skillName.substring(5));
          return skillPosition === (boostNumber + 2);
        } else if (order.skillName === 'Ascent') {
          // Ascent -> position 10 (but disabled)
          return skillPosition === 10;
        }
        
        return false;
      }
      
      // For Origin and Hexa Stat, match by type and position
      if (order.skillType === 'Origin') {
        return skillPosition === 1; // Origin is always position 1
      } else if (order.skillType === 'Hexa Stat') {
        return skillPosition === 11; // Hexa Stat is always position 11
      }
      
      return true;
    })
    .filter(({ order }) => {
      // Only include entries where the skill needs to be leveled towards the target
      return skill.currentLevel < order.targetLevel;
    });
  
  if (matchingEntries.length === 0) {
    return 999; // High number for skills not in the order or already completed
  }
  
  // Return the position of the first (highest priority) matching entry
  return matchingEntries[0].index;
}

/**
 * Calculate priority score based on class-specific leveling order using custom data
 */
export function calculateCustomClassBasedPriority(skill: HEXASkill, className: string): PriorityScore {
  const currentLevel = skill.currentLevel;
  const maxLevel = skill.maxLevel;
  
  // If skill is already at max level, it has no priority
  if (currentLevel >= maxLevel) {
    return {
      skill,
      score: -1,
      reason: 'Already at max level',
      isOptimalStoppingPoint: false
    };
  }

  // Get skill position from skill ID
  const skillPosition = getSkillPositionFromId(skill.id);
  
  // Get the next target level for this skill from the leveling order
  const nextTargetLevel = getNextOptimalLevelForClass(className, skillPosition, currentLevel);
  
  // If no next target level found, this skill is not in the leveling order
  if (!nextTargetLevel) {
    return {
      skill,
      score: 0,
      reason: `Not in ${className} leveling order`,
      isOptimalStoppingPoint: false
    };
  }
  
  // Get priority position in the class leveling order
  const priorityPosition = getSkillPriorityInClass(className, skillPosition, currentLevel);
  
  // Simple score: lower position = higher priority (1000 - position)
  const score = 1000 - priorityPosition;
  
  // Check if current level is an optimal stopping point
  const isAtOptimalPoint = isOptimalStoppingPointForClass(className, skillPosition, currentLevel);
  
  let reason = `Position ${priorityPosition} in ${className} leveling order`;
  
  return {
    skill,
    score,
    reason,
    isOptimalStoppingPoint: isAtOptimalPoint,
    nextOptimalLevel: nextTargetLevel
  };
}

/**
 * Calculate priority score based on class-specific leveling order (legacy)
 */
export function calculateClassBasedPriority(skill: HEXASkill): PriorityScore {
  const currentLevel = skill.currentLevel;
  const maxLevel = skill.maxLevel;
  
  // If skill is already at max level, it has no priority
  if (currentLevel >= maxLevel) {
    return {
      skill,
      score: -1,
      reason: 'Already at max level',
      isOptimalStoppingPoint: false
    };
  }

  // Get priority position in the class leveling order
  const priorityPosition = getSkillPriorityPosition(skill);
  
  // Find the target level for this skill from the leveling order
  const skillPosition = getSkillPositionFromId(skill.id);
  const targetLevel = CLASS_LEVELING_ORDER.find(order => {
    if (order.skillType !== skill.skillType) return false;
    
    // For skills with specific names, match by position instead of name
    if (order.skillName) {
      if (order.skillName.startsWith('M')) {
        // M1, M2, M3, M4 -> positions 2, 7, 8, 9 (Mastery skills)
        const masteryNumber = parseInt(order.skillName.substring(1));
        return skillPosition === (masteryNumber === 1 ? 2 : masteryNumber === 2 ? 7 : masteryNumber === 3 ? 8 : 9);
      } else if (order.skillName.startsWith('Boost')) {
        // Boost1, Boost2, Boost3, Boost4 -> positions 3, 4, 5, 6 (Boost skills)
        const boostNumber = parseInt(order.skillName.substring(5));
        return skillPosition === (boostNumber + 2);
      } else if (order.skillName === 'Ascent') {
        // Ascent -> position 10 (but disabled)
        return skillPosition === 10;
      }
      
      return false;
    }
    
    // For Origin and Hexa Stat, match by type and position
    if (order.skillType === 'Origin') {
      return skillPosition === 1; // Origin is always position 1
    } else if (order.skillType === 'Hexa Stat') {
      return skillPosition === 11; // Hexa Stat is always position 11
    }
    
    return true;
  })?.targetLevel || currentLevel + 1;
  
  // Calculate score (lower position = higher priority)
  const score = 1000 - priorityPosition;
  
  // Check if next level is an optimal stopping point
  const nextLevelIsOptimal = isOptimalStoppingPoint(skill.skillType, currentLevel + 1);
  
  let reason = '';
  if (priorityPosition < 10) {
    reason = 'High priority in class leveling order';
  } else if (priorityPosition < 50) {
    reason = 'Medium priority in class leveling order';
  } else {
    reason = 'Lower priority in class leveling order';
  }
  
  if (nextLevelIsOptimal) {
    reason += ' - Next level is optimal stopping point';
  }
  
  return {
    skill,
    score,
    reason,
    isOptimalStoppingPoint: isOptimalStoppingPoint(skill.skillType, currentLevel),
    nextOptimalLevel: targetLevel
  };
}

/**
 * Create a default class configuration template
 */
export function createDefaultClassConfig(className: string, skills: HEXASkill[]): ClassPriorityConfig {
  return {
    className,
    skillConfigs: skills.map((skill, index) => ({
      skillId: skill.id,
      priority: index + 1, // Default priority order
      optimalStoppingPoints: OPTIMAL_STOPPING_POINTS[skill.skillType],
      isUtilitySkill: false,
      damageContribution: 0, // User needs to fill this in
      customNotes: `Default configuration for ${skill.name}`
    }))
  };
}
