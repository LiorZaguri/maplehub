// Data transformation utilities
export interface Character {
  id: string;
  name: string;
  class: string;
  level: number;
  exp: number;
  reboot: boolean;
  lastUpdated: string;
  avatarUrl?: string;
  isMain: boolean;
  legionLevel?: number;
  raidPower?: number;
}

export interface Task {
  id: string;
  name: string;
  character: string;
  frequency: 'daily' | 'weekly' | 'monthly';
  completed: boolean;
  category: string;
  dueDate: string;
  priority?: 'low' | 'medium' | 'high';
  notes?: string;
  createdAt: string;
}

export interface Boss {
  id: string;
  name: string;
  difficulty: 'easy' | 'normal' | 'hard' | 'chaos' | 'extreme';
  level: number;
  imageUrl?: string;
  mesoReward?: number;
  expReward?: number;
}

// Character transformers
export const characterTransformers = {
  // Transform API response to internal format
  fromAPI: (data: any): Character => ({
    id: data.id || data._id || generateId(),
    name: data.name,
    class: data.class,
    level: data.level,
    exp: data.exp || 0,
    reboot: data.reboot || false,
    lastUpdated: data.lastUpdated || new Date().toISOString(),
    avatarUrl: data.avatarUrl,
    isMain: data.isMain || false,
    legionLevel: data.legionLevel,
    raidPower: data.raidPower,
  }),

  // Transform internal format to API payload
  toAPI: (character: Character): any => ({
    id: character.id,
    name: character.name,
    class: character.class,
    level: character.level,
    exp: character.exp,
    reboot: character.reboot,
    lastUpdated: character.lastUpdated,
    avatarUrl: character.avatarUrl,
    isMain: character.isMain,
    legionLevel: character.legionLevel,
    raidPower: character.raidPower,
  }),

  // Transform for localStorage
  toStorage: (character: Character): any => ({
    ...character,
    lastUpdated: new Date().toISOString(),
  }),

  // Transform from localStorage
  fromStorage: (data: any): Character => ({
    ...data,
    lastUpdated: data.lastUpdated || new Date().toISOString(),
  }),
};

// Task transformers
export const taskTransformers = {
  fromAPI: (data: any): Task => ({
    id: data.id || data._id || generateId(),
    name: data.name,
    character: data.character,
    frequency: data.frequency,
    completed: data.completed || false,
    category: data.category,
    dueDate: data.dueDate || new Date().toISOString().split('T')[0],
    priority: data.priority || 'medium',
    notes: data.notes,
    createdAt: data.createdAt || new Date().toISOString(),
  }),

  toAPI: (task: Task): any => ({
    id: task.id,
    name: task.name,
    character: task.character,
    frequency: task.frequency,
    completed: task.completed,
    category: task.category,
    dueDate: task.dueDate,
    priority: task.priority,
    notes: task.notes,
    createdAt: task.createdAt,
  }),

  toStorage: (task: Task): any => ({
    ...task,
    lastUpdated: new Date().toISOString(),
  }),

  fromStorage: (data: any): Task => ({
    ...data,
    completed: data.completed || false,
    dueDate: data.dueDate || new Date().toISOString().split('T')[0],
    createdAt: data.createdAt || new Date().toISOString(),
  }),
};

// Boss transformers
export const bossTransformers = {
  fromAPI: (data: any): Boss => ({
    id: data.id || data._id || generateId(),
    name: data.name,
    difficulty: data.difficulty,
    level: data.level,
    imageUrl: data.imageUrl,
    mesoReward: data.mesoReward,
    expReward: data.expReward,
  }),

  toAPI: (boss: Boss): any => ({
    id: boss.id,
    name: boss.name,
    difficulty: boss.difficulty,
    level: boss.level,
    imageUrl: boss.imageUrl,
    mesoReward: boss.mesoReward,
    expReward: boss.expReward,
  }),

  toStorage: (boss: Boss): any => ({
    ...boss,
  }),

  fromStorage: (data: any): Boss => ({
    ...data,
  }),
};

// Collection transformers
export const collectionTransformers = {
  characters: {
    fromAPI: (data: any[]): Character[] => data.map(characterTransformers.fromAPI),
    toAPI: (characters: Character[]): any[] => characters.map(characterTransformers.toAPI),
    toStorage: (characters: Character[]): any[] => characters.map(characterTransformers.toStorage),
    fromStorage: (data: any[]): Character[] => data.map(characterTransformers.fromStorage),
  },

  tasks: {
    fromAPI: (data: any[]): Task[] => data.map(taskTransformers.fromAPI),
    toAPI: (tasks: Task[]): any[] => tasks.map(taskTransformers.toAPI),
    toStorage: (tasks: Task[]): any[] => tasks.map(taskTransformers.toStorage),
    fromStorage: (data: any[]): Task[] => data.map(taskTransformers.fromStorage),
  },

  bosses: {
    fromAPI: (data: any[]): Boss[] => data.map(bossTransformers.fromAPI),
    toAPI: (bosses: Boss[]): any[] => bosses.map(bossTransformers.toAPI),
    toStorage: (bosses: Boss[]): any[] => bosses.map(bossTransformers.toStorage),
    fromStorage: (data: any[]): Boss[] => data.map(bossTransformers.fromStorage),
  },
};

// Utility functions
function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Sorting and filtering helpers
export const sortHelpers = {
  characters: {
    byName: (a: Character, b: Character) => a.name.localeCompare(b.name),
    byLevel: (a: Character, b: Character) => b.level - a.level,
    byMainFirst: (a: Character, b: Character) => {
      if (a.isMain && !b.isMain) return -1;
      if (!a.isMain && b.isMain) return 1;
      return a.name.localeCompare(b.name);
    },
  },

  tasks: {
    byDueDate: (a: Task, b: Task) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime(),
    byPriority: (a: Task, b: Task) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return (priorityOrder[b.priority || 'medium'] || 2) - (priorityOrder[a.priority || 'medium'] || 2);
    },
    byName: (a: Task, b: Task) => a.name.localeCompare(b.name),
  },

  bosses: {
    byName: (a: Boss, b: Boss) => a.name.localeCompare(b.name),
    byLevel: (a: Boss, b: Boss) => a.level - b.level,
    byDifficulty: (a: Boss, b: Boss) => {
      const difficultyOrder = { easy: 1, normal: 2, hard: 3, chaos: 4, extreme: 5 };
      return difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty];
    },
  },
};

// Data aggregation helpers
export const aggregationHelpers = {
  getCharacterStats: (character: Character, tasks: Task[]) => {
    const characterTasks = tasks.filter(task => task.character === character.name);
    const completedTasks = characterTasks.filter(task => task.completed).length;
    const totalTasks = characterTasks.length;

    return {
      completed: completedTasks,
      total: totalTasks,
      completionRate: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
    };
  },

  getTaskStats: (tasks: Task[]) => {
    const completed = tasks.filter(task => task.completed).length;
    const total = tasks.length;

    const byFrequency = {
      daily: tasks.filter(task => task.frequency === 'daily'),
      weekly: tasks.filter(task => task.frequency === 'weekly'),
      monthly: tasks.filter(task => task.frequency === 'monthly'),
    };

    return {
      total,
      completed,
      completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
      byFrequency: {
        daily: {
          total: byFrequency.daily.length,
          completed: byFrequency.daily.filter(t => t.completed).length,
        },
        weekly: {
          total: byFrequency.weekly.length,
          completed: byFrequency.weekly.filter(t => t.completed).length,
        },
        monthly: {
          total: byFrequency.monthly.length,
          completed: byFrequency.monthly.filter(t => t.completed).length,
        },
      },
    };
  },
};
