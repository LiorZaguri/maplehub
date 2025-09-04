import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { CheckSquare, Plus, Calendar, Target, RotateCcw, User, Clock, Star, Search, Filter, Zap, Bell, Edit3, Trash2, Copy, MoreHorizontal, Sparkles, Coins } from 'lucide-react';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { useToast } from '@/hooks/use-toast';
import Layout from '@/components/Layout';
import { getLevelProgress } from '@/lib/levels';

interface Character {
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

interface Task {
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

const TaskTracker = () => {
  const { toast } = useToast();

  // Current time state for real-time updates
  const [currentTime, setCurrentTime] = useState(new Date());

  const [characters, setCharacters] = useState<Character[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedCharacter, setSelectedCharacter] = useState<string>('');

  const [newTask, setNewTask] = useState({
    name: '',
    character: '',
    frequency: 'daily' as 'daily' | 'weekly' | 'monthly',
    category: 'Daily Quest',
    priority: 'medium' as 'low' | 'medium' | 'high',
    notes: ''
  });


  const [showTaskSelector, setShowTaskSelector] = useState(false);
  const [selectedCharacterForTasks, setSelectedCharacterForTasks] = useState<string>('');
  const [showHideConfirmation, setShowHideConfirmation] = useState(false);
  const [characterToHide, setCharacterToHide] = useState<string>('');
  const [characterTaskSelections, setCharacterTaskSelections] = useState<Record<string, Record<string, boolean>>>({});
  const [selectedTaskFrequency, setSelectedTaskFrequency] = useState<'daily' | 'weekly' | 'monthly'>('daily');

  // Task presets - which tasks are enabled for each character
  const [enabledTasksByCharacter, setEnabledTasksByCharacter] = useState<Record<string, Record<string, boolean>>>(() => {
    try {
      const stored = localStorage.getItem('maplehub_enabled_tasks');
      return stored ? (JSON.parse(stored) as Record<string, Record<string, boolean>>) : {};
    } catch {
      return {};
    }
  });

  // User-created preset templates
  const [taskPresets, setTaskPresets] = useState<Record<string, Record<string, boolean>>>(() => {
    try {
      const stored = localStorage.getItem('maplehub_task_presets');
      return stored ? (JSON.parse(stored) as Record<string, Record<string, boolean>>) : {};
    } catch {
      return {};
    }
  });

  // Collapsed sections state - tracks which task sections are collapsed for each character
  const [collapsedSections, setCollapsedSections] = useState<Record<string, Record<string, boolean>>>(() => {
    try {
      const stored = localStorage.getItem('maplehub_collapsed_sections');
      return stored ? (JSON.parse(stored) as Record<string, Record<string, boolean>>) : {};
    } catch {
      return {};
    }
  });

  // Filter state for character display
  const [taskFilter, setTaskFilter] = useState<FilterType>('all');

  type FilterType = 'all' | 'finished' | 'unfinished' | 'hidden';

  // Hidden characters state - tracks which characters are hidden
  const [hiddenCharacters, setHiddenCharacters] = useState<Set<string>>(() => {
    try {
      const stored = localStorage.getItem('maplehub_hidden_characters_tasktracker');
      return stored ? new Set(JSON.parse(stored)) : new Set();
    } catch {
      return new Set();
    }
  });

  const taskCategories = [
    'Daily Quest', 'Weekly Quest', 'Event', 'Grinding', 'Collection', 'Other'
  ];

  // Load characters from localStorage (same as BossTracker)
  useEffect(() => {
    try {
      const stored = localStorage.getItem("maplehub_roster");
      if (stored) {
        const parsedCharacters = JSON.parse(stored) as Character[];
        setCharacters(parsedCharacters);
        if (parsedCharacters.length > 0 && !selectedCharacter) {
          setSelectedCharacter(parsedCharacters[0].name);
          setNewTask(prev => ({ ...prev, character: parsedCharacters[0].name }));
        }
      }
    } catch (error) {
      console.error('Failed to load characters:', error);
    }
  }, []);

  // Load tasks from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem("maplehub_tasks");
      if (stored) {
        const loadedTasks = JSON.parse(stored);
        // Clean up tasks that don't have matching templates
        const validTasks = loadedTasks.filter((task: Task) =>
          taskTemplates.some(template =>
            template.name === task.name &&
            template.category === task.category &&
            template.frequency === task.frequency
          )
        );

        // If we removed any invalid tasks, save the cleaned list
        if (validTasks.length !== loadedTasks.length) {
          localStorage.setItem("maplehub_tasks", JSON.stringify(validTasks));
          toast({
            title: "Tasks Cleaned Up",
            description: `Removed ${loadedTasks.length - validTasks.length} invalid task(s)`,
            className: "progress-complete"
          });
        }

        setTasks(validTasks);
      }
    } catch (error) {
      console.error('Failed to load tasks:', error);
    }
  }, []);

  // Save tasks to localStorage
  useEffect(() => {
    try {
      localStorage.setItem("maplehub_tasks", JSON.stringify(tasks));
    } catch (error) {
      console.error('Failed to save tasks:', error);
    }
  }, [tasks]);

  // Save enabled tasks to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('maplehub_enabled_tasks', JSON.stringify(enabledTasksByCharacter));
    } catch (error) {
      console.error('Failed to save enabled tasks:', error);
    }
  }, [enabledTasksByCharacter]);

  // Save collapsed sections to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('maplehub_collapsed_sections', JSON.stringify(collapsedSections));
    } catch (error) {
      console.error('Failed to save collapsed sections:', error);
    }
  }, [collapsedSections]);

  // Save hidden characters to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('maplehub_hidden_characters_tasktracker', JSON.stringify([...hiddenCharacters]));
    } catch (error) {
      console.error('Failed to save hidden characters:', error);
    }
  }, [hiddenCharacters]);

  // Real-time clock update every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Update every 60 seconds (1 minute)

    return () => clearInterval(interval); // Cleanup on unmount
  }, []);

  // Apply presets to create actual tasks
  const applyTaskPresets = (characterName: string) => {
    const characterEnabled = enabledTasksByCharacter[characterName] || {};
    const newTasks: Task[] = [];
    const existingTaskNames = new Set(tasks.filter(t => t.character === characterName).map(t => t.name));

    // Create tasks for enabled presets that don't already exist
    taskTemplates.forEach(template => {
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

    if (newTasks.length > 0) {
      toast({
        title: "Tasks Applied",
        description: `Added ${newTasks.length} task(s) for ${characterName}`,
        className: "progress-complete"
      });
    }
  };

  const toggleTaskComplete = (taskId: string) => {
    setTasks(prev => prev.map(task =>
      task.id === taskId ? { ...task, completed: !task.completed } : task
    ));

    const task = tasks.find(t => t.id === taskId);
    if (task) {
      toast({
        title: task.completed ? "Task Unmarked" : "Task Completed",
        description: `${task.name} for ${task.character}`,
        className: task.completed ? "progress-incomplete" : "progress-complete"
      });
    }
  };

  const addTask = () => {
    if (!newTask.name.trim()) {
      toast({
        title: "Error",
        description: "Please enter a task name",
        variant: "destructive"
      });
      return;
    }

    if (!newTask.character) {
      toast({
        title: "Error",
        description: "Please select a character",
        variant: "destructive"
      });
      return;
    }

    const task: Task = {
      id: Date.now().toString(),
      ...newTask,
      completed: false,
      dueDate: new Date().toISOString().split('T')[0],
      createdAt: new Date().toISOString()
    };

    setTasks(prev => [...prev, task]);
    setNewTask({ ...newTask, name: '' });

    toast({
      title: "Task Added",
      description: `${task.name} added for ${task.character}`,
      className: "progress-complete"
    });
  };

  const resetTasks = (frequency: 'daily' | 'weekly' | 'monthly') => {
    setTasks(prev => prev.map(task =>
      task.frequency === frequency ? { ...task, completed: false } : task
    ));

    toast({
      title: `${frequency} Reset`,
      description: `All ${frequency} tasks have been reset!`,
      className: "progress-complete"
    });
  };

  const getTaskStats = () => {
    // Filter out tasks from hidden characters
    const visibleTasks = tasks.filter(task => !hiddenCharacters.has(task.character));

    const total = visibleTasks.length;
    const completed = visibleTasks.filter(task => task.completed).length;
    const dailyCompleted = visibleTasks.filter(task => task.frequency === 'daily' && task.completed).length;
    const dailyTotal = visibleTasks.filter(task => task.frequency === 'daily').length;
    const weeklyCompleted = visibleTasks.filter(task => task.frequency === 'weekly' && task.completed).length;
    const weeklyTotal = visibleTasks.filter(task => task.frequency === 'weekly').length;

    return { total, completed, dailyCompleted, dailyTotal, weeklyCompleted, weeklyTotal };
  };

  const stats = getTaskStats();

  const getFrequencyBadgeColor = (frequency: string) => {
    switch (frequency) {
      case 'daily': return 'progress-complete';
      case 'weekly': return 'progress-partial';
      case 'monthly': return 'progress-incomplete';
      default: return 'secondary';
    }
  };

  const getCharacterTasks = (characterName: string, frequency?: 'daily' | 'weekly' | 'monthly') => {
    return tasks.filter(task =>
      task.character === characterName &&
      (!frequency || task.frequency === frequency)
    );
  };

  const getCharacterByName = (name: string) => {
    return characters.find(char => char.name === name);
  };

  // Task Templates organized by categories
  const taskTemplates = [
    // 1. Event
    { name: 'Daily Gift', category: 'Event', frequency: 'daily' as const },
    { name: 'Challenger World Hunting Mission', category: 'Event', frequency: 'daily' as const },
    { name: 'Burning Express Check In', category: 'Event', frequency: 'daily' as const },
    { name: 'Night Troupe Coin Cap', category: 'Event', frequency: 'daily' as const },
    { name: 'Night Troupe Mu Lung Night Challenge', category: 'Event', frequency: 'weekly' as const },
    { name: 'Champion Double Up Cap Weekly Points', category: 'Event', frequency: 'weekly' as const },
    { name: 'Champion Double Up 3x Coin Checkin', category: 'Event', frequency: 'weekly' as const },

    // 2. Sacred Symbol Dailies
    { name: 'Cernium', category: 'Sacred Symbol Dailies', frequency: 'daily' as const },
    { name: 'Hotel Arcus', category: 'Sacred Symbol Dailies', frequency: 'daily' as const },
    { name: 'Odium', category: 'Sacred Symbol Dailies', frequency: 'daily' as const },
    { name: 'Shangri-La', category: 'Sacred Symbol Dailies', frequency: 'daily' as const },
    { name: 'Arteria', category: 'Sacred Symbol Dailies', frequency: 'daily' as const },
    { name: 'Carcion', category: 'Sacred Symbol Dailies', frequency: 'daily' as const },
    { name: 'Tallahart', category: 'Sacred Symbol Dailies', frequency: 'daily' as const },

    // 3. Arcane Symbol Dailies
    { name: 'Vanishing Journey', category: 'Arcane Symbol Dailies', frequency: 'daily' as const },
    { name: 'Chu Chu Island', category: 'Arcane Symbol Dailies', frequency: 'daily' as const },
    { name: 'Lachelin', category: 'Arcane Symbol Dailies', frequency: 'daily' as const },
    { name: 'Arcana', category: 'Arcane Symbol Dailies', frequency: 'daily' as const },
    { name: 'Morass', category: 'Arcane Symbol Dailies', frequency: 'daily' as const },
    { name: 'Esfera', category: 'Arcane Symbol Dailies', frequency: 'daily' as const },
    { name: 'Tenebris', category: 'Arcane Symbol Dailies', frequency: 'daily' as const },

    // 4. 6th Job
    { name: 'Erda\'s Request', category: '6th Job', frequency: 'daily' as const },
    { name: 'Sol Erda Booster', category: '6th Job', frequency: 'daily' as const },
    { name: 'High Mountain Dungeon', category: '6th Job', frequency: 'weekly' as const },
    { name: 'Angler Company Dungeon', category: '6th Job', frequency: 'weekly' as const },

    // 5. Other Dailies
    { name: 'Monster Park', category: 'Other Dailies', frequency: 'daily' as const },
    { name: 'Monster Park Extreme', category: 'Other Dailies', frequency: 'weekly' as const },
    { name: 'Commerci Voyages', category: 'Other Dailies', frequency: 'daily' as const },
    { name: 'Commerci Party Quest', category: 'Other Dailies', frequency: 'daily' as const },
    { name: 'Ursus', category: 'Other Dailies', frequency: 'daily' as const },
    { name: 'Maple Tour', category: 'Other Dailies', frequency: 'daily' as const },
    { name: 'Talk to Home Caretaker', category: 'Other Dailies', frequency: 'daily' as const },
    { name: 'Auto-Harvest Herbs and Minerals', category: 'Other Dailies', frequency: 'daily' as const },

    // 6. Daily Bosses
    { name: 'Easy/Normal Zakum', category: 'Daily Bosses', frequency: 'daily' as const },
    { name: 'Normal Hilla', category: 'Daily Bosses', frequency: 'daily' as const },
    { name: 'Normal Von Bon', category: 'Daily Bosses', frequency: 'daily' as const },
    { name: 'Normal Crimson Queen', category: 'Daily Bosses', frequency: 'daily' as const },
    { name: 'Normal Pierre', category: 'Daily Bosses', frequency: 'daily' as const },
    { name: 'Normal Vellum', category: 'Daily Bosses', frequency: 'daily' as const },
    { name: 'Horntail', category: 'Daily Bosses', frequency: 'daily' as const },
    { name: 'Von Leon', category: 'Daily Bosses', frequency: 'daily' as const },
    { name: 'Normal Pink Bean', category: 'Daily Bosses', frequency: 'daily' as const },
    { name: 'Easy/Normal Magnus', category: 'Daily Bosses', frequency: 'daily' as const },
    { name: 'Arkarium', category: 'Daily Bosses', frequency: 'daily' as const },
    { name: 'Easy/Normal Papulatus', category: 'Daily Bosses', frequency: 'daily' as const },
    { name: 'Mori Ranmaru', category: 'Daily Bosses', frequency: 'daily' as const },
    { name: 'Gollux', category: 'Daily Bosses', frequency: 'daily' as const },

    // 7. Arcane Symbol Weeklies
    { name: 'Erda Spectrum', category: 'Arcane Symbol Weeklies', frequency: 'weekly' as const },
    { name: 'Hungry Muto', category: 'Arcane Symbol Weeklies', frequency: 'weekly' as const },
    { name: 'Midnight Chaser', category: 'Arcane Symbol Weeklies', frequency: 'weekly' as const },
    { name: 'Spirit Savior', category: 'Arcane Symbol Weeklies', frequency: 'weekly' as const },
    { name: 'Ranheim Defense', category: 'Arcane Symbol Weeklies', frequency: 'weekly' as const },
    { name: 'Esfera Guardian', category: 'Arcane Symbol Weeklies', frequency: 'weekly' as const },

    // 8. Guild
    { name: 'Guild Culvert', category: 'Guild', frequency: 'weekly' as const },
    { name: 'Guild Flag Race', category: 'Guild', frequency: 'weekly' as const },
    { name: 'Guild Castle 5k Mobs', category: 'Guild', frequency: 'weekly' as const },
    { name: 'Guild Check In', category: 'Guild', frequency: 'daily' as const },

    // 9. Legion
    { name: 'Claim Legion Coins', category: 'Legion', frequency: 'daily' as const },
    { name: 'Legion Weekly Dragon Extermination', category: 'Legion', frequency: 'weekly' as const },

    // 10. Other Weeklies
    { name: 'Mu Lung Dojo', category: 'Other Weeklies', frequency: 'weekly' as const },
    { name: 'Scrapyard Weeklies', category: 'Other Weeklies', frequency: 'weekly' as const },
    { name: 'Dark World Tree Weeklies', category: 'Other Weeklies', frequency: 'weekly' as const },

    // 11. Threads of Fate
    { name: 'Reroll Threads of Fate Ask', category: 'Threads of Fate', frequency: 'daily' as const },
    { name: 'Lock Threads of Fate Ask', category: 'Threads of Fate', frequency: 'daily' as const },
    { name: 'Threads of Fate Ask', category: 'Threads of Fate', frequency: 'daily' as const },
    { name: 'Talk Threads of Fate', category: 'Threads of Fate', frequency: 'daily' as const },
    { name: 'Gift Threads of Fate', category: 'Threads of Fate', frequency: 'weekly' as const },


    // Monthly Tasks
    { name: 'Black Mage', category: 'Monthly Bosses', frequency: 'monthly' as const },
  ];

  const addTaskFromTemplate = (template: typeof taskTemplates[0], characterName: string) => {
    const task: Task = {
      id: Date.now().toString(),
      name: template.name,
      character: characterName,
      frequency: template.frequency,
      category: template.category,
      completed: false,
      dueDate: new Date().toISOString().split('T')[0],
      createdAt: new Date().toISOString(),
      priority: 'medium'
    };

    setTasks(prev => [...prev, task]);
    toast({
      title: "Task Added",
      description: `${template.name} added for ${characterName}`,
      className: "progress-complete"
    });
  };

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case 'high': return 'text-red-500 border-red-200 bg-red-50';
      case 'medium': return 'text-yellow-600 border-yellow-200 bg-yellow-50';
      case 'low': return 'text-green-600 border-green-200 bg-green-50';
      default: return 'text-gray-600 border-gray-200 bg-gray-50';
    }
  };

  const getPriorityIcon = (priority?: string) => {
    switch (priority) {
      case 'high': return '🔴';
      case 'medium': return '🟡';
      case 'low': return '🟢';
      default: return '⚪';
    }
  };

  // Calculate time remaining until next reset
  const getTimeUntilReset = (frequency: 'daily' | 'weekly' | 'monthly') => {
    const now = new Date();
    // Use UTC time directly instead of converting local time to UTC
    const utcNow = new Date(Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate(),
      now.getUTCHours(),
      now.getUTCMinutes(),
      now.getUTCSeconds(),
      now.getUTCMilliseconds()
    ));

    if (frequency === 'daily') {
      // Daily reset at UTC midnight
      const nextReset = new Date(utcNow);
      nextReset.setUTCDate(nextReset.getUTCDate() + 1); // Add one day
      nextReset.setUTCHours(0, 0, 0, 0); // Set to midnight UTC
      const timeDiff = nextReset.getTime() - utcNow.getTime();
      return Math.max(0, Math.floor(timeDiff / (1000 * 60))); // Minutes remaining
    } else if (frequency === 'weekly') {
      // Weekly reset Wednesday to Thursday at UTC
      const currentDay = utcNow.getUTCDay(); // 0 = Sunday, 3 = Wednesday, 4 = Thursday
      let daysUntilReset = 0;

      if (currentDay < 3) {
        // Before Wednesday, reset is this Wednesday
        daysUntilReset = 3 - currentDay;
      } else if (currentDay === 3) {
        // It's Wednesday, check if before midnight
        if (utcNow.getUTCHours() < 24) {
          daysUntilReset = 0; // Reset today
        } else {
          daysUntilReset = 7; // Next Wednesday
        }
      } else if (currentDay === 4) {
        // It's Thursday, reset was yesterday
        daysUntilReset = 6; // Next Wednesday
      } else {
        // Friday, Saturday, Sunday, Monday, Tuesday
        daysUntilReset = 3 + (7 - currentDay);
      }

      // Calculate total minutes until reset
      const nextReset = new Date(utcNow);
      nextReset.setUTCDate(nextReset.getUTCDate() + daysUntilReset);
      nextReset.setUTCHours(0, 0, 0, 0); // Reset at midnight UTC
      const timeDiff = nextReset.getTime() - utcNow.getTime();
      return Math.max(0, Math.floor(timeDiff / (1000 * 60))); // Minutes remaining
    } else if (frequency === 'monthly') {
      // Monthly reset: last day of month to 1st of next month at UTC+0
      const currentYear = utcNow.getUTCFullYear();
      const currentMonth = utcNow.getUTCMonth();
      const lastDayOfMonth = new Date(Date.UTC(currentYear, currentMonth + 1, 0, 23, 59, 59, 999));

      if (utcNow.getTime() <= lastDayOfMonth.getTime()) {
        // Still in current month, reset at end of month
        const timeDiff = lastDayOfMonth.getTime() - utcNow.getTime();
        return Math.max(0, Math.floor(timeDiff / (1000 * 60))); // Minutes remaining
      } else {
        // Already past end of month, calculate to end of next month
        const nextMonth = currentMonth + 1;
        const nextYear = nextMonth > 11 ? currentYear + 1 : currentYear;
        const actualNextMonth = nextMonth > 11 ? 0 : nextMonth;
        const lastDayOfNextMonth = new Date(Date.UTC(nextYear, actualNextMonth + 1, 0, 23, 59, 59, 999));
        const timeDiff = lastDayOfNextMonth.getTime() - utcNow.getTime();
        return Math.max(0, Math.floor(timeDiff / (1000 * 60))); // Minutes remaining
      }
    }

    return 0;
  };

  // Format time remaining
  const formatTimeRemaining = (minutes: number, frequency: 'daily' | 'weekly' | 'monthly') => {
    if (frequency === 'daily') {
      if (minutes < 60) return `${minutes}m`;
      const hours = Math.floor(minutes / 60);
      const remainingMinutes = minutes % 60;
      if (remainingMinutes === 0) return `${hours}h`;
      return `${hours}h ${remainingMinutes}m`;
    } else if (frequency === 'weekly') {
      const days = Math.floor(minutes / (60 * 24));
      const hours = Math.floor((minutes % (60 * 24)) / 60);
      const remainingMinutes = minutes % 60;

      if (days > 0) {
        if (hours === 0 && remainingMinutes === 0) return `${days}d`;
        if (hours === 0) return `${days}d ${remainingMinutes}m`;
        if (remainingMinutes === 0) return `${days}d ${hours}h`;
        return `${days}d ${hours}h ${remainingMinutes}m`;
      } else if (hours > 0) {
        if (remainingMinutes === 0) return `${hours}h`;
        return `${hours}h ${remainingMinutes}m`;
      } else {
        return `${remainingMinutes}m`;
      }
    } else if (frequency === 'monthly') {
      const days = Math.floor(minutes / (60 * 24));
      const hours = Math.floor((minutes % (60 * 24)) / 60);
      const remainingMinutes = minutes % 60;

      if (days > 0) {
        if (hours === 0 && remainingMinutes === 0) return `${days}d`;
        if (hours === 0) return `${days}d ${remainingMinutes}m`;
        if (remainingMinutes === 0) return `${days}d ${hours}h`;
        return `${days}d ${hours}h ${remainingMinutes}m`;
      } else if (hours > 0) {
        if (remainingMinutes === 0) return `${hours}h`;
        return `${hours}h ${remainingMinutes}m`;
      } else {
        return `${remainingMinutes}m`;
      }
    }
    return '';
  };

  // Check if current time is Ursus golden time
  const isUrsusGoldenTime = () => {
    const now = new Date();
    const utcHour = now.getUTCHours();

    // Golden time: 1:00 AM - 3:00 AM UTC (1-3) and 6:00 PM - 8:00 PM UTC (18-20)
    return (utcHour >= 1 && utcHour < 3) || (utcHour >= 18 && utcHour < 20);
  };

  // Get next Ursus golden time
  const getNextUrsusGoldenTime = () => {
    const now = new Date();
    const utcHour = now.getUTCHours();

    if (utcHour < 1) {
      // Next golden time is 1:00 AM today
      const nextTime = new Date(now);
      nextTime.setUTCHours(1, 0, 0, 0);
      return nextTime;
    } else if (utcHour < 3) {
      // Currently in first golden time window
      return null; // Currently active
    } else if (utcHour < 18) {
      // Next golden time is 6:00 PM today
      const nextTime = new Date(now);
      nextTime.setUTCHours(18, 0, 0, 0);
      return nextTime;
    } else if (utcHour < 20) {
      // Currently in second golden time window
      return null; // Currently active
    } else {
      // Next golden time is 1:00 AM tomorrow
      const nextTime = new Date(now);
      nextTime.setUTCDate(nextTime.getUTCDate() + 1);
      nextTime.setUTCHours(1, 0, 0, 0);
      return nextTime;
    }
  };

  // Format golden time remaining
  const formatGoldenTimeRemaining = () => {
    const nextTime = getNextUrsusGoldenTime();
    if (!nextTime) return 'Active Now! 🔥';

    const now = new Date();
    // Use UTC time for consistency
    const utcNow = new Date(Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate(),
      now.getUTCHours(),
      now.getUTCMinutes(),
      now.getUTCSeconds(),
      now.getUTCMilliseconds()
    ));

    const timeDiff = nextTime.getTime() - utcNow.getTime();
    const hours = Math.floor(timeDiff / (1000 * 60 * 60));
    const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else if (minutes > 0) {
      return `${minutes}m`;
    } else {
      return '< 1m';
    }
  };

  // Toggle collapse state for task sections
  const toggleSectionCollapse = (characterName: string, section: 'daily' | 'weekly' | 'monthly') => {
    setCollapsedSections(prev => ({
      ...prev,
      [characterName]: {
        ...prev[characterName],
        [section]: !prev[characterName]?.[section]
      }
    }));
  };

  // Check if section is collapsed
  const isSectionCollapsed = (characterName: string, section: 'daily' | 'weekly' | 'monthly') => {
    return collapsedSections[characterName]?.[section] || false;
  };

  // Filter characters based on completion status
  const getFilteredCharacters = (characters: Character[]): Character[] => {
    switch (taskFilter) {
      case 'finished':
        return characters.filter(char => {
          const characterTasks = getCharacterTasks(char.name);
          const completedTasks = characterTasks.filter(task => task.completed).length;
          return characterTasks.length > 0 && completedTasks === characterTasks.length;
        });
      case 'unfinished':
        return characters.filter(char => {
          const characterTasks = getCharacterTasks(char.name);
          const completedTasks = characterTasks.filter(task => task.completed).length;
          return characterTasks.length === 0 || completedTasks < characterTasks.length;
        });
      case 'hidden':
        return characters.filter(char => hiddenCharacters.has(char.name));
      case 'all':
      default:
        return characters;
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Task Tracker
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage daily, weekly, and monthly tasks for all characters
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <Button
              onClick={() => resetTasks('daily')}
              variant="outline"
              size="sm"
              className="text-muted-foreground hover:text-primary w-full sm:w-auto"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset Daily
            </Button>
            <Button
              onClick={() => resetTasks('weekly')}
              variant="outline"
              size="sm"
              className="text-muted-foreground hover:text-primary w-full sm:w-auto"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset Weekly
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 sm:gap-4 pt-6">
        <Card className="card-glow">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Clock className="h-8 w-8 text-primary" />
              <div>
                <p className="text-2xl font-bold">
                  {formatTimeRemaining(getTimeUntilReset('daily'), 'daily')}
                </p>
                <p className="text-sm text-muted-foreground">Daily Reset</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-glow">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Calendar className="h-8 w-8 text-success" />
              <div>
                <p className="text-2xl font-bold">
                  {formatTimeRemaining(getTimeUntilReset('weekly'), 'weekly')}
                </p>
                <p className="text-sm text-muted-foreground">Weekly Reset</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-glow">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Star className="h-8 w-8 text-accent" />
              <div>
                <p className="text-2xl font-bold">
                  {formatTimeRemaining(getTimeUntilReset('monthly'), 'monthly')}
                </p>
                <p className="text-sm text-muted-foreground">Monthly Reset</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={`card-glow ${isUrsusGoldenTime() ? 'ring-2 ring-yellow-400 shadow-yellow-400/20' : ''}`}>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                isUrsusGoldenTime()
                  ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white'
                  : 'bg-muted text-muted-foreground'
              }`}>
                {isUrsusGoldenTime() ? <Coins className="h-5 w-5" /> : <Clock className="h-5 w-5" />}
              </div>
              <div>
                <p className={`text-2xl font-bold ${isUrsusGoldenTime() ? 'text-yellow-600' : 'text-muted-foreground'}`}>
                  {isUrsusGoldenTime() ? 'ACTIVE' : formatGoldenTimeRemaining()}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {isUrsusGoldenTime() ? '2x Mesos!' : 'Until Ursus Golden Time'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-glow">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <User className="h-8 w-8 text-secondary" />
              <div>
                <p className="text-2xl font-bold">
                  {characters.filter(char => !hiddenCharacters.has(char.name)).length}
                </p>
                <p className="text-sm text-muted-foreground">Active Characters</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Compact Character Task Grid */}
      <div className="pt-6">
        {/* Filter Controls */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Filter characters:</span>
            <ToggleGroup type="single" value={taskFilter} onValueChange={(value) => setTaskFilter(value as FilterType || 'all')}>
              <ToggleGroupItem value="all" size="sm">All</ToggleGroupItem>
              <ToggleGroupItem value="finished" size="sm">Finished</ToggleGroupItem>
              <ToggleGroupItem value="unfinished" size="sm">Unfinished</ToggleGroupItem>
              <ToggleGroupItem value="hidden" size="sm">Hidden</ToggleGroupItem>
            </ToggleGroup>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
        {(() => {
          // Sort characters: main character first, then others in original order (same as BossTracker)
          const idx = characters.findIndex(c => !!c.isMain);
          const charactersMainFirst =
            idx > 0
              ? [characters[idx], ...characters.slice(0, idx), ...characters.slice(idx + 1)]
              : characters;

          // Apply filtering
          const filteredCharacters = getFilteredCharacters(charactersMainFirst);

          return filteredCharacters
            .filter(character => taskFilter === 'hidden' || !hiddenCharacters.has(character.name))
            .map((character) => {
            const dailyTasks = getCharacterTasks(character.name, 'daily');
            const weeklyTasks = getCharacterTasks(character.name, 'weekly');
            const monthlyTasks = getCharacterTasks(character.name, 'monthly');
            const allTasks = [...dailyTasks, ...weeklyTasks, ...monthlyTasks];
            const completedTasks = allTasks.filter(task => task.completed).length;

            const isHidden = hiddenCharacters.has(character.name);

            return (
              <Card key={character.id} className={`card-gaming ${isHidden && taskFilter === 'hidden' ? 'opacity-60' : ''}`}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <img
                        src={character.avatarUrl || '/placeholder.svg'}
                        alt={character.name}
                        className={`w-auto object-cover ${isHidden && taskFilter === 'hidden' ? 'grayscale' : ''}`}
                        onError={(e) => {
                          const img = e.currentTarget as HTMLImageElement;
                          img.src = '/placeholder.svg';
                        }}
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className={`font-semibold truncate text-base ${isHidden && taskFilter === 'hidden' ? 'text-muted-foreground' : 'text-primary'}`}>
                            {character.name}
                          </h3>
                          {character.isMain && <Star className={`h-3 w-3 flex-shrink-0 ${isHidden && taskFilter === 'hidden' ? 'text-muted-foreground' : 'text-amber-400'}`} />}
                        </div>
                        <p className={`text-sm ${isHidden && taskFilter === 'hidden' ? 'text-muted-foreground/70' : 'text-muted-foreground'}`}>
                          Lv. {character.level} • {character.class}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => {
                          const isHidden = hiddenCharacters.has(character.name);
                          if (isHidden) {
                            // Show character (no confirmation needed)
                            setHiddenCharacters(prev => {
                              const newSet = new Set(prev);
                              newSet.delete(character.name);
                              return newSet;
                            });
                          } else {
                            // Hide character (ask for confirmation)
                            setCharacterToHide(character.name);
                            setShowHideConfirmation(true);
                          }
                        }}
                        title={hiddenCharacters.has(character.name) ? 'Show character' : 'Hide character'}
                      >
                        {hiddenCharacters.has(character.name) ? (
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                          </svg>
                        ) : (
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        )}
                      </Button>
                      {(!isHidden || taskFilter !== 'hidden') && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() => {
                            setSelectedCharacterForTasks(character.name);
                            // Sync presets with existing tasks when opening dialog
                            const characterTasks = tasks.filter(t => t.character === character.name);
                            const taskNames = characterTasks.map(t => t.name);
                            const currentPresets = enabledTasksByCharacter[character.name] || {};

                            // Update presets to match existing tasks
                            const updatedPresets = { ...currentPresets };
                            taskTemplates.forEach(template => {
                              if (taskNames.includes(template.name)) {
                                updatedPresets[template.name] = true;
                              } else if (!updatedPresets[template.name]) {
                                updatedPresets[template.name] = false;
                              }
                            });

                            setEnabledTasksByCharacter(prev => ({
                              ...prev,
                              [character.name]: updatedPresets
                            }));

                            setShowTaskSelector(true);
                          }}
                        >
                          <Edit3 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                  {(!isHidden || taskFilter !== 'hidden') && (
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="outline" className="text-xs">
                        {completedTasks}/{allTasks.length}
                      </Badge>
                      <div className="text-xs text-muted-foreground">
                        {allTasks.length > 0 ? Math.round((completedTasks / allTasks.length) * 100) : 0}% done
                      </div>
                    </div>
                  )}
                </CardHeader>
                <CardContent className="pt-0 max-h-96 overflow-y-auto scrollbar-hide">
                  {allTasks.length === 0 ? (
                    (!isHidden || taskFilter !== 'hidden') && (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        No tasks for this character
                      </p>
                    )
                  ) : (
                    <div className="space-y-4">
                      {/* Daily Tasks */}
                      {dailyTasks.length > 0 && (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between px-1">
                            <div className="flex items-center gap-1.5">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0"
                                onClick={() => toggleSectionCollapse(character.name, 'daily')}
                              >
                                {isSectionCollapsed(character.name, 'daily') ? (
                                  <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                  </svg>
                                ) : (
                                  <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                  </svg>
                                )}
                              </Button>
                              <Clock className="h-3.5 w-3.5 text-primary" />
                              <span className="text-xs font-semibold text-primary">Daily</span>
                              <Badge variant="secondary" className="text-xs px-1.5 py-0.5 h-4">
                                {dailyTasks.filter(t => t.completed).length}/{dailyTasks.length}
                              </Badge>
                            </div>
                            <span className="text-xs text-muted-foreground">
                              {formatTimeRemaining(getTimeUntilReset('daily'), 'daily')}
                            </span>
                          </div>
                          <div className={`grid grid-cols-1 gap-1 transition-all duration-300 ease-in-out ${
                            isSectionCollapsed(character.name, 'daily')
                              ? 'max-h-0 opacity-0 overflow-hidden'
                              : 'max-h-80 opacity-100 overflow-y-auto scrollbar-hide'
                          }`}>
                            {dailyTasks.map((task) => {
                              const isUrsusTask = task.name.toLowerCase().includes('ursus');
                              const isGoldenTimeActive = isUrsusGoldenTime();

                              return (
                                <div
                                  key={task.id}
                                  className={`flex items-center gap-2 p-2 rounded-md border transition-all duration-200 cursor-pointer ${
                                    task.completed
                                      ? 'bg-muted/20 border-muted/50 opacity-60'
                                      : isUrsusTask && isGoldenTimeActive
                                        ? 'bg-gradient-to-r from-yellow-50/80 to-orange-50/80 border-yellow-300/60 shadow-sm'
                                        : 'bg-card/50 border-border/60 hover:bg-card hover:border-border'
                                  }`}
                                  onClick={() => toggleTaskComplete(task.id)}
                                >
                                  <Checkbox
                                    checked={task.completed}
                                    onCheckedChange={(checked) => {
                                      // Prevent the row click from firing when checkbox is clicked
                                      const event = window.event;
                                      if (event) {
                                        event.stopPropagation();
                                      }
                                      toggleTaskComplete(task.id);
                                    }}
                                    className={`h-3.5 w-3.5 flex-shrink-0 ${
                                      isUrsusTask && isGoldenTimeActive && !task.completed
                                        ? 'data-[state=checked]:bg-yellow-500 data-[state=checked]:border-yellow-500 border-yellow-400'
                                        : 'data-[state=checked]:bg-success data-[state=checked]:border-success'
                                    }`}
                                  />
                                  <div className="flex-1 min-w-0 flex items-center justify-between gap-2">
                                    <div className="flex items-center gap-1.5 min-w-0 flex-1">
                                      <span className={`text-xs font-medium truncate ${
                                        task.completed
                                          ? 'line-through text-muted-foreground'
                                          : isUrsusTask && isGoldenTimeActive
                                            ? 'text-yellow-700 font-semibold'
                                            : 'text-foreground'
                                      }`}>
                                        {task.name}
                                      </span>
                                      {isUrsusTask && isGoldenTimeActive && !task.completed && (
                                        <span className="text-yellow-600 text-xs font-bold animate-pulse flex-shrink-0">
                                          ⚡
                                        </span>
                                      )}
                                    </div>
                                    <Badge
                                      variant="outline"
                                      className={`text-xs px-1.5 py-0.5 h-4 flex-shrink-0 ${
                                        task.category === 'Daily Bosses' ? 'bg-red-50 text-red-700 border-red-200' :
                                        task.category === 'Event' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                                        task.category === 'Sacred Symbol Dailies' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                        task.category === 'Arcane Symbol Dailies' ? 'bg-green-50 text-green-700 border-green-200' :
                                        'bg-gray-50 text-gray-700 border-gray-200'
                                      }`}
                                    >
                                      {task.category.replace('Dailies', '').replace('Symbol ', '').replace('Daily ', '').trim()}
                                    </Badge>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* Weekly Tasks */}
                      {weeklyTasks.length > 0 && (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between px-1">
                            <div className="flex items-center gap-1.5">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0"
                                onClick={() => toggleSectionCollapse(character.name, 'weekly')}
                              >
                                {isSectionCollapsed(character.name, 'weekly') ? (
                                  <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                  </svg>
                                ) : (
                                  <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                  </svg>
                                )}
                              </Button>
                              <Calendar className="h-3.5 w-3.5 text-primary" />
                              <span className="text-xs font-semibold text-primary">Weekly</span>
                              <Badge variant="secondary" className="text-xs px-1.5 py-0.5 h-4">
                                {weeklyTasks.filter(t => t.completed).length}/{weeklyTasks.length}
                              </Badge>
                            </div>
                            <span className="text-xs text-muted-foreground">
                              {formatTimeRemaining(getTimeUntilReset('weekly'), 'weekly')}
                            </span>
                          </div>
                          <div className={`grid grid-cols-1 gap-1 transition-all duration-300 ease-in-out ${
                            isSectionCollapsed(character.name, 'weekly')
                              ? 'max-h-0 opacity-0 overflow-hidden'
                              : 'max-h-80 opacity-100 overflow-y-auto scrollbar-hide'
                          }`}>
                            {weeklyTasks.map((task) => (
                              <div
                                key={task.id}
                                className={`flex items-center gap-2 p-2 rounded-md border transition-all duration-200 cursor-pointer ${
                                  task.completed
                                    ? 'bg-muted/20 border-muted/50 opacity-60'
                                    : 'bg-card/50 border-border/60 hover:bg-card hover:border-border'
                                }`}
                                onClick={() => toggleTaskComplete(task.id)}
                              >
                                <Checkbox
                                  checked={task.completed}
                                  onCheckedChange={(checked) => {
                                    // Prevent the row click from firing when checkbox is clicked
                                    const event = window.event;
                                    if (event) {
                                      event.stopPropagation();
                                    }
                                    toggleTaskComplete(task.id);
                                  }}
                                  className="data-[state=checked]:bg-success data-[state=checked]:border-success h-3.5 w-3.5 flex-shrink-0"
                                />
                                <div className="flex-1 min-w-0 flex items-center justify-between gap-2">
                                  <span className={`text-xs font-medium truncate ${
                                    task.completed ? 'line-through text-muted-foreground' : 'text-foreground'
                                  }`}>
                                    {task.name}
                                  </span>
                                  <Badge
                                    variant="outline"
                                    className={`text-xs px-1.5 py-0.5 h-4 flex-shrink-0 ${
                                      task.category === 'Arcane Symbol Weeklies' ? 'bg-indigo-50 text-indigo-700 border-indigo-200' :
                                      task.category === 'Guild' ? 'bg-orange-50 text-orange-700 border-orange-200' :
                                      task.category === 'Legion' ? 'bg-cyan-50 text-cyan-700 border-cyan-200' :
                                      task.category === 'Other Weeklies' ? 'bg-pink-50 text-pink-700 border-pink-200' :
                                      task.category === 'Threads of Fate' ? 'bg-violet-50 text-violet-700 border-violet-200' :
                                      'bg-gray-50 text-gray-700 border-gray-200'
                                    }`}
                                  >
                                    {task.category.replace('Weeklies', '').replace('Weekly ', '').replace('Symbol ', '').trim()}
                                  </Badge>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Monthly Tasks */}
                      {monthlyTasks.length > 0 && (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between px-1">
                            <div className="flex items-center gap-1.5">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0"
                                onClick={() => toggleSectionCollapse(character.name, 'monthly')}
                              >
                                {isSectionCollapsed(character.name, 'monthly') ? (
                                  <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                  </svg>
                                ) : (
                                  <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                  </svg>
                                )}
                              </Button>
                              <Star className="h-3.5 w-3.5 text-primary" />
                              <span className="text-xs font-semibold text-primary">Monthly</span>
                              <Badge variant="secondary" className="text-xs px-1.5 py-0.5 h-4">
                                {monthlyTasks.filter(t => t.completed).length}/{monthlyTasks.length}
                              </Badge>
                            </div>
                            <span className="text-xs text-muted-foreground">
                              Monthly Reset
                            </span>
                          </div>
                          <div className={`grid grid-cols-1 gap-1 transition-all duration-300 ease-in-out ${
                            isSectionCollapsed(character.name, 'monthly')
                              ? 'max-h-0 opacity-0 overflow-hidden'
                              : 'max-h-80 opacity-100 overflow-y-auto scrollbar-hide'
                          }`}>
                            {monthlyTasks.map((task) => (
                              <div
                                key={task.id}
                                className={`flex items-center gap-2 p-2 rounded-md border transition-all duration-200 cursor-pointer ${
                                  task.completed
                                    ? 'bg-muted/20 border-muted/50 opacity-60'
                                    : 'bg-card/50 border-border/60 hover:bg-card hover:border-border'
                                }`}
                                onClick={() => toggleTaskComplete(task.id)}
                              >
                                <Checkbox
                                  checked={task.completed}
                                  onCheckedChange={(checked) => {
                                    // Prevent the row click from firing when checkbox is clicked
                                    const event = window.event;
                                    if (event) {
                                      event.stopPropagation();
                                    }
                                    toggleTaskComplete(task.id);
                                  }}
                                  className="data-[state=checked]:bg-success data-[state=checked]:border-success h-3.5 w-3.5 flex-shrink-0"
                                />
                                <div className="flex-1 min-w-0 flex items-center justify-between gap-2">
                                  <span className={`text-xs font-medium truncate ${
                                    task.completed ? 'line-through text-muted-foreground' : 'text-foreground'
                                  }`}>
                                    {task.name}
                                  </span>
                                  <Badge
                                    variant="outline"
                                    className={`text-xs px-1.5 py-0.5 h-4 flex-shrink-0 ${
                                      task.category === 'Monthly Bosses' ? 'bg-red-50 text-red-700 border-red-200' :
                                      'bg-gray-50 text-gray-700 border-gray-200'
                                    }`}
                                  >
                                    {task.category.replace('Monthly ', '').trim()}
                                  </Badge>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          });
        })()}
        </div>
      </div>

      {/* Task Selection Dialog */}
      <Dialog open={showTaskSelector} onOpenChange={setShowTaskSelector}>
        <DialogContent className="max-w-4xl w-[95vw] max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle>
              Choose Tasks for {selectedCharacterForTasks}
            </DialogTitle>
          </DialogHeader>
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Task Categories Sidebar */}
            <div className="lg:w-48 lg:flex-shrink-0">
              <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border border-border rounded-lg p-2">
                {/* Frequency Navigation */}
                <nav className="space-y-2 py-2">
                  <Button
                    onClick={() => setSelectedTaskFrequency('daily')}
                    variant={selectedTaskFrequency === 'daily' ? 'default' : 'ghost'}
                    className={`w-full justify-start space-x-2 ${
                      selectedTaskFrequency === 'daily' ? 'btn-hero' : 'hover:bg-card hover:text-primary'
                    }`}
                  >
                    <Clock className="h-4 w-4" />
                    <span>Daily Tasks</span>
                  </Button>
                  <Button
                    onClick={() => setSelectedTaskFrequency('weekly')}
                    variant={selectedTaskFrequency === 'weekly' ? 'default' : 'ghost'}
                    className={`w-full justify-start space-x-2 ${
                      selectedTaskFrequency === 'weekly' ? 'btn-hero' : 'hover:bg-card hover:text-primary'
                    }`}
                  >
                    <Calendar className="h-4 w-4" />
                    <span>Weekly Tasks</span>
                  </Button>
                  <Button
                    onClick={() => setSelectedTaskFrequency('monthly')}
                    variant={selectedTaskFrequency === 'monthly' ? 'default' : 'ghost'}
                    className={`w-full justify-start space-x-2 ${
                      selectedTaskFrequency === 'monthly' ? 'btn-hero' : 'hover:bg-card hover:text-primary'
                    }`}
                  >
                    <Star className="h-4 w-4" />
                    <span>Monthly Tasks</span>
                  </Button>
                </nav>

                {/* Preset Templates */}
                <div className="mt-4 pt-3 border-t border-border">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-semibold text-primary flex items-center gap-2">
                      <Sparkles className="h-3 w-3" />
                      Your Presets
                    </h4>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0"
                      onClick={() => {
                        const presetName = prompt('Enter preset name:');
                        if (presetName && presetName.trim()) {
                          const currentEnabled = enabledTasksByCharacter[selectedCharacterForTasks] || {};
                          setTaskPresets(prev => ({
                            ...prev,
                            [presetName.trim()]: { ...currentEnabled }
                          }));
                          toast({
                            title: "Preset Saved",
                            description: `"${presetName.trim()}" preset created`,
                            className: "progress-complete"
                          });
                        }
                      }}
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                  <div className="space-y-1 max-h-32 overflow-y-auto scrollbar-hide">
                    {Object.keys(taskPresets).length === 0 ? (
                      <p className="text-xs text-muted-foreground text-center py-2">
                        No presets yet
                      </p>
                    ) : (
                      Object.entries(taskPresets).map(([presetName, presetTasks]) => {
                        const taskCount = Object.values(presetTasks).filter(Boolean).length;
                        return (
                          <div key={presetName} className="flex items-center gap-1">
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex-1 justify-start text-xs h-6 px-2 truncate"
                              onClick={() => {
                                // Apply preset to current character
                                const currentEnabled = enabledTasksByCharacter[selectedCharacterForTasks] || {};
                                const updatedEnabled = { ...currentEnabled };

                                // Add preset tasks
                                Object.keys(presetTasks).forEach(taskName => {
                                  updatedEnabled[taskName] = presetTasks[taskName] || false;
                                });

                                setEnabledTasksByCharacter(prev => ({
                                  ...prev,
                                  [selectedCharacterForTasks]: updatedEnabled
                                }));

                                toast({
                                  title: "Preset Loaded",
                                  description: `"${presetName}" preset applied`,
                                  className: "progress-complete"
                                });
                              }}
                            >
                              <span className="truncate">{presetName}</span>
                              <span className="text-xs opacity-60 ml-1">({taskCount})</span>
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0 text-destructive hover:text-destructive flex-shrink-0"
                              onClick={() => {
                                if (confirm(`Delete preset "${presetName}"?`)) {
                                  setTaskPresets(prev => {
                                    const updated = { ...prev };
                                    delete updated[presetName];
                                    return updated;
                                  });
                                  toast({
                                    title: "Preset Deleted",
                                    description: `"${presetName}" preset removed`,
                                    className: "progress-incomplete"
                                  });
                                }
                              }}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Task Grid */}
            <div className="flex-1 min-w-0">
              <div className="max-h-[60vh] overflow-y-auto scrollbar-hide pr-2">
                <div className="space-y-6">
                  {(() => {
                    const filteredTemplates = taskTemplates.filter(template => template.frequency === selectedTaskFrequency);
                    const categories = [...new Set(filteredTemplates.map(template => template.category))];

                    return categories.map(category => {
                      const categoryTasks = filteredTemplates.filter(template => template.category === category);

                      return (
                        <div key={category} className="space-y-3">
                          <h3 className="text-lg font-semibold text-primary border-b border-border pb-2">
                            {category}
                          </h3>
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                            {categoryTasks.map((template, index) => {
                              const isSelected = (enabledTasksByCharacter[selectedCharacterForTasks] || {})[template.name] || false;

                              return (
                                <div
                                  key={index}
                                  className={`relative rounded-lg border-2 transition-all duration-200 hover:shadow-md cursor-pointer ${
                                    isSelected
                                      ? 'border-primary bg-primary/5 shadow-md'
                                      : 'border-border hover:border-primary/50'
                                  }`}
                                  onClick={() => {
                                    // Toggle task preset for this character
                                    const taskKey = template.name;
                                    setEnabledTasksByCharacter(prev => {
                                      const characterEnabled = prev[selectedCharacterForTasks] || {};
                                      const isCurrentlyEnabled = characterEnabled[taskKey] || false;

                                      return {
                                        ...prev,
                                        [selectedCharacterForTasks]: {
                                          ...characterEnabled,
                                          [taskKey]: !isCurrentlyEnabled
                                        }
                                      };
                                    });
                                  }}
                                >
                                  {/* Selection overlay */}
                                  {isSelected && (
                                    <div className="absolute top-2 right-2 z-10">
                                      <div className="bg-primary text-primary-foreground rounded-full p-1">
                                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                      </div>
                                    </div>
                                  )}

                                  <div className="p-3">
                                    <h3 className="font-semibold text-sm text-primary mb-1">
                                      {template.name}
                                    </h3>
                                    <Badge variant="outline" className="text-xs">
                                      {template.category}
                                    </Badge>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    });
                  })()}
                </div>
              </div>
            </div>
          </div>


          <div className="flex justify-end pt-4 border-t">
            <Button
              onClick={() => {
                applyTaskPresets(selectedCharacterForTasks);
                setShowTaskSelector(false);
              }}
              className="btn-hero"
            >
              Done
            </Button>
          </div>
        </DialogContent>
        
      </Dialog>



      {/* Hide Character Confirmation Dialog */}
      <Dialog open={showHideConfirmation} onOpenChange={setShowHideConfirmation}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <svg className="h-5 w-5 text-destructive" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              Hide {characterToHide}?
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              This will hide the character from your task tracker. You can show them again using the "Hidden" filter.
            </p>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setShowHideConfirmation(false);
                  setCharacterToHide('');
                }}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() => {
                  setHiddenCharacters(prev => new Set([...prev, characterToHide]));
                  setShowHideConfirmation(false);
                  setCharacterToHide('');
                  toast({
                    title: "Character Hidden",
                    description: `${characterToHide} has been hidden from the task tracker`,
                    className: "progress-incomplete"
                  });
                }}
              >
                Hide Character
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default TaskTracker;
