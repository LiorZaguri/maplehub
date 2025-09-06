import { useState, useEffect, useCallback } from 'react';
import { useLocalStorageArray } from './useLocalStorage';

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

export interface TaskTemplate {
  name: string;
  category: string;
  frequency: 'daily' | 'weekly' | 'monthly';
}

export interface UseTaskManagementOptions {
  storageKey?: string;
  templates?: TaskTemplate[];
}

export function useTaskManagement(options: UseTaskManagementOptions = {}) {
  const { storageKey = 'maplehub_tasks', templates = [] } = options;

  const [tasks, setTasks, addTask, removeTaskByIndex, updateTaskByIndex] = useLocalStorageArray<Task>(storageKey, []);
  const [enabledTasksByCharacter, setEnabledTasksByCharacter] = useState<Record<string, Record<string, boolean>>>({});
  const [collapsedSections, setCollapsedSections] = useState<Record<string, Record<string, boolean>>>({});
  const [hiddenCharacters, setHiddenCharacters] = useState<Set<string>>(new Set());

  // Load additional data from localStorage
  useEffect(() => {
    try {
      const storedEnabled = localStorage.getItem('maplehub_enabled_tasks');
      if (storedEnabled) {
        setEnabledTasksByCharacter(JSON.parse(storedEnabled));
      }

      const storedCollapsed = localStorage.getItem('maplehub_collapsed_sections');
      if (storedCollapsed) {
        setCollapsedSections(JSON.parse(storedCollapsed));
      }

      const storedHidden = localStorage.getItem('maplehub_hidden_characters_tasktracker');
      if (storedHidden) {
        setHiddenCharacters(new Set(JSON.parse(storedHidden)));
      }
    } catch (error) {
      console.error('Failed to load task management data:', error);
    }
  }, []);

  // Save additional data to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('maplehub_enabled_tasks', JSON.stringify(enabledTasksByCharacter));
    } catch (error) {
      console.error('Failed to save enabled tasks:', error);
    }
  }, [enabledTasksByCharacter]);

  useEffect(() => {
    try {
      localStorage.setItem('maplehub_collapsed_sections', JSON.stringify(collapsedSections));
    } catch (error) {
      console.error('Failed to save collapsed sections:', error);
    }
  }, [collapsedSections]);

  useEffect(() => {
    try {
      localStorage.setItem('maplehub_hidden_characters_tasktracker', JSON.stringify([...hiddenCharacters]));
    } catch (error) {
      console.error('Failed to save hidden characters:', error);
    }
  }, [hiddenCharacters]);

  // Add a new task
  const createTask = useCallback((taskData: Omit<Task, 'id' | 'createdAt' | 'dueDate'>) => {
    const newTask: Task = {
      ...taskData,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      dueDate: new Date().toISOString().split('T')[0],
      createdAt: new Date().toISOString(),
    };

    addTask(newTask);
    return newTask;
  }, [addTask]);

  // Update a task
  const updateTask = useCallback((taskId: string, updates: Partial<Task>) => {
    const taskIndex = tasks.findIndex(task => task.id === taskId);
    if (taskIndex !== -1) {
      const updatedTask = { ...tasks[taskIndex], ...updates };
      updateTaskByIndex(taskIndex, updatedTask);
    }
  }, [tasks, updateTaskByIndex]);

  // Remove a task
  const removeTask = useCallback((taskId: string) => {
    const taskIndex = tasks.findIndex(task => task.id === taskId);
    if (taskIndex !== -1) {
      removeTaskByIndex(taskIndex);
    }
  }, [tasks, removeTaskByIndex]);

  // Toggle task completion
  const toggleTaskComplete = useCallback((taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      updateTask(taskId, { completed: !task.completed });
    }
  }, [tasks, updateTask]);

  // Get tasks for a specific character
  const getCharacterTasks = useCallback((characterName: string, frequency?: 'daily' | 'weekly' | 'monthly') => {
    return tasks.filter(task =>
      task.character === characterName &&
      (!frequency || task.frequency === frequency)
    );
  }, [tasks]);

  // Get task statistics
  const getTaskStats = useCallback(() => {
    const visibleTasks = tasks.filter(task => !hiddenCharacters.has(task.character));

    const total = visibleTasks.length;
    const completed = visibleTasks.filter(task => task.completed).length;
    const dailyCompleted = visibleTasks.filter(task => task.frequency === 'daily' && task.completed).length;
    const dailyTotal = visibleTasks.filter(task => task.frequency === 'daily').length;
    const weeklyCompleted = visibleTasks.filter(task => task.frequency === 'weekly' && task.completed).length;
    const weeklyTotal = visibleTasks.filter(task => task.frequency === 'weekly').length;

    return { total, completed, dailyCompleted, dailyTotal, weeklyCompleted, weeklyTotal };
  }, [tasks, hiddenCharacters]);

  // Reset tasks by frequency
  const resetTasks = useCallback((frequency: 'daily' | 'weekly' | 'monthly') => {
    const updatedTasks = tasks.map(task =>
      task.frequency === frequency ? { ...task, completed: false } : task
    );
    setTasks(updatedTasks);
  }, [tasks, setTasks]);

  // Apply task presets for a character
  const applyTaskPresets = useCallback((characterName: string) => {
    const characterEnabled = enabledTasksByCharacter[characterName] || {};
    const newTasks: Task[] = [];
    const existingTaskNames = new Set(tasks.filter(t => t.character === characterName).map(t => t.name));

    templates.forEach(template => {
      if (characterEnabled[template.name] && !existingTaskNames.has(template.name)) {
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

    // Remove tasks that are no longer enabled
    const tasksToKeep = tasks.filter(task =>
      task.character !== characterName ||
      characterEnabled[task.name]
    );

    setTasks([...tasksToKeep, ...newTasks]);
  }, [enabledTasksByCharacter, tasks, templates, setTasks]);

  // Toggle section collapse
  const toggleSectionCollapse = useCallback((characterName: string, section: 'daily' | 'weekly' | 'monthly') => {
    setCollapsedSections(prev => ({
      ...prev,
      [characterName]: {
        ...prev[characterName],
        [section]: !prev[characterName]?.[section]
      }
    }));
  }, []);

  // Check if section is collapsed
  const isSectionCollapsed = useCallback((characterName: string, section: 'daily' | 'weekly' | 'monthly') => {
    return collapsedSections[characterName]?.[section] || false;
  }, [collapsedSections]);

  // Hide/show character
  const toggleCharacterVisibility = useCallback((characterName: string) => {
    setHiddenCharacters(prev => {
      const newSet = new Set(prev);
      if (newSet.has(characterName)) {
        newSet.delete(characterName);
      } else {
        newSet.add(characterName);
      }
      return newSet;
    });
  }, []);

  // Update enabled tasks for character
  const updateEnabledTasks = useCallback((characterName: string, taskName: string, enabled: boolean) => {
    setEnabledTasksByCharacter(prev => ({
      ...prev,
      [characterName]: {
        ...prev[characterName],
        [taskName]: enabled
      }
    }));
  }, []);

  return {
    tasks,
    enabledTasksByCharacter,
    collapsedSections,
    hiddenCharacters,
    createTask,
    updateTask,
    removeTask,
    toggleTaskComplete,
    getCharacterTasks,
    getTaskStats,
    resetTasks,
    applyTaskPresets,
    toggleSectionCollapse,
    isSectionCollapsed,
    toggleCharacterVisibility,
    updateEnabledTasks,
  };
}
