import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import {
  Character,
  Task,
  TaskStats,
  FilterType,
  CollapsedSections,
  EnabledTasks,
  TaskPresets
} from '../types/taskTracker';
import { STORAGE_KEYS, DEFAULTS, UI_CONSTANTS } from '../constants/taskTracker';
import { taskTemplates } from '@/data/taskTemplates';
import {
  getTaskStats,
  getFilteredCharacters,
  applyTaskPresets,
  validateTask
} from '../utils/taskUtils';
import { formatTimeRemaining } from '@/utils/timeUtils';
import {
  loadTasks,
  saveTasks,
  loadEnabledTasks,
  saveEnabledTasks,
  loadTaskPresets,
  saveTaskPresets,
  loadCollapsedSections,
  saveCollapsedSections,
  loadHiddenCharacters,
  saveHiddenCharacters,
  loadExpandedTaskLists,
  saveExpandedTaskLists,
  loadCharacterOrder,
  saveCharacterOrder
} from '../services/taskTrackerService';

export function useTaskTracker() {
  const { toast } = useToast();

  // Core state
  const [characters, setCharacters] = useState<Character[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.ROSTER);
      if (stored) {
        const parsedCharacters = JSON.parse(stored) as Character[];
        return parsedCharacters;
      }
      return [];
    } catch (error) {
      console.error('Failed to load characters:', error);
      return [];
    }
  });

  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedCharacter, setSelectedCharacter] = useState<string>('');
  const [taskFilter, setTaskFilter] = useState<FilterType>('all');

  // UI state
  const [showTaskSelector, setShowTaskSelector] = useState(false);
  const [selectedCharacterForTasks, setSelectedCharacterForTasks] = useState<string>('');
  const [showHideConfirmation, setShowHideConfirmation] = useState(false);
  const [characterToHide, setCharacterToHide] = useState<string>('');
  const [selectedTaskFrequency, setSelectedTaskFrequency] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [showReorderDialog, setShowReorderDialog] = useState(false);
  const [reorderCharacters, setReorderCharacters] = useState<Character[]>([]);
  const [isLoadingOrder, setIsLoadingOrder] = useState(true);

  // Task management state
  const [enabledTasksByCharacter, setEnabledTasksByCharacter] = useState<EnabledTasks>(() => loadEnabledTasks());
  const [taskPresets, setTaskPresets] = useState<TaskPresets>(() => loadTaskPresets());
  const [collapsedSections, setCollapsedSections] = useState<CollapsedSections>(() => loadCollapsedSections());
  const [hiddenCharacters, setHiddenCharacters] = useState<Set<string>>(() => loadHiddenCharacters());
  const [expandedTaskLists, setExpandedTaskLists] = useState<Set<string>>(() => loadExpandedTaskLists());

  // Computed values
  const stats = getTaskStats(tasks, hiddenCharacters);
  const filteredCharacters = getFilteredCharacters(characters, tasks, taskFilter, hiddenCharacters);

  // Effects for data persistence and loading
  useEffect(() => {
    const handleStorageChange = () => {
      try {
        const stored = localStorage.getItem(STORAGE_KEYS.ROSTER);
        if (!stored) {
          setIsLoadingOrder(false);
          return;
        }
        const parsedCharacters = JSON.parse(stored) as Character[];

        // Load saved character order for TaskTracker
        const savedOrder = loadCharacterOrder();
        if (savedOrder) {
          const orderedCharacters = savedOrder
            .map(id => parsedCharacters.find(c => c.id === id))
            .filter(Boolean) as Character[];
          const newCharacters = parsedCharacters.filter(c => !savedOrder.includes(c.id));
          setCharacters([...orderedCharacters, ...newCharacters]);
        } else {
          const mainCharacter = parsedCharacters.find(c => c.isMain);
          const otherCharacters = parsedCharacters.filter(c => !c.isMain);
          setCharacters(mainCharacter ? [mainCharacter, ...otherCharacters] : parsedCharacters);
        }
        setIsLoadingOrder(false);
      } catch {
        setIsLoadingOrder(false);
      }
    };

    handleStorageChange();
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('rosterUpdate', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('rosterUpdate', handleStorageChange);
    };
  }, []);

  useEffect(() => {
    if (characters.length > 0 && !selectedCharacter) {
      setSelectedCharacter(characters[0].name);
    }
  }, [characters, selectedCharacter]);

  useEffect(() => {
    try {
      const loadedTasks = loadTasks();
      const validTasks = loadedTasks.filter((task: Task) =>
        taskTemplates.some(template =>
          template.name === task.name &&
          template.category === task.category &&
          template.frequency === task.frequency
        )
      );

      if (validTasks.length !== loadedTasks.length) {
        saveTasks(validTasks);
        toast({
          title: "Tasks Cleaned Up",
          description: `Removed ${loadedTasks.length - validTasks.length} invalid task(s)`,
          className: "progress-complete",
          duration: UI_CONSTANTS.TOAST_DURATION
        });
      }

      setTasks(validTasks);
    } catch (error) {
      console.error('Failed to load tasks:', error);
    }
  }, [toast]);

  // Persistence effects
  useEffect(() => {
    saveTasks(tasks);
  }, [tasks]);

  useEffect(() => {
    saveEnabledTasks(enabledTasksByCharacter);
  }, [enabledTasksByCharacter]);

  useEffect(() => {
    saveCollapsedSections(collapsedSections);
  }, [collapsedSections]);

  useEffect(() => {
    saveHiddenCharacters(hiddenCharacters);
  }, [hiddenCharacters]);

  useEffect(() => {
    saveExpandedTaskLists(expandedTaskLists);
  }, [expandedTaskLists]);

  useEffect(() => {
    saveTaskPresets(taskPresets);
  }, [taskPresets]);

  // Task management functions
  const toggleTaskComplete = (taskId: string) => {
    setTasks(prev => {
      const updatedTasks = prev.map(task =>
        task.id === taskId ? { ...task, completed: !task.completed } : task
      );

      // Get the updated task for toast
      const updatedTask = updatedTasks.find(t => t.id === taskId);
      if (updatedTask) {
        toast({
          title: updatedTask.completed ? "Task Completed" : "Task Unmarked",
          description: `${updatedTask.name} for ${updatedTask.character}`,
          className: updatedTask.completed ? "progress-complete" : "progress-incomplete",
          duration: UI_CONSTANTS.TOAST_DURATION
        });
      }

      return updatedTasks;
    });
  };

  const resetTasks = (frequency: 'daily' | 'weekly' | 'monthly') => {
    setTasks(prev => prev.map(task =>
      task.frequency === frequency ? { ...task, completed: false } : task
    ));

    toast({
      title: `${frequency} Reset`,
      description: `All ${frequency} tasks have been reset!`,
      className: "progress-complete",
      duration: UI_CONSTANTS.TOAST_DURATION
    });
  };

  const applyTaskPresetsToCharacter = (characterName: string) => {
    const characterEnabled = enabledTasksByCharacter[characterName] || {};
    const { newTasks, tasksToRemove } = applyTaskPresets(characterName, characterEnabled, tasks);

    // Remove disabled tasks
    setTasks(prev => prev.filter(task => !tasksToRemove.includes(task.id)));

    // Add new tasks
    if (newTasks.length > 0) {
      setTasks(prev => [...prev, ...newTasks]);
      toast({
        title: "Tasks Applied",
        description: `Added ${newTasks.length} task(s) for ${characterName}`,
        className: "progress-complete",
        duration: UI_CONSTANTS.TOAST_DURATION
      });
    }
  };

  const toggleSectionCollapse = (characterName: string, section: 'daily' | 'weekly' | 'monthly') => {
    setCollapsedSections(prev => ({
      ...prev,
      [characterName]: {
        ...prev[characterName],
        [section]: !prev[characterName]?.[section]
      }
    }));
  };

  const isSectionCollapsed = (characterName: string, section: 'daily' | 'weekly' | 'monthly') => {
    return collapsedSections[characterName]?.[section] || false;
  };

  const handleReorderCharacters = () => {
    setReorderCharacters([...characters]);
    setShowReorderDialog(true);
  };

  const saveCharacterOrderToStorage = () => {
    const characterOrder = reorderCharacters.map(c => c.id);
    saveCharacterOrder(characterOrder);

    const orderedCharacters = reorderCharacters.map(char => {
      const original = characters.find(c => c.id === char.id);
      return original || char;
    });
    setCharacters(orderedCharacters);

    toast({
      title: "Order Updated",
      description: "Character order has been saved for Task Tracker",
      className: "progress-complete",
      duration: UI_CONSTANTS.TOAST_DURATION
    });
  };

  return {
    // State
    characters,
    tasks,
    stats,
    filteredCharacters,
    taskFilter,
    hiddenCharacters,
    expandedTaskLists,
    collapsedSections,
    enabledTasksByCharacter,
    taskPresets,

    // UI state
    showTaskSelector,
    selectedCharacterForTasks,
    showHideConfirmation,
    characterToHide,
    selectedTaskFrequency,
    showReorderDialog,
    reorderCharacters,
    isLoadingOrder,

    // Actions
    setTaskFilter,
    setShowTaskSelector,
    setSelectedCharacterForTasks,
    setSelectedTaskFrequency,
    setShowReorderDialog,
    setReorderCharacters,

    // Task management
    toggleTaskComplete,
    resetTasks,
    applyTaskPresetsToCharacter,
    toggleSectionCollapse,
    isSectionCollapsed,
    handleReorderCharacters,
    saveCharacterOrderToStorage,

    // Character visibility
    setHiddenCharacters,
    setExpandedTaskLists,
    setEnabledTasksByCharacter,
    setTaskPresets,
  };
}
