export interface TaskTemplate {
  name: string;
  category: string;
  frequency: 'daily' | 'weekly' | 'monthly';
}

export const taskTemplates: TaskTemplate[] = [
  // 1. Event
  { name: 'Daily Gift', category: 'Event', frequency: 'daily' },
  { name: 'Challenger World Hunting Mission', category: 'Event', frequency: 'daily' },
  { name: 'Burning Express Check In', category: 'Event', frequency: 'daily' },
  { name: 'Night Troupe Coin Cap', category: 'Event', frequency: 'daily' },
  { name: 'Night Troupe Mu Lung Night Challenge', category: 'Event', frequency: 'weekly' },
  { name: 'Champion Double Up Cap Weekly Points', category: 'Event', frequency: 'weekly' },
  { name: 'Champion Double Up 3x Coin Checkin', category: 'Event', frequency: 'weekly' },

  // 2. Sacred Symbol Dailies
  { name: 'Cernium', category: 'Sacred Symbol Dailies', frequency: 'daily' },
  { name: 'Hotel Arcus', category: 'Sacred Symbol Dailies', frequency: 'daily' },
  { name: 'Odium', category: 'Sacred Symbol Dailies', frequency: 'daily' },
  { name: 'Shangri-La', category: 'Sacred Symbol Dailies', frequency: 'daily' },
  { name: 'Arteria', category: 'Sacred Symbol Dailies', frequency: 'daily' },
  { name: 'Carcion', category: 'Sacred Symbol Dailies', frequency: 'daily' },
  { name: 'Tallahart', category: 'Sacred Symbol Dailies', frequency: 'daily' },

  // 3. Arcane Symbol Dailies
  { name: 'Vanishing Journey', category: 'Arcane Symbol Dailies', frequency: 'daily' },
  { name: 'Chu Chu Island', category: 'Arcane Symbol Dailies', frequency: 'daily' },
  { name: 'Lachelin', category: 'Arcane Symbol Dailies', frequency: 'daily' },
  { name: 'Arcana', category: 'Arcane Symbol Dailies', frequency: 'daily' },
  { name: 'Morass', category: 'Arcane Symbol Dailies', frequency: 'daily' },
  { name: 'Esfera', category: 'Arcane Symbol Dailies', frequency: 'daily' },
  { name: 'Tenebris', category: 'Arcane Symbol Dailies', frequency: 'daily' },

  // 4. 6th Job
  { name: 'Erda\'s Request', category: '6th Job', frequency: 'daily' },
  { name: 'Sol Erda Booster', category: '6th Job', frequency: 'daily' },
  { name: 'High Mountain Dungeon', category: '6th Job', frequency: 'weekly' },
  { name: 'Angler Company Dungeon', category: '6th Job', frequency: 'weekly' },

  // 5. Other Dailies
  { name: 'Monster Park', category: 'Other Dailies', frequency: 'daily' },
  { name: 'Monster Park Extreme', category: 'Other Dailies', frequency: 'weekly' },
  { name: 'Commerci Voyages', category: 'Other Dailies', frequency: 'daily' },
  { name: 'Commerci Party Quest', category: 'Other Dailies', frequency: 'daily' },
  { name: 'Ursus', category: 'Other Dailies', frequency: 'daily' },
  { name: 'Maple Tour', category: 'Other Dailies', frequency: 'daily' },
  { name: 'Talk to Home Caretaker', category: 'Other Dailies', frequency: 'daily' },
  { name: 'Auto-Harvest Herbs and Minerals', category: 'Other Dailies', frequency: 'daily' },

  // 6. Daily Bosses
  { name: 'Easy/Normal Zakum', category: 'Daily Bosses', frequency: 'daily' },
  { name: 'Normal Hilla', category: 'Daily Bosses', frequency: 'daily' },
  { name: 'Normal Von Bon', category: 'Daily Bosses', frequency: 'daily' },
  { name: 'Normal Crimson Queen', category: 'Daily Bosses', frequency: 'daily' },
  { name: 'Normal Pierre', category: 'Daily Bosses', frequency: 'daily' },
  { name: 'Normal Vellum', category: 'Daily Bosses', frequency: 'daily' },
  { name: 'Horntail', category: 'Daily Bosses', frequency: 'daily' },
  { name: 'Von Leon', category: 'Daily Bosses', frequency: 'daily' },
  { name: 'Normal Pink Bean', category: 'Daily Bosses', frequency: 'daily' },
  { name: 'Easy/Normal Magnus', category: 'Daily Bosses', frequency: 'daily' },
  { name: 'Arkarium', category: 'Daily Bosses', frequency: 'daily' },
  { name: 'Easy/Normal Papulatus', category: 'Daily Bosses', frequency: 'daily' },
  { name: 'Mori Ranmaru', category: 'Daily Bosses', frequency: 'daily' },
  { name: 'Gollux', category: 'Daily Bosses', frequency: 'daily' },

  // 7. Arcane Symbol Weeklies
  { name: 'Erda Spectrum', category: 'Arcane Symbol Weeklies', frequency: 'weekly' },
  { name: 'Hungry Muto', category: 'Arcane Symbol Weeklies', frequency: 'weekly' },
  { name: 'Midnight Chaser', category: 'Arcane Symbol Weeklies', frequency: 'weekly' },
  { name: 'Spirit Savior', category: 'Arcane Symbol Weeklies', frequency: 'weekly' },
  { name: 'Ranheim Defense', category: 'Arcane Symbol Weeklies', frequency: 'weekly' },
  { name: 'Esfera Guardian', category: 'Arcane Symbol Weeklies', frequency: 'weekly' },

  // 8. Guild
  { name: 'Guild Culvert', category: 'Guild', frequency: 'weekly' },
  { name: 'Guild Flag Race', category: 'Guild', frequency: 'weekly' },
  { name: 'Guild Castle 5k Mobs', category: 'Guild', frequency: 'weekly' },
  { name: 'Guild Check In', category: 'Guild', frequency: 'daily' },

  // 9. Legion
  { name: 'Claim Legion Coins', category: 'Legion', frequency: 'daily' },
  { name: 'Legion Weekly Dragon Extermination', category: 'Legion', frequency: 'weekly' },
  { name: 'Legion Champion Raid', category: 'Legion', frequency: 'monthly' },

  // 10. Other Weeklies
  { name: 'Mu Lung Dojo', category: 'Other Weeklies', frequency: 'weekly' },
  { name: 'Scrapyard Weeklies', category: 'Other Weeklies', frequency: 'weekly' },
  { name: 'Dark World Tree Weeklies', category: 'Other Weeklies', frequency: 'weekly' },

  // 11. Threads of Fate
  { name: 'Reroll Threads of Fate Ask', category: 'Threads of Fate', frequency: 'daily' },
  { name: 'Lock Threads of Fate Ask', category: 'Threads of Fate', frequency: 'daily' },
  { name: 'Threads of Fate Ask', category: 'Threads of Fate', frequency: 'daily' },
  { name: 'Talk Threads of Fate', category: 'Threads of Fate', frequency: 'daily' },
  { name: 'Gift Threads of Fate', category: 'Threads of Fate', frequency: 'weekly' },

  // Monthly Tasks
  { name: 'Black Mage', category: 'Monthly Bosses', frequency: 'monthly' },
];

export const taskCategories = [
  'Daily Quest',
  'Weekly Quest',
  'Event',
  'Grinding',
  'Collection',
  'Other'
];
