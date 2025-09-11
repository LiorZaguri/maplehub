import { HEXASkill, SkillType } from '../types';
import { jobSkillNames, getAvailableJobNames } from '../constants/jobSkillNames';

// Generate HEXA skills for any job - main 10 skills + 2 separated skills
export const generateSkillsForJob = (jobName: string): HEXASkill[] => {
  const skills: HEXASkill[] = [];
  
  // Get job-specific skill names, fallback to generic names if job not found
  const jobSkills = jobSkillNames[jobName];
  
  // Main 10 skill types and their max levels with proper names
  // Based on tempOrder mapping: 1.png=Origin, 2.png=M1, 3.png=Boost1, etc.
  const mainSkillTypes: { type: SkillType; maxLevel: number; name: string }[] = [
    { type: 'Origin', maxLevel: 30, name: jobSkills?.originSkill || 'Origin' },           // 1.png
    { type: 'Mastery', maxLevel: 30, name: jobSkills?.masterySkills[0] || 'Mastery 1' },      // 2.png = M1
    { type: 'Boost', maxLevel: 30, name: jobSkills?.boostSkills[0] || 'Boost 1' },          // 3.png = Boost 1
    { type: 'Boost', maxLevel: 30, name: jobSkills?.boostSkills[1] || 'Boost 2' },          // 4.png = Boost 2
    { type: 'Boost', maxLevel: 30, name: jobSkills?.boostSkills[2] || 'Boost 3' },          // 5.png = Boost 3
    { type: 'Boost', maxLevel: 30, name: jobSkills?.boostSkills[3] || 'Boost 4' },          // 6.png = Boost 4
    { type: 'Mastery', maxLevel: 30, name: jobSkills?.masterySkills[1] || 'Mastery 2' },      // 7.png = M2
    { type: 'Mastery', maxLevel: 30, name: jobSkills?.masterySkills[2] || 'Mastery 3' },      // 8.png = M3
    { type: 'Mastery', maxLevel: 30, name: jobSkills?.masterySkills[3] || 'Mastery 4' },      // 9.png = M4
    { type: 'Origin', maxLevel: 30, name: jobSkills?.ascentSkill || 'Ascent' },       // 10.png = Ascent (disabled, not working yet, costs same as Origin)
  ];

  // Separated skills (not part of main leveling order)
  const separatedSkillTypes: { type: SkillType; maxLevel: number; name: string }[] = [
    { type: 'Hexa Stat', maxLevel: 2, name: 'Hexa Stat' },     // 11.png = Hexa Stat (in leveling order)
    { type: 'Common', maxLevel: 30, name: jobSkills?.commonSkills[0] || 'Sol Janus' },       // sol_janus.png = Sol Janus (not in leveling order)
  ];

  // Generate main 10 skills with images 1.png to 10.png
  for (let i = 0; i < 10; i++) {
    const skillType = mainSkillTypes[i];
    const skill = {
      id: `${jobName.toLowerCase().replace(/\s+/g, '-')}-skill-${i + 1}`,
      name: skillType.name, // Actual skill name from job mapping
      icon: `${jobName}/${i + 1}.png`,
      currentLevel: i === 0 ? 1 : 0, // Origin skill (first skill) starts at level 1, others at 0
      targetLevel: skillType.maxLevel,
      skillType: skillType.type,
      maxLevel: skillType.maxLevel,
      isComplete: false,
    };
    
    skills.push(skill);
  }

  // Generate separated skills
  for (let i = 0; i < 2; i++) {
    const skillType = separatedSkillTypes[i];
    let iconPath: string;
    
    // Special handling for specific skill images
    if (skillType.name === 'Sol Janus' || skillType.name === jobSkills?.commonSkills[0]) {
      iconPath = 'sol_janus.png';
    } else if (skillType.type === 'Hexa Stat') {
      iconPath = 'hexa.png'; // Use shared hexa.png image for all Hexa Stat skills
    } else {
      iconPath = `${jobName}/${i + 11}.png`; // Fallback for other skills
    }
    
    const skill = {
      id: `${jobName.toLowerCase().replace(/\s+/g, '-')}-separated-skill-${i + 1}`,
      name: skillType.name, // Actual skill name from job mapping
      icon: iconPath,
      currentLevel: 0,
      targetLevel: skillType.maxLevel,
      skillType: skillType.type,
      maxLevel: skillType.maxLevel,
      isComplete: false,
    };
    
    skills.push(skill);
  }

  return skills;
};

// Get HEXA skills for a specific job
export const getSkillsForJob = (jobName: string): HEXASkill[] => {
  return generateSkillsForJob(jobName);
};

// Get all available job names that have skill mappings
export const getAvailableJobs = (): string[] => {
  return getAvailableJobNames();
};