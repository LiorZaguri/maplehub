import { HEXASkill, HEXAProgression, FragmentCharacter, SkillType } from '../types';
import { getTotalCost, getLevelCost } from './costTables';
import { getSkillsForJob } from './skillMapping';
import { getCharacterJobName } from '../../roster/utils/jobMapping';

// Get HEXA skills for a specific job based on the character's actual job
export const getDefaultSkillsForJob = (jobName: string): HEXASkill[] => {
  return getSkillsForJob(jobName);
};

// Calculate costs for skill upgrades using proper cost tables
export const calculateSkillCosts = (skill: HEXASkill): { solErda: number; fragments: number } => {
  return getTotalCost(skill.skillType, skill.currentLevel, skill.targetLevel);
};

// Calculate total progression (matching working calculator logic)
export const calculateProgression = (skills: HEXASkill[]): HEXAProgression => {
  // Filter out disabled skills (Ascent) from fragment calculations
  const activeSkills = skills.filter(skill => !skill.id.includes('-skill-10')); // Ascent is always the 10th skill
  
  // Total fragments and Sol Erda needed for all active skills at max level
  const totalFragments = activeSkills.reduce((sum, skill) => {
    const maxCost = getTotalCost(skill.skillType, 0, skill.maxLevel);
    return sum + maxCost.fragments;
  }, 0);

  const totalSolErda = activeSkills.reduce((sum, skill) => {
    const maxCost = getTotalCost(skill.skillType, 0, skill.maxLevel);
    return sum + maxCost.solErda;
  }, 0);

  const spentFragments = activeSkills.reduce((sum, skill) => {
    if (skill.currentLevel > 0) {
      const totalCost = getTotalCost(skill.skillType, 0, skill.currentLevel);
      return sum + totalCost.fragments;
    }
    return sum;
  }, 0);

  const spentSolErda = activeSkills.reduce((sum, skill) => {
    if (skill.currentLevel > 0) {
      const totalCost = getTotalCost(skill.skillType, 0, skill.currentLevel);
      return sum + totalCost.solErda;
    }
    return sum;
  }, 0);

  const completionPercentage = totalFragments > 0 ? (spentFragments / totalFragments) * 100 : 0;

  return {
    solErdaSpent: spentSolErda,
    solErdaTotal: totalSolErda,
    fragmentsSpent: spentFragments,
    fragmentsTotal: totalFragments,
    completionPercentage,
  };
};

// Calculate daily rate and completion estimate
export const calculateCompletionEstimate = (
  skills: HEXASkill[],
  dailyRate: { fragments: number; waps: number; dailies: number; weeklies: number }
): number => {
  // Filter out disabled skills (Ascent) from completion estimate
  const activeSkills = skills.filter(skill => !skill.id.includes('-skill-10')); // Ascent is always the 10th skill
  
  const totalFragmentsNeeded = activeSkills.reduce((sum, skill) => {
    if (skill.targetLevel > skill.currentLevel) {
      const totalCost = getTotalCost(skill.skillType, skill.currentLevel, skill.targetLevel);
      return sum + totalCost.fragments;
    }
    return sum;
  }, 0);

  if (dailyRate.fragments <= 0) return 0;
  return totalFragmentsNeeded / dailyRate.fragments;
};

// Create a complete FragmentCharacter with calculated data
export const createFragmentCharacter = (rosterCharacter: any): FragmentCharacter => {
  
  // Use proper job name resolution from jobID and jobDetail if available
  // If jobID/jobDetail are undefined, fall back to the character class directly
  let jobName = 'Unknown';
  if (rosterCharacter.jobID !== undefined && rosterCharacter.jobDetail !== undefined) {
    jobName = getCharacterJobName({
      jobID: rosterCharacter.jobID,
      jobDetail: rosterCharacter.jobDetail
    });
  } else if (rosterCharacter.class) {
    jobName = rosterCharacter.class;
  }
  
  const hexaSkills = getDefaultSkillsForJob(jobName);
  const progression = calculateProgression(hexaSkills);
  const dailyRate = {
    fragments: 99.9,
    waps: 40,
    dailies: 12,
    weeklies: 55,
  };
  const estimatedCompletionDays = calculateCompletionEstimate(hexaSkills, dailyRate);

  return {
    ...rosterCharacter,
    hexaSkills,
    progression,
    dailyRate,
    estimatedCompletionDays,
    fragmentProgress: progression.completionPercentage,
    jobName: jobName,
  };
};
