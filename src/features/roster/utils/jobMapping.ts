/**
 * Job name mapping utilities for MapleStory characters
 * Maps jobID and jobDetail to proper job names
 */

export const getJobName = (jobID: number, jobDetail: number): string => {
  // Prefer specific class names by jobDetail when available
  const jobDetailMap: Record<number, Record<number, string>> = {
    // Warrior branches
    1: {
      12: 'Hero',
      22: 'Paladin',
      32: 'Dark Knight'
    },
    // Magician branches
    2: {
      12: 'Fire Poison (F/P)',
      22: 'Arch Mage (I/L)',
      32: 'Bishop'
    },
    // Bowman branches
    3: {
      12: 'Bowmaster',
      22: 'Marksman',
      32: 'Pathfinder'
    },
    // Thief branches
    4: {
      12: 'Night Lord',
      22: 'Shadower',
      34: 'Dual Blade'
    },
    // Pirate branches
    5: {
      12: 'Buccaneer',
      22: 'Corsair',
      32: 'Cannoneer'
    }
    // Add more detailed mappings here in the future as needed per jobID → jobDetail
  };

  const detailed = jobDetailMap[jobID]?.[jobDetail];
  if (detailed) return detailed;

  // Fallback to broad job family when detailed mapping is not known
  const jobMap: { [key: number]: string } = {
    1: 'Warrior',
    2: 'Magician', 
    3: 'Bowman',
    4: 'Thief',
    5: 'Pirate',
    11: 'Dawn Warrior',
    12: 'Blaze Wizard',
    13: 'Wind Archer',
    14: 'Night Walker',
    15: 'Thunder Breaker',
    21: 'Aran',
    22: 'Evan',
    23: 'Mercedes',
    24: 'Phantom',
    28: 'Kinesis',
    31: 'Demon Slayer',
    32: 'Battle Mage',
    33: 'Wild Hunter',
    35: 'Mechanic',
    202: 'Mihile',
    203: 'Luminous',
    204: 'Kaiser',
    205: 'Angelic Buster',
    206: 'Hayato',
    207: 'Kanna',
    208: 'Xenon',
    209: 'Demon Avenger',
    210: 'Zero',
    212: 'Shade',
    214: 'Kinesis',
    215: 'Blaster',
    216: 'Cadena',
    217: 'Illium',
    218: 'Ark',
    220: 'Hoyoung',
    221: 'Adele',
    222: 'Kain',
    223: 'Lara',
    224: 'Khali',
    225: 'Lynn',
    226: 'Mo Xuan',
    227: 'Sia Astelle'
  };
  
  return jobMap[jobID] || 'Unknown';
};

/**
 * Get job name from character data using jobID and jobDetail
 */
export const getCharacterJobName = (characterData: {
  jobID?: number;
  jobDetail?: number;
}): string => {
  // If we have jobID and jobDetail, use the mapping
  if (characterData.jobID !== undefined && characterData.jobDetail !== undefined) {
    return getJobName(characterData.jobID, characterData.jobDetail);
  }
  
  // Fallback to Unknown if no job data available
  return 'Unknown';
};

/**
 * Check if a job name is a specific class (not just a broad category)
 */
export const isSpecificJob = (jobName: string): boolean => {
  const broadCategories = ['Warrior', 'Magician', 'Bowman', 'Thief', 'Pirate'];
  return !broadCategories.includes(jobName);
};

/**
 * Get job category from job name
 */
export const getJobCategory = (jobName: string): string => {
  if (jobName.includes('Warrior') || jobName === 'Hero' || jobName === 'Paladin' || jobName === 'Dark Knight' || jobName === 'Dawn Warrior' || jobName === 'Aran' || jobName === 'Demon Slayer' || jobName === 'Mihile' || jobName === 'Kaiser' || jobName === 'Hayato' || jobName === 'Demon Avenger' || jobName === 'Zero' || jobName === 'Blaster' || jobName === 'Adele' || jobName === 'Kain' || jobName === 'Lynn' || jobName === 'Mo Xuan' || jobName === 'Sia Astelle') {
    return 'Warrior';
  }
  if (jobName.includes('Mage') || jobName.includes('Wizard') || jobName === 'Bishop' || jobName === 'Blaze Wizard' || jobName === 'Evan' || jobName === 'Battle Mage' || jobName === 'Luminous' || jobName === 'Kinesis' || jobName === 'Illium') {
    return 'Magician';
  }
  if (jobName.includes('Bow') || jobName.includes('Marksman') || jobName === 'Pathfinder' || jobName === 'Wind Archer' || jobName === 'Mercedes' || jobName === 'Wild Hunter' || jobName === 'Mechanic') {
    return 'Bowman';
  }
  if (jobName.includes('Thief') || jobName.includes('Lord') || jobName.includes('Shadower') || jobName === 'Dual Blade' || jobName === 'Night Walker' || jobName === 'Phantom' || jobName === 'Xenon' || jobName === 'Shade' || jobName === 'Cadena' || jobName === 'Ark' || jobName === 'Hoyoung' || jobName === 'Lara' || jobName === 'Khali') {
    return 'Thief';
  }
  if (jobName.includes('Pirate') || jobName.includes('Buccaneer') || jobName.includes('Corsair') || jobName === 'Cannoneer' || jobName === 'Thunder Breaker' || jobName === 'Angelic Buster') {
    return 'Pirate';
  }
  
  return 'Unknown';
};
