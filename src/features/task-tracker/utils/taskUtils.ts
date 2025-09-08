import { Task, TaskStats, Character } from '../types/taskTracker';
import { taskTemplates, TaskTemplate } from '@/data/taskTemplates';

/**
 * Calculate task statistics from a list of tasks
 */
export function getTaskStats(tasks: Task[], hiddenCharacters: Set<string> = new Set()): TaskStats {
  // Filter out tasks from hidden characters
  const visibleTasks = tasks.filter(task => !hiddenCharacters.has(task.character));

  const total = visibleTasks.length;
  const completed = visibleTasks.filter(task => task.completed).length;
  const dailyCompleted = visibleTasks.filter(task => task.frequency === 'daily' && task.completed).length;
  const dailyTotal = visibleTasks.filter(task => task.frequency === 'daily').length;
  const weeklyCompleted = visibleTasks.filter(task => task.frequency === 'weekly' && task.completed).length;
  const weeklyTotal = visibleTasks.filter(task => task.frequency === 'weekly').length;

  return { total, completed, dailyCompleted, dailyTotal, weeklyCompleted, weeklyTotal };
}

/**
 * Get tasks for a specific character
 */
export function getCharacterTasks(tasks: Task[], characterName: string, frequency?: 'daily' | 'weekly' | 'monthly'): Task[] {
  return tasks.filter(task =>
    task.character === characterName &&
    (!frequency || task.frequency === frequency)
  );
}

/**
 * Filter characters based on completion status
 */
export function getFilteredCharacters(
  characters: Character[],
  tasks: Task[],
  filter: 'all' | 'finished' | 'unfinished' | 'hidden',
  hiddenCharacters: Set<string> = new Set()
): Character[] {
  switch (filter) {
    case 'finished':
      return characters.filter(char => {
        const characterTasks = getCharacterTasks(tasks, char.name);
        const completedTasks = characterTasks.filter(task => task.completed).length;
        return characterTasks.length > 0 && completedTasks === characterTasks.length;
      });
    case 'unfinished':
      return characters.filter(char => {
        const characterTasks = getCharacterTasks(tasks, char.name);
        const completedTasks = characterTasks.filter(task => task.completed).length;
        return characterTasks.length === 0 || completedTasks < characterTasks.length;
      });
    case 'hidden':
      return characters.filter(char => hiddenCharacters.has(char.name));
    case 'all':
    default:
      return characters.filter(char => !hiddenCharacters.has(char.name));
  }
}

/**
 * Apply task presets to create actual tasks for a character
 */
export function applyTaskPresets(
  characterName: string,
  enabledTasks: Record<string, boolean>,
  existingTasks: Task[]
): { newTasks: Task[], tasksToRemove: string[] } {
  const newTasks: Task[] = [];
  const existingTaskNames = new Set(existingTasks.filter(t => t.character === characterName).map(t => t.name));

  // Create tasks for enabled presets that don't already exist
  taskTemplates.forEach(template => {
    if (enabledTasks[template.name] && !existingTaskNames.has(template.name)) {
      newTasks.push({
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        name: template.name,
        character: characterName,
        frequency: template.frequency,
        category: template.category,
        completed: false,
        dueDate: new Date().toISOString().split('T')[0],
        createdAt: new Date().toISOString(),
        priority: 'medium'
      });
    }
  });

  // Find tasks to remove (disabled presets)
  const tasksToRemove = existingTasks
    .filter(task => task.character === characterName && !enabledTasks[task.name])
    .map(task => task.id);

  return { newTasks, tasksToRemove };
}

/**
 * Validate task data
 */
export function validateTask(task: Partial<Task>): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!task.name?.trim()) {
    errors.push('Task name is required');
  }

  if (!task.character?.trim()) {
    errors.push('Character name is required');
  }

  if (!['daily', 'weekly', 'monthly'].includes(task.frequency!)) {
    errors.push('Invalid frequency');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Get priority color class
 */
export function getPriorityColor(priority?: string): string {
  switch (priority) {
    case 'high': return 'text-red-500 border-red-200 bg-red-50';
    case 'medium': return 'text-yellow-600 border-yellow-200 bg-yellow-50';
    case 'low': return 'text-green-600 border-green-200 bg-green-50';
    default: return 'text-gray-600 border-gray-200 bg-gray-50';
  }
}

/**
 * Get priority icon
 */
export function getPriorityIcon(priority?: string): string {
  switch (priority) {
    case 'high': return '🔴';
    case 'medium': return '🟡';
    case 'low': return '🟢';
    default: return '⚪';
  }
}

/**
 * Get frequency badge color
 */
export function getFrequencyBadgeColor(frequency: string): string {
  switch (frequency) {
    case 'daily': return 'progress-complete';
    case 'weekly': return 'progress-partial';
    case 'monthly': return 'progress-incomplete';
    default: return 'secondary';
  }
}
