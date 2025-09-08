import { Character, Task, EnabledTasks, TaskPresets, CollapsedSections } from '../types/taskTracker';
import { createObjectStorage, createArrayStorage } from '@/utils/storageUtils';

// Storage keys
export const STORAGE_KEYS = {
  ROSTER: 'maplehub_roster',
  TASKS: 'maplehub_tasks',
  ENABLED_TASKS: 'maplehub_enabled_tasks',
  TASK_PRESETS: 'maplehub_task_presets',
  COLLAPSED_SECTIONS: 'maplehub_collapsed_sections',
  HIDDEN_CHARACTERS: 'maplehub_hidden_characters_tasktracker',
  EXPANDED_TASK_LISTS: 'maplehub_expanded_task_lists',
  CHARACTER_ORDER: 'maplehub_tasktracker_character_order',
} as const;

// Typed storage instances
const tasksStorage = createArrayStorage<Task>(STORAGE_KEYS.TASKS, []);
const enabledTasksStorage = createObjectStorage<EnabledTasks>(STORAGE_KEYS.ENABLED_TASKS, {});
const taskPresetsStorage = createObjectStorage<TaskPresets>(STORAGE_KEYS.TASK_PRESETS, {});
const collapsedSectionsStorage = createObjectStorage<CollapsedSections>(STORAGE_KEYS.COLLAPSED_SECTIONS, {});
const hiddenCharactersStorage = createArrayStorage<string>(STORAGE_KEYS.HIDDEN_CHARACTERS, []);
const expandedTaskListsStorage = createArrayStorage<string>(STORAGE_KEYS.EXPANDED_TASK_LISTS, []);
const characterOrderStorage = createArrayStorage<string>(STORAGE_KEYS.CHARACTER_ORDER, []);

/**
 * Load tasks from localStorage
 */
export const loadTasks = (): Task[] => tasksStorage.load();

/**
 * Save tasks to localStorage
 */
export const saveTasks = (tasks: Task[]): void => tasksStorage.save(tasks);

/**
 * Load enabled tasks from localStorage
 */
export const loadEnabledTasks = (): EnabledTasks => enabledTasksStorage.load();

/**
 * Save enabled tasks to localStorage
 */
export const saveEnabledTasks = (enabledTasks: EnabledTasks): void => enabledTasksStorage.save(enabledTasks);

/**
 * Load task presets from localStorage
 */
export const loadTaskPresets = (): TaskPresets => taskPresetsStorage.load();

/**
 * Save task presets to localStorage
 */
export const saveTaskPresets = (taskPresets: TaskPresets): void => taskPresetsStorage.save(taskPresets);

/**
 * Load collapsed sections from localStorage
 */
export const loadCollapsedSections = (): CollapsedSections => collapsedSectionsStorage.load();

/**
 * Save collapsed sections to localStorage
 */
export const saveCollapsedSections = (collapsedSections: CollapsedSections): void => collapsedSectionsStorage.save(collapsedSections);

/**
 * Load hidden characters from localStorage
 */
export const loadHiddenCharacters = (): Set<string> => {
  const array = hiddenCharactersStorage.load();
  return new Set(array);
};

/**
 * Save hidden characters to localStorage
 */
export const saveHiddenCharacters = (hiddenCharacters: Set<string>): void => {
  hiddenCharactersStorage.save([...hiddenCharacters]);
};

/**
 * Load expanded task lists from localStorage
 */
export const loadExpandedTaskLists = (): Set<string> => {
  const array = expandedTaskListsStorage.load();
  return new Set(array);
};

/**
 * Save expanded task lists to localStorage
 */
export const saveExpandedTaskLists = (expandedTaskLists: Set<string>): void => {
  expandedTaskListsStorage.save([...expandedTaskLists]);
};

/**
 * Load character order from localStorage
 */
export const loadCharacterOrder = (): string[] | null => {
  const order = characterOrderStorage.load();
  return order.length > 0 ? order : null;
};

/**
 * Save character order to localStorage
 */
export const saveCharacterOrder = (order: string[]): void => characterOrderStorage.save(order);
