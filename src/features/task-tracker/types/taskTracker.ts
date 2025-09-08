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

export interface TaskStats {
  total: number;
  completed: number;
  dailyCompleted: number;
  dailyTotal: number;
  weeklyCompleted: number;
  weeklyTotal: number;
}

export type FilterType = 'all' | 'finished' | 'unfinished' | 'hidden';

export interface NewTask {
  name: string;
  character: string;
  frequency: 'daily' | 'weekly' | 'monthly';
  category: string;
  priority?: 'low' | 'medium' | 'high';
  notes?: string;
}

export interface CollapsedSections {
  [characterName: string]: {
    daily?: boolean;
    weekly?: boolean;
    monthly?: boolean;
  };
}

export interface EnabledTasks {
  [characterName: string]: {
    [taskName: string]: boolean;
  };
}

export interface TaskPresets {
  [presetName: string]: {
    [taskName: string]: boolean;
  };
}
