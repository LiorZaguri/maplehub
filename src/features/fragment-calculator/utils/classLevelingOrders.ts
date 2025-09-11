import { CUSTOM_CLASS_LEVELING_ORDER } from '../constants/customClassOrder';

// Type definitions for the compressed leveling order
export interface CompressedLevelingStep {
  skillPosition: number; // 1-11 (Origin=1, Mastery=2,7,8,9, Boost=3,4,5,6, Ascent=10, HexaStat=11)
  targetLevel: number;
}

export interface ClassLevelingOrder {
  class: string;
  order: CompressedLevelingStep[];
}

// Decompress the leveling order from [skillPosition, targetLevel] format
export function decompressLevelingOrder(compressedOrder: number[][]): CompressedLevelingStep[] {
  return compressedOrder.map(([skillPosition, targetLevel]) => ({
    skillPosition,
    targetLevel
  }));
}

// Get the leveling order for a specific class
export function getClassLevelingOrder(className: string): CompressedLevelingStep[] | null {
  const classData = CUSTOM_CLASS_LEVELING_ORDER.find(item => item.class === className);
  if (!classData) return null;
  
  return decompressLevelingOrder(classData.order);
}

// Get all available class names
export function getAvailableClasses(): string[] {
  return CUSTOM_CLASS_LEVELING_ORDER.map(item => item.class);
}

// Find the next target level for a specific skill position in a class's leveling order
export function getNextTargetLevel(
  className: string, 
  skillPosition: number, 
  currentLevel: number
): number | null {
  const levelingOrder = getClassLevelingOrder(className);
  if (!levelingOrder) return null;
  
  // Find the next step that targets this skill position and is higher than current level
  const nextStep = levelingOrder.find(step => 
    step.skillPosition === skillPosition && step.targetLevel > currentLevel
  );
  
  return nextStep?.targetLevel || null;
}

// Get the priority position of a skill in the class leveling order
export function getSkillPriorityInClass(
  className: string, 
  skillPosition: number, 
  currentLevel: number
): number {
  const levelingOrder = getClassLevelingOrder(className);
  if (!levelingOrder) return 999; // Low priority if no data
  
  // Find the index of the next step for this skill
  const nextStepIndex = levelingOrder.findIndex(step => 
    step.skillPosition === skillPosition && step.targetLevel > currentLevel
  );
  
  return nextStepIndex === -1 ? 999 : nextStepIndex;
}

// Check if a skill is at an optimal stopping point for the class
export function isOptimalStoppingPointForClass(
  className: string, 
  skillPosition: number, 
  currentLevel: number
): boolean {
  const levelingOrder = getClassLevelingOrder(className);
  if (!levelingOrder) return false;
  
  // Check if current level matches any target level for this skill position
  return levelingOrder.some(step => 
    step.skillPosition === skillPosition && step.targetLevel === currentLevel
  );
}

// Get the next optimal level for a skill in the class leveling order
export function getNextOptimalLevelForClass(
  className: string, 
  skillPosition: number, 
  currentLevel: number
): number | null {
  const levelingOrder = getClassLevelingOrder(className);
  if (!levelingOrder) return null;
  
  // Find the next target level for this skill position
  const nextStep = levelingOrder.find(step => 
    step.skillPosition === skillPosition && step.targetLevel > currentLevel
  );
  
  return nextStep?.targetLevel || null;
}
