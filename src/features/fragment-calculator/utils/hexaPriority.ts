import { HEXASkill, SkillType } from '../types';
import { getTotalCost } from './costTables';
import { getClassLevelingOrder } from './classLevelingOrders';

// Type definitions
export interface PriorityScore {
  skill: HEXASkill;
  score: number;
  reason: string;
  isOptimalStoppingPoint: boolean;
  nextOptimalLevel?: number;
}

export interface ClassPriorityConfig {
  className: string;
  skillConfigs: Array<{
    skillId: string;
    priority: number;
    optimalStoppingPoints: number[];
    isUtilitySkill: boolean;
    damageContribution: number;
    customNotes: string;
  }>;
}

// Helper function to get skill position from skill ID
function getSkillPositionFromId(skillId: string): number {
  // Check for separated skills first (more specific pattern)
  const separatedMatch = skillId.match(/-separated-skill-(\d+)$/);
  if (separatedMatch) {
    const separatedIndex = parseInt(separatedMatch[1]);
    return 10 + separatedIndex; // separated-skill-1 -> 11, separated-skill-2 -> 12
  }
  
  // Check for main skills (1-10)
  const mainMatch = skillId.match(/-skill-(\d+)$/);
  if (mainMatch) {
    return parseInt(mainMatch[1]);
  }
  
  return 0; // Fallback
}

/**
 * Calculate priority score based on class-specific leveling order
 * This is the main function that determines upgrade priority
 */
export function calculateClassBasedPriority(skill: HEXASkill, className: string): PriorityScore {
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

  // Get the class leveling order from customClassOrder.js
  const classOrder = getClassLevelingOrder(className);
  if (!classOrder) {
    return {
      skill,
      score: 0,
      reason: 'No class leveling order found',
      isOptimalStoppingPoint: false
    };
  }

  // Find the position of this skill in the class order
  const skillPosition = getSkillPositionFromId(skill.id);
  
  // Find the next target level for this skill based on current level
  const nextStep = classOrder.find(step => 
    step.skillPosition === skillPosition && step.targetLevel > currentLevel
  );
  
  if (!nextStep) {
    return {
      skill,
      score: 0,
      reason: 'No more levels needed in class leveling order',
      isOptimalStoppingPoint: false
    };
  }

  // Find the index of this step in the class order for priority calculation
  const stepIndex = classOrder.findIndex(step => 
    step.skillPosition === nextStep.skillPosition && step.targetLevel === nextStep.targetLevel
  );
  
  // Calculate score (lower index = higher priority)
  const score = 1000 - stepIndex;
  
  const reason = `Position ${stepIndex + 1} in ${className} leveling order`;
  
  return {
    skill,
    score,
    reason,
    isOptimalStoppingPoint: false,
    nextOptimalLevel: nextStep.targetLevel
  };
}

/**
 * Get the next upgrade priority for a skill
 */
export function getNextUpgradePriority(skill: HEXASkill, className: string): PriorityScore {
  return calculateClassBasedPriority(skill, className);
}

/**
 * Get skills sorted by priority
 */
export function getSkillsByPriority(skills: HEXASkill[], className: string): PriorityScore[] {
  return skills
    .filter(skill => {
      // Exclude separated skills (positions 11-12) from priority calculation
      const skillPosition = getSkillPositionFromId(skill.id);
      return skillPosition >= 1 && skillPosition <= 10;
    })
    .map(skill => calculateClassBasedPriority(skill, className))
    .filter(priority => priority.score >= 0) // Remove maxed skills
    .sort((a, b) => b.score - a.score); // Higher score = higher priority
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
      optimalStoppingPoints: [], // No optimal stopping points in simplified version
      isUtilitySkill: false,
      damageContribution: 0, // User needs to fill this in
      customNotes: `Default configuration for ${skill.name}`
    }))
  };
}