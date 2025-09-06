// Filtering and sorting utilities for different data types

import { Character } from '@/hooks/useCharacterData';
import { Task } from '@/hooks/useTaskManagement';
import { BossMeta } from '@/lib/bossData';

export type CharacterFilterType = 'all' | 'finished' | 'unfinished' | 'hidden';
export type TaskFilterType = 'all' | 'finished' | 'unfinished' | 'hidden';
export type BossFilterType = 'all' | 'finished' | 'unfinished';

/**
 * Filter characters based on completion status for tasks
 */
export function filterCharactersByTaskCompletion(
  characters: Character[],
  tasks: Task[],
  filterType: CharacterFilterType,
  hiddenCharacters: Set<string>
): Character[] {
  switch (filterType) {
    case 'finished':
      return characters.filter(char => {
        const characterTasks = tasks.filter(task => task.character === char.name);
        const completedTasks = characterTasks.filter(task => task.completed).length;
        return characterTasks.length > 0 && completedTasks === characterTasks.length;
      });
    case 'unfinished':
      return characters.filter(char => {
        const characterTasks = tasks.filter(task => task.character === char.name);
        const completedTasks = characterTasks.filter(task => task.completed).length;
        return characterTasks.length === 0 || completedTasks < characterTasks.length;
      });
    case 'hidden':
      return characters.filter(char => hiddenCharacters.has(char.name));
    case 'all':
    default:
      return characters;
  }
}

/**
 * Filter characters based on completion status for bosses
 */
export function filterCharactersByBossCompletion(
  characters: Character[],
  bossProgress: Record<string, Record<string, boolean>>,
  enabledByCharacter: Record<string, Record<string, boolean>>,
  bossList: BossMeta[],
  filterType: CharacterFilterType
): Character[] {
  switch (filterType) {
    case 'finished':
      return characters.filter(char => {
        const stats = getBossCompletionStats(char.name, bossProgress, enabledByCharacter, bossList);
        return stats.percentage === 100 && stats.total > 0;
      });
    case 'unfinished':
      return characters.filter(char => {
        const stats = getBossCompletionStats(char.name, bossProgress, enabledByCharacter, bossList);
        return stats.percentage < 100 || stats.total === 0;
      });
    case 'all':
    default:
      return characters;
  }
}

/**
 * Get boss completion statistics for a character
 */
export function getBossCompletionStats(
  characterName: string,
  bossProgress: Record<string, Record<string, boolean>>,
  enabledByCharacter: Record<string, Record<string, boolean>>,
  bossList: BossMeta[]
): { completed: number; total: number; percentage: number } {
  const bosses = bossProgress[characterName] || {};
  const enabled = enabledByCharacter[characterName] || {};

  let considered = bossList.filter(b => {
    const hasAny = Object.keys(enabled).length > 0;
    const isEnabled = hasAny ? !!enabled[b.name] : (b.defaultEnabled ?? true);
    return isEnabled;
  });

  // For weekly stats, only include monthly bosses if they are checked
  const isMonthly = (bossName: string) => bossName.includes('Black Mage');
  considered = considered.filter(b => !isMonthly(b.name) || bosses[b.name]);

  const completed = considered.filter(b => bosses[b.name]).length;
  const total = considered.length;
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

  return { completed, total, percentage };
}

/**
 * Filter tasks by various criteria
 */
export function filterTasks(
  tasks: Task[],
  filters: {
    character?: string;
    frequency?: 'daily' | 'weekly' | 'monthly';
    category?: string;
    completed?: boolean;
    priority?: 'low' | 'medium' | 'high';
  }
): Task[] {
  return tasks.filter(task => {
    if (filters.character && task.character !== filters.character) return false;
    if (filters.frequency && task.frequency !== filters.frequency) return false;
    if (filters.category && task.category !== filters.category) return false;
    if (filters.completed !== undefined && task.completed !== filters.completed) return false;
    if (filters.priority && task.priority !== filters.priority) return false;
    return true;
  });
}

/**
 * Sort characters by various criteria
 */
export function sortCharacters(
  characters: Character[],
  sortBy: 'name' | 'level' | 'class' | 'lastUpdated' = 'name',
  sortOrder: 'asc' | 'desc' = 'asc'
): Character[] {
  return [...characters].sort((a, b) => {
    let comparison = 0;

    switch (sortBy) {
      case 'name':
        comparison = a.name.localeCompare(b.name);
        break;
      case 'level':
        comparison = a.level - b.level;
        break;
      case 'class':
        comparison = a.class.localeCompare(b.class);
        break;
      case 'lastUpdated':
        comparison = new Date(a.lastUpdated).getTime() - new Date(b.lastUpdated).getTime();
        break;
      default:
        return 0;
    }

    return sortOrder === 'desc' ? -comparison : comparison;
  });
}

/**
 * Sort tasks by various criteria
 */
export function sortTasks(
  tasks: Task[],
  sortBy: 'name' | 'dueDate' | 'priority' | 'category' | 'createdAt' = 'dueDate',
  sortOrder: 'asc' | 'desc' = 'asc'
): Task[] {
  return [...tasks].sort((a, b) => {
    let comparison = 0;

    switch (sortBy) {
      case 'name':
        comparison = a.name.localeCompare(b.name);
        break;
      case 'dueDate':
        comparison = new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
        break;
      case 'priority':
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        comparison = (priorityOrder[a.priority || 'medium'] || 2) - (priorityOrder[b.priority || 'medium'] || 2);
        break;
      case 'category':
        comparison = a.category.localeCompare(b.category);
        break;
      case 'createdAt':
        comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        break;
      default:
        return 0;
    }

    return sortOrder === 'desc' ? -comparison : comparison;
  });
}

/**
 * Sort bosses by value (mesos per person)
 */
export function sortBossesByValue(
  bosses: BossMeta[],
  characterName: string,
  partySizes: Record<string, Record<string, number>>
): BossMeta[] {
  return [...bosses].sort((a, b) => {
    const aParty = partySizes[characterName]?.[a.name] || 1;
    const bParty = partySizes[characterName]?.[b.name] || 1;
    const aValue = Math.floor(a.mesos / aParty);
    const bValue = Math.floor(b.mesos / bParty);
    return bValue - aValue;
  });
}

/**
 * Group tasks by frequency
 */
export function groupTasksByFrequency(tasks: Task[]): Record<'daily' | 'weekly' | 'monthly', Task[]> {
  return tasks.reduce((groups, task) => {
    groups[task.frequency].push(task);
    return groups;
  }, { daily: [], weekly: [], monthly: [] } as Record<'daily' | 'weekly' | 'monthly', Task[]>);
}

/**
 * Group tasks by category
 */
export function groupTasksByCategory(tasks: Task[]): Record<string, Task[]> {
  return tasks.reduce((groups, task) => {
    if (!groups[task.category]) {
      groups[task.category] = [];
    }
    groups[task.category].push(task);
    return groups;
  }, {} as Record<string, Task[]>);
}

/**
 * Search characters by name or class
 */
export function searchCharacters(characters: Character[], query: string): Character[] {
  if (!query.trim()) return characters;

  const lowerQuery = query.toLowerCase();
  return characters.filter(char =>
    char.name.toLowerCase().includes(lowerQuery) ||
    char.class.toLowerCase().includes(lowerQuery)
  );
}

/**
 * Search tasks by name or category
 */
export function searchTasks(tasks: Task[], query: string): Task[] {
  if (!query.trim()) return tasks;

  const lowerQuery = query.toLowerCase();
  return tasks.filter(task =>
    task.name.toLowerCase().includes(lowerQuery) ||
    task.category.toLowerCase().includes(lowerQuery)
  );
}

/**
 * Get unique categories from tasks
 */
export function getTaskCategories(tasks: Task[]): string[] {
  return Array.from(new Set(tasks.map(task => task.category))).sort();
}

/**
 * Get task statistics
 */
export function getTaskStatistics(tasks: Task[]): {
  total: number;
  completed: number;
  pending: number;
  overdue: number;
  byFrequency: Record<'daily' | 'weekly' | 'monthly', { total: number; completed: number }>;
  byPriority: Record<'low' | 'medium' | 'high', number>;
} {
  const now = new Date();
  const today = now.toISOString().split('T')[0];

  const byFrequency = tasks.reduce((acc, task) => {
    acc[task.frequency].total++;
    if (task.completed) acc[task.frequency].completed++;
    return acc;
  }, {
    daily: { total: 0, completed: 0 },
    weekly: { total: 0, completed: 0 },
    monthly: { total: 0, completed: 0 }
  });

  const byPriority = tasks.reduce((acc, task) => {
    const priority = task.priority || 'medium';
    acc[priority]++;
    return acc;
  }, { low: 0, medium: 0, high: 0 });

  const overdue = tasks.filter(task =>
    !task.completed && new Date(task.dueDate) < now
  ).length;

  return {
    total: tasks.length,
    completed: tasks.filter(t => t.completed).length,
    pending: tasks.filter(t => !t.completed).length,
    overdue,
    byFrequency,
    byPriority
  };
}
