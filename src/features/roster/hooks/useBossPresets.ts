import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { loadBossPresets, saveBossPresets } from '../services/rosterService';
import { 
  DEFAULT_PRESET_NAMES, 
  BOSS_PRESET_CONFIGS, 
  isDefaultPreset, 
  getPresetConfig,
  type BossPresetConfig 
} from '../data/bossPresets';

export interface UseBossPresetsProps {
  groupedDaily: Array<[string, Array<{ name: string; difficulty: string; mesos: number; imageUrl: string }>]>;
  groupedWeekly: Array<[string, Array<{ name: string; difficulty: string; mesos: number; imageUrl: string }>]>;
  groupedMonthly: Array<[string, Array<{ name: string; difficulty: string; mesos: number; imageUrl: string }>]>;
  makeGroupKey: (category: 'monthly' | 'weekly' | 'daily', base: string) => string;
  onPresetApplied?: (config: {
    baseEnabledByBase: Record<string, boolean>;
    partySizes: Record<string, number>;
    selectedVariantByBase: Record<string, string>;
  }) => void;
}

export const useBossPresets = ({
  groupedDaily,
  groupedWeekly,
  groupedMonthly,
  makeGroupKey,
  onPresetApplied
}: UseBossPresetsProps) => {
  const { toast } = useToast();
  
  // State
  const [presets, setPresets] = useState<string[]>(() => {
    try {
      const stored = loadBossPresets();
      const merged = [...DEFAULT_PRESET_NAMES, ...stored.filter((p: string) => !DEFAULT_PRESET_NAMES.includes(p))];
      return merged;
    } catch {
      return DEFAULT_PRESET_NAMES;
    }
  });
  
  const [newPresetName, setNewPresetName] = useState('');
  const [showAddPreset, setShowAddPreset] = useState(false);
  const [showSavePresetDialog, setShowSavePresetDialog] = useState(false);
  const [pendingPresetName, setPendingPresetName] = useState('');
  const [editingPreset, setEditingPreset] = useState<string | null>(null);
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);

  // Get preset configuration
  const getPresetBosses = useCallback((presetName: string): Record<string, BossPresetConfig> => {
    // Check hardcoded presets first
    if (BOSS_PRESET_CONFIGS[presetName]) {
      return BOSS_PRESET_CONFIGS[presetName];
    }

    // Check custom presets in localStorage
    try {
      const stored = localStorage.getItem('maplehub_custom_presets');
      if (stored) {
        const customPresets = JSON.parse(stored);
        return customPresets[presetName] || {};
      }
    } catch {
      // Ignore parsing errors
    }

    return {};
  }, []);

  // Apply preset
  const applyPreset = useCallback((presetName: string) => {
    const presetBosses = getPresetBosses(presetName);
    
    if (Object.keys(presetBosses).length === 0) {
      toast({ 
        title: 'Preset Not Found', 
        description: `No configuration found for ${presetName}`, 
        variant: 'destructive' 
      });
      return;
    }

    // Reset all selections first
    const resetBaseEnabled: Record<string, boolean> = {};
    const resetPartySizes: Record<string, number> = {};
    const resetSelectedVariants: Record<string, string> = {};

    // Initialize all bosses as disabled
    groupedDaily.forEach(([base]) => {
      resetBaseEnabled[makeGroupKey('daily', base)] = false;
    });
    groupedWeekly.forEach(([base]) => {
      resetBaseEnabled[makeGroupKey('weekly', base)] = false;
    });
    groupedMonthly.forEach(([base]) => {
      resetBaseEnabled[makeGroupKey('monthly', base)] = false;
    });

    // Apply preset selections
    Object.entries(presetBosses).forEach(([bossName, config]) => {
      const enabled = config.enabled;
      const partySize = config.partySize || 1;

      if (enabled) {
        // Find which category this boss belongs to
        let found = false;

        // Check daily bosses
        groupedDaily.forEach(([base, variants]) => {
          if (variants.some(v => v.name === bossName)) {
            resetBaseEnabled[makeGroupKey('daily', base)] = true;
            resetPartySizes[bossName] = partySize;
            resetSelectedVariants[makeGroupKey('daily', base)] = bossName;
            found = true;
          }
        });

        // Check weekly bosses
        if (!found) {
          groupedWeekly.forEach(([base, variants]) => {
            if (variants.some(v => v.name === bossName)) {
              resetBaseEnabled[makeGroupKey('weekly', base)] = true;
              resetPartySizes[bossName] = partySize;
              resetSelectedVariants[makeGroupKey('weekly', base)] = bossName;
              found = true;
            }
          });
        }

        // Check monthly bosses
        if (!found) {
          groupedMonthly.forEach(([base, variants]) => {
            if (variants.some(v => v.name === bossName)) {
              resetBaseEnabled[makeGroupKey('monthly', base)] = true;
              resetPartySizes[bossName] = partySize;
              resetSelectedVariants[makeGroupKey('monthly', base)] = bossName;
              found = true;
            }
          });
        }
      }
    });

    // Notify parent component
    onPresetApplied?.({
      baseEnabledByBase: resetBaseEnabled,
      partySizes: resetPartySizes,
      selectedVariantByBase: resetSelectedVariants
    });

    setSelectedPreset(presetName);

    toast({
      title: 'Preset Applied',
      description: `${presetName} preset applied successfully!`,
      className: 'progress-complete'
    });
  }, [getPresetBosses, groupedDaily, groupedWeekly, groupedMonthly, makeGroupKey, onPresetApplied, toast]);

  // Edit preset
  const editPreset = useCallback((presetName: string) => {
    const presetBosses = getPresetBosses(presetName);
    
    if (Object.keys(presetBosses).length === 0) {
      toast({ 
        title: 'Preset Not Found', 
        description: `No configuration found for ${presetName}`, 
        variant: 'destructive' 
      });
      return;
    }

    // Apply preset for editing (same logic as applyPreset)
    applyPreset(presetName);
    setEditingPreset(presetName);

    toast({
      title: 'Edit Mode Activated',
      description: `Editing ${presetName}. Make changes and save as a new preset.`,
      className: 'progress-complete'
    });
  }, [getPresetBosses, applyPreset, toast]);

  // Save custom preset
  const saveCustomPreset = useCallback((presetName: string, selectedBosses: string[], partySizes: Record<string, number>) => {
    if (selectedBosses.length === 0) {
      toast({
        title: 'Cannot Save Empty Preset',
        description: 'Please select at least one boss before saving the preset.',
        variant: 'destructive'
      });
      return;
    }

    // Create boss configuration object with party sizes and difficulty variants
    const bossConfig: Record<string, BossPresetConfig> = {};
    selectedBosses.forEach(bossName => {
      bossConfig[bossName] = {
        enabled: true,
        partySize: partySizes[bossName] || 1,
        difficulty: bossName
      };
    });

    // Save to localStorage
    try {
      const stored = localStorage.getItem('maplehub_custom_presets');
      const customPresets = stored ? JSON.parse(stored) : {};
      customPresets[presetName] = bossConfig;
      localStorage.setItem('maplehub_custom_presets', JSON.stringify(customPresets));

      // Add to presets list if not already there
      if (!presets.includes(presetName)) {
        const updatedPresets = [...presets, presetName];
        setPresets(updatedPresets);
        saveBossPresets(updatedPresets.filter(p => !DEFAULT_PRESET_NAMES.includes(p)));
      }

      setShowSavePresetDialog(false);
      setPendingPresetName('');
      toast({
        title: 'Preset Saved',
        description: `${presetName} preset saved with ${selectedBosses.length} boss(es), their party sizes, and difficulty variants!`,
        className: 'progress-complete'
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save preset. Please try again.',
        variant: 'destructive'
      });
    }
  }, [presets, toast]);

  // Update existing preset
  const updateExistingPreset = useCallback((presetName: string, selectedBosses: string[], partySizes: Record<string, number>) => {
    if (selectedBosses.length === 0) {
      toast({
        title: 'Cannot Save Empty Preset',
        description: 'Please select at least one boss before saving the preset.',
        variant: 'destructive'
      });
      return;
    }

    // Create boss configuration object with party sizes and difficulty variants
    const bossConfig: Record<string, BossPresetConfig> = {};
    selectedBosses.forEach(bossName => {
      bossConfig[bossName] = {
        enabled: true,
        partySize: partySizes[bossName] || 1,
        difficulty: bossName
      };
    });

    // Save to localStorage
    try {
      const stored = localStorage.getItem('maplehub_custom_presets');
      const customPresets = stored ? JSON.parse(stored) : {};
      customPresets[presetName] = bossConfig;
      localStorage.setItem('maplehub_custom_presets', JSON.stringify(customPresets));

      // Clear editing state
      setEditingPreset(null);
      setSelectedPreset(presetName);

      toast({
        title: 'Preset Updated',
        description: `${presetName} preset updated with ${selectedBosses.length} boss(es), their party sizes, and difficulty variants!`,
        className: 'progress-complete'
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update preset. Please try again.',
        variant: 'destructive'
      });
    }
  }, [toast]);

  // Delete a custom preset
  const deletePreset = useCallback((presetName: string) => {
    // Don't allow deletion of default presets
    if (DEFAULT_PRESET_NAMES.includes(presetName)) {
      toast({
        title: 'Cannot Delete',
        description: 'Default presets cannot be deleted.',
        variant: 'destructive'
      });
      return;
    }

    try {
      // Remove from presets list
      const updatedPresets = presets.filter(p => p !== presetName);
      setPresets(updatedPresets);
      saveBossPresets(updatedPresets.filter(p => !DEFAULT_PRESET_NAMES.includes(p)));

      // Remove from custom presets storage
      const stored = localStorage.getItem('maplehub_custom_presets');
      if (stored) {
        const customPresets = JSON.parse(stored);
        delete customPresets[presetName];
        localStorage.setItem('maplehub_custom_presets', JSON.stringify(customPresets));
      }

      toast({
        title: 'Preset Deleted',
        description: `${presetName} preset deleted successfully!`,
        className: 'progress-complete'
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete preset. Please try again.',
        variant: 'destructive'
      });
    }
  }, [presets, toast]);

  // Clear editing state
  const clearEditingState = useCallback(() => {
    setEditingPreset(null);
    setSelectedPreset(null);
  }, []);

  return {
    // State
    presets,
    newPresetName,
    showAddPreset,
    showSavePresetDialog,
    pendingPresetName,
    editingPreset,
    selectedPreset,

    // Actions
    setNewPresetName,
    setShowAddPreset,
    setShowSavePresetDialog,
    setPendingPresetName,
    setEditingPreset,
    setSelectedPreset,

    // Functions
    applyPreset,
    editPreset,
    saveCustomPreset,
    updateExistingPreset,
    deletePreset,
    clearEditingState,
    getPresetBosses,
  };
};
