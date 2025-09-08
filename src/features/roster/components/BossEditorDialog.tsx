import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Calendar, BarChart3, RotateCcw, Pencil, XIcon } from 'lucide-react';
import { listAllBosses, getMaxPartySize } from '@/lib/bossData';
import { getCharacterWorldMultiplier } from '@/features/boss-tracker/utils/bossUtils';
import { useToast } from '@/hooks/use-toast';
import { Character } from '../types/roster';

interface BossEditorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  characterName: string | null;
  pendingBulkNames: string[] | null;
  characters: Character[];
  onSave: (characterName: string, config: BossConfiguration) => void;
}

interface BossConfiguration {
  enabled: Record<string, boolean>;
  partySizes: Record<string, number>;
}

const BossEditorDialog: React.FC<BossEditorDialogProps> = ({
  open,
  onOpenChange,
  characterName,
  pendingBulkNames,
  characters,
  onSave,
}) => {
  const { toast } = useToast();
  const allBosses = listAllBosses();
  
  // UI State
  const [activeTab, setActiveTab] = useState<'monthly' | 'weekly' | 'daily'>('weekly');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Boss Configuration State
  const [selectedBossEnabled, setSelectedBossEnabled] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    allBosses.forEach(b => { initial[b.name] = b.defaultEnabled; });
    return initial;
  });
  const [partySizes, setPartySizes] = useState<Record<string, number>>(() => {
    const initial: Record<string, number> = {};
    allBosses.forEach(b => { initial[b.name] = 1; });
    return initial;
  });
  const [selectedVariantByBase, setSelectedVariantByBase] = useState<Record<string, string>>({});
  const [baseEnabledByBase, setBaseEnabledByBase] = useState<Record<string, boolean>>({});
  
  // Preset State
  const [presets, setPresets] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem('maplehub_boss_presets');
      const defaultPresets = ['NLomien Mule', 'HLotus Mule', 'Ctene Mule'];
      if (stored) {
        const parsed = JSON.parse(stored);
        const merged = [...defaultPresets, ...parsed.filter((p: string) => !defaultPresets.includes(p))];
        return merged;
      }
      return defaultPresets;
    } catch {
      return ['NLomien Mule', 'HLotus Mule', 'Ctene Mule'];
    }
  });
  const [newPresetName, setNewPresetName] = useState('');
  const [showAddPreset, setShowAddPreset] = useState(false);
  const [showSavePresetDialog, setShowSavePresetDialog] = useState(false);
  const [pendingPresetName, setPendingPresetName] = useState('');
  const [editingPreset, setEditingPreset] = useState<string | null>(null);
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);

  // Helper functions
  const makeGroupKey = (category: 'monthly' | 'weekly' | 'daily', base: string) => `${category}:${base}`;

  const parseBoss = (fullName: string): { difficulty: string; base: string } => {
    const parts = fullName.split(' ');
    const difficulty = parts[0];
    const base = parts.slice(1).join(' ');
    return { difficulty, base };
  };

  // Boss grouping logic
  const grouped = (() => {
    const m = new Map<string, Array<{ name: string; difficulty: string; mesos: number; imageUrl: string }>>();
    for (const b of allBosses) {
      const { difficulty, base } = parseBoss(b.name);
      if (!m.has(base)) m.set(base, []);
      m.get(base)!.push({ name: b.name, difficulty, mesos: b.mesos, imageUrl: b.imageUrl });
    }
    // Sort variants by typical difficulty order
    const order = new Map([['Easy', 0], ['Normal', 1], ['Chaos', 2], ['Hard', 3], ['Extreme', 4]]);
    for (const [k, arr] of m) {
      arr.sort((a, z) => (order.get(a.difficulty) ?? 99) - (order.get(z.difficulty) ?? 99));
    }
    return Array.from(m.entries()).sort((a, z) => a[0].localeCompare(z[0]));
  })();

  // Categorization for tabs
  const dailyVariants = new Set([
    'Normal Zakum', 'Normal Magnus', 'Normal Hilla', 'Normal Papulatus',
    'Normal Pierre', 'Normal Von Bon', 'Normal Crimson Queen', 'Normal Vellum',
    'Normal Von Leon', 'Hard Von Leon', 'Normal Horntail', 'Chaos Horntail',
    'Easy Arkarium', 'Normal Arkarium', 'Normal Pink Bean', 'Normal Ranmaru',
    'Hard Ranmaru', 'Normal Gollux'
  ]);

  const isMonthlyBase = (base: string) => base.includes('Black Mage');
  
  const sortByMesosDesc = (list: Array<[string, Array<{ name: string; difficulty: string; mesos: number; imageUrl: string }>]>) =>
    list.sort((a, z) => {
      const aMax = Math.max(...a[1].map(v => v.mesos));
      const zMax = Math.max(...z[1].map(v => v.mesos));
      return zMax - aMax;
    });

  // Build per-tab groups
  const groupedDaily = sortByMesosDesc(
    grouped
      .map(([base, vars]) => [base, vars.filter(v => dailyVariants.has(v.name))] as [string, typeof vars])
      .filter(([_, vars]) => vars.length > 0)
  );
  const groupedWeekly = sortByMesosDesc(
    grouped
      .map(([base, vars]) => [base, vars.filter(v => !dailyVariants.has(v.name) && !isMonthlyBase(base))] as [string, typeof vars])
      .filter(([_, vars]) => vars.length > 0)
  );
  const groupedMonthly = sortByMesosDesc(
    grouped
      .map(([base, vars]) => [base, isMonthlyBase(base) ? vars : []] as [string, typeof vars])
      .filter(([_, vars]) => vars.length > 0)
  );

  // Filtered data for search
  const filteredGroupedDaily = searchQuery ? groupedDaily.filter(([base]) => base.toLowerCase().includes(searchQuery.toLowerCase())) : groupedDaily;
  const filteredGroupedWeekly = searchQuery ? groupedWeekly.filter(([base]) => base.toLowerCase().includes(searchQuery.toLowerCase())) : groupedWeekly;
  const filteredGroupedMonthly = searchQuery ? groupedMonthly.filter(([base]) => base.toLowerCase().includes(searchQuery.toLowerCase())) : groupedMonthly;

  // Get currently selected bosses
  const getCurrentlySelectedBosses = () => {
    const selectedBosses: string[] = [];
    ([['daily', groupedDaily], ['weekly', groupedWeekly], ['monthly', groupedMonthly]] as const).forEach(([cat, data]) => {
      data.forEach(([base, variants]) => {
        const gkey = makeGroupKey(cat, base);
        const enabled = !!baseEnabledByBase[gkey];
        if (enabled) {
          const selectedVariant = selectedVariantByBase[gkey] || variants[0]?.name;
          if (selectedVariant) {
            selectedBosses.push(selectedVariant);
          }
        }
      });
    });
    return selectedBosses;
  };

  // Preset boss configurations
  const getPresetBosses = (presetName: string) => {
    const presetConfigs: Record<string, Record<string, { enabled: boolean; partySize: number; difficulty: string }>> = {
      'NLomien Mule': {
        'Normal Lotus': { "enabled": true, "partySize": 1, "difficulty": "Normal Lotus" },
        "Normal Damien": { "enabled": true, "partySize": 1, "difficulty": "Normal Damien" },
        "Normal Akechi": { "enabled": true, "partySize": 1, "difficulty": "Normal Akechi" },
        "Chaos Papulatus": { "enabled": true, "partySize": 1, "difficulty": "Chaos Papulatus" },
        "Chaos Vellum": { "enabled": true, "partySize": 1, "difficulty": "Chaos Vellum" },
        "Hard Magnus": { "enabled": true, "partySize": 1, "difficulty": "Hard Magnus" },
        "Chaos Crimson Queen": { "enabled": true, "partySize": 1, "difficulty": "Chaos Crimson Queen" },
        "Chaos Pierre": { "enabled": true, "partySize": 1, "difficulty": "Chaos Pierre" },
        "Normal Princess No": { "enabled": true, "partySize": 1, "difficulty": "Normal Princess No" },
        "Chaos Von Bon": { "enabled": true, "partySize": 1, "difficulty": "Chaos Von Bon" },
        "Chaos Zakum": { "enabled": true, "partySize": 1, "difficulty": "Chaos Zakum" },
        "Normal Cygnus": { "enabled": true, "partySize": 1, "difficulty": "Normal Cygnus" },
        "Chaos Pink Bean": { "enabled": true, "partySize": 1, "difficulty": "Chaos Pink Bean" },
        "Hard Hilla": { "enabled": true, "partySize": 1, "difficulty": "Hard Hilla" }
      },
      'HLotus Mule': {
        "Hard Lotus": { "enabled": true, "partySize": 1, "difficulty": "Hard Lotus" },
        "Normal Slime": { "enabled": true, "partySize": 1, "difficulty": "Normal Slime" },
        "Easy Lucid": { "enabled": true, "partySize": 1, "difficulty": "Easy Lucid" },
        "Normal Damien": { "enabled": true, "partySize": 1, "difficulty": "Normal Damien" },
        "Normal Akechi": { "enabled": true, "partySize": 1, "difficulty": "Normal Akechi" },
        "Chaos Papulatus": { "enabled": true, "partySize": 1, "difficulty": "Chaos Papulatus" },
        "Chaos Vellum": { "enabled": true, "partySize": 1, "difficulty": "Chaos Vellum" },
        "Hard Magnus": { "enabled": true, "partySize": 1, "difficulty": "Hard Magnus" },
        "Chaos Crimson Queen": { "enabled": true, "partySize": 1, "difficulty": "Chaos Crimson Queen" },
        "Chaos Pierre": { "enabled": true, "partySize": 1, "difficulty": "Chaos Pierre" },
        "Normal Princess No": { "enabled": true, "partySize": 1, "difficulty": "Normal Princess No" },
        "Chaos Von Bon": { "enabled": true, "partySize": 1, "difficulty": "Chaos Von Bon" },
        "Chaos Zakum": { "enabled": true, "partySize": 1, "difficulty": "Chaos Zakum" },
        "Easy Cygnus": { "enabled": true, "partySize": 1, "difficulty": "Easy Cygnus" }
      },
      'Ctene Mule': {
        "Hard Lotus": { "enabled": true, "partySize": 1, "difficulty": "Hard Lotus" },
        "Hard Verus Hilla": { "enabled": true, "partySize": 1, "difficulty": "Hard Verus Hilla" },
        "Hard Darknell": { "enabled": true, "partySize": 1, "difficulty": "Hard Darknell" },
        "Hard Will": { "enabled": true, "partySize": 1, "difficulty": "Hard Will" },
        "Chaos Slime": { "enabled": true, "partySize": 1, "difficulty": "Chaos Slime" },
        "Chaos Gloom": { "enabled": true, "partySize": 1, "difficulty": "Chaos Gloom" },
        "Hard Lucid": { "enabled": true, "partySize": 1, "difficulty": "Hard Lucid" },
        "Hard Damien": { "enabled": true, "partySize": 1, "difficulty": "Hard Damien" },
        "Normal Akechi": { "enabled": true, "partySize": 1, "difficulty": "Normal Akechi" },
        "Chaos Papulatus": { "enabled": true, "partySize": 1, "difficulty": "Chaos Papulatus" },
        "Chaos Vellum": { "enabled": true, "partySize": 1, "difficulty": "Chaos Vellum" },
        "Hard Magnus": { "enabled": true, "partySize": 1, "difficulty": "Hard Magnus" },
        "Chaos Crimson Queen": { "enabled": true, "partySize": 1, "difficulty": "Chaos Crimson Queen" },
        "Chaos Zakum": { "enabled": true, "partySize": 1, "difficulty": "Chaos Zakum" }
      },
    };
    return presetConfigs[presetName] || {};
  };

  // Apply preset
  const applyPreset = (presetName: string) => {
    let presetBosses = getPresetBosses(presetName);
    let isCustomPreset = false;

    // If not found in hardcoded presets, check custom presets in localStorage
    if (Object.keys(presetBosses).length === 0) {
      const stored = localStorage.getItem('maplehub_custom_presets');
      if (stored) {
        const customPresets = JSON.parse(stored);
        presetBosses = customPresets[presetName] || {};
        isCustomPreset = true;
      }
    }

    if (Object.keys(presetBosses).length === 0) {
      toast({ title: 'Preset Not Found', description: `No configuration found for ${presetName}`, variant: 'destructive' });
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
      // Handle both old format (boolean) and new format (object with enabled and partySize)
      const enabled = isCustomPreset ? (config as any).enabled : (config as any).enabled;
      const partySize = isCustomPreset ? (config as any).partySize || 1 : (config as any).partySize || 1;

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

    // Update state
    setBaseEnabledByBase(resetBaseEnabled);
    setPartySizes(resetPartySizes);
    setSelectedVariantByBase(resetSelectedVariants);
    setSelectedPreset(presetName);

    toast({
      title: 'Preset Applied',
      description: `${presetName} preset applied successfully!`,
      className: 'progress-complete'
    });
  };

  // Edit preset
  const editPreset = (presetName: string) => {
    let presetBosses = getPresetBosses(presetName);
    let isCustomPreset = false;

    // If not found in hardcoded presets, check custom presets in localStorage
    if (Object.keys(presetBosses).length === 0) {
      const stored = localStorage.getItem('maplehub_custom_presets');
      if (stored) {
        const customPresets = JSON.parse(stored);
        presetBosses = customPresets[presetName] || {};
        isCustomPreset = true;
      }
    }

    if (Object.keys(presetBosses).length === 0) {
      toast({ title: 'Preset Not Found', description: `No configuration found for ${presetName}`, variant: 'destructive' });
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

    // Apply preset selections for editing
    Object.entries(presetBosses).forEach(([bossName, config]) => {
      const enabled = isCustomPreset ? (config as any).enabled : (config as any).enabled;
      const partySize = isCustomPreset ? (config as any).partySize || 1 : (config as any).partySize || 1;

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

    // Update state
    setBaseEnabledByBase(resetBaseEnabled);
    setPartySizes(prev => ({ ...prev, ...resetPartySizes }));
    setSelectedVariantByBase(prev => ({ ...prev, ...resetSelectedVariants }));
    setEditingPreset(presetName);

    toast({
      title: 'Edit Mode Activated',
      description: `Editing ${presetName}. Make changes and save as a new preset.`,
      className: 'progress-complete'
    });
  };

  // Save custom preset
  const saveCustomPreset = (presetName: string) => {
    const selectedBosses = getCurrentlySelectedBosses();
    if (selectedBosses.length === 0) {
      toast({
        title: 'Cannot Save Empty Preset',
        description: 'Please select at least one boss before saving the preset.',
        variant: 'destructive'
      });
      return;
    }

    // Create boss configuration object with party sizes and difficulty variants
    const bossConfig: Record<string, { enabled: boolean; partySize: number; difficulty: string }> = {};
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
        localStorage.setItem('maplehub_boss_presets', JSON.stringify(updatedPresets));
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
  };

  // Delete a custom preset
  const deletePreset = (presetName: string) => {
    // Don't allow deletion of default presets
    const defaultPresets = ['NLomien Mule', 'HLotus Mule', 'Ctene Mule'];
    if (defaultPresets.includes(presetName)) {
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
      localStorage.setItem('maplehub_boss_presets', JSON.stringify(updatedPresets));

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
  };

  // Load configuration when dialog opens (only once)
  useEffect(() => {
    if (open && characterName) {
      try {
        // Load stored enables and party sizes
        const enabledKey = 'maplehub_boss_enabled';
        const partyKey = 'maplehub_boss_party';
        const enabledStored = localStorage.getItem(enabledKey);
        const partyStored = localStorage.getItem(partyKey);
        const enabledParsed = enabledStored ? (JSON.parse(enabledStored) as Record<string, Record<string, boolean>>) : {};
        const partyParsed = partyStored ? (JSON.parse(partyStored) as Record<string, Record<string, number>>) : {};
        const enabledForChar = enabledParsed[characterName] || {};
        const partyForChar = partyParsed[characterName] || {};

        const nextSelectedByBase: Record<string, string> = {};
        const nextBaseEnabledByBase: Record<string, boolean> = {};

        (['daily', 'weekly', 'monthly'] as const).forEach((cat) => {
          const data = cat === 'daily' ? groupedDaily : cat === 'weekly' ? groupedWeekly : groupedMonthly;
          data.forEach(([base, variants]) => {
            const gkey = makeGroupKey(cat, base);
            const firstEnabled = variants.find(v => enabledForChar[v.name]);
            const pick = (firstEnabled?.name) || variants[0]?.name || '';
            if (pick) nextSelectedByBase[gkey] = pick;
            nextBaseEnabledByBase[gkey] = !!firstEnabled;
          });
        });

        // Merge party sizes with defaults
        const nextPartySizes: Record<string, number> = {};
        listAllBosses().forEach(b => {
          const n = partyForChar[b.name];
          nextPartySizes[b.name] = Number.isFinite(n) ? Math.max(1, Math.min(getMaxPartySize(b.name), Math.floor(n))) : 1;
        });

        setSelectedVariantByBase(nextSelectedByBase);
        setBaseEnabledByBase(nextBaseEnabledByBase);
        setPartySizes(nextPartySizes);
      } catch {
        // Fall back to defaults if anything goes wrong
        const defaults: Record<string, boolean> = {};
        const parties: Record<string, number> = {};
        const selectedByBase: Record<string, string> = {};
        const enabledByBase: Record<string, boolean> = {};
        listAllBosses().forEach(b => { 
          defaults[b.name] = b.defaultEnabled; 
          parties[b.name] = 1; 
        });
        ([['daily', groupedDaily], ['weekly', groupedWeekly], ['monthly', groupedMonthly]] as const).forEach(([cat, data]) => {
          data.forEach(([base, variants]) => {
            const key = makeGroupKey(cat, base);
            const preferred = variants.find(v => defaults[v.name]);
            const pick = preferred?.name || variants[0]?.name;
            if (pick) selectedByBase[key] = pick;
            enabledByBase[key] = preferred ? true : false;
          });
        });
        setSelectedBossEnabled(defaults);
        setPartySizes(parties);
        setSelectedVariantByBase(selectedByBase);
        setBaseEnabledByBase(enabledByBase);
      }
    }
  }, [open, characterName]); // Removed groupedDaily, groupedWeekly, groupedMonthly from dependencies

  const handleSave = () => {
    if (!characterName) return;

    try {
      const key = 'maplehub_boss_enabled';
      const stored = localStorage.getItem(key);
      const parsed = stored ? (JSON.parse(stored) as Record<string, Record<string, boolean>>) : {};
      const out: Record<string, boolean> = {};
      ([['daily', groupedDaily], ['weekly', groupedWeekly], ['monthly', groupedMonthly]] as const).forEach(([cat, data]) => {
        data.forEach(([base, variants]) => {
          const gkey = makeGroupKey(cat, base);
          const enabled = !!baseEnabledByBase[gkey];
          const sel = selectedVariantByBase[gkey] || variants[0]?.name;
          variants.forEach(v => { if (!(v.name in out)) out[v.name] = false; });
          if (enabled && sel) out[sel] = true;
        });
      });
      if (pendingBulkNames && pendingBulkNames.length > 0) {
        pendingBulkNames.forEach(n => { parsed[n] = out; });
      } else {
        parsed[characterName] = out;
      }
      localStorage.setItem(key, JSON.stringify(parsed));
      const pkey = 'maplehub_boss_party';
      const pstored = localStorage.getItem(pkey);
      const pparsed = pstored ? (JSON.parse(pstored) as Record<string, Record<string, number>>) : {};
      if (pendingBulkNames && pendingBulkNames.length > 0) {
        pendingBulkNames.forEach(n => { pparsed[n] = { ...partySizes }; });
      } else {
        pparsed[characterName] = { ...partySizes };
      }
      localStorage.setItem(pkey, JSON.stringify(pparsed));
    } catch {}
    
    onOpenChange(false);
    toast({ 
      title: 'Bosses Saved', 
      description: 'Your boss selections were saved for this character.', 
      className: 'progress-complete' 
    });
  };

  return (
    <>
      <Dialog open={open} onOpenChange={(open) => {
        onOpenChange(open);
        if (!open) {
          // Exit edit mode and clear selected preset when dialog is closed
          setEditingPreset(null);
          setSelectedPreset(null);
        }
      }}>
        <DialogContent className="max-w-4xl w-[95vw] max-h-[95vh] overflow-hidden flex flex-col">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle>
              {pendingBulkNames && pendingBulkNames.length > 1
                ? `Choose bosses for ${pendingBulkNames.length} characters`
                : `Choose bosses for ${characterName}`}
            </DialogTitle>
            <DialogDescription className="hidden sm:block">
              Select bosses and configure party sizes for this character. Monthly bosses have no restrictions, while weekly bosses are limited to 14 total.
            </DialogDescription>
            <DialogDescription className="sm:hidden text-sm">
              Choose bosses and party sizes. Weekly limit: 14
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4 h-full">
            {/* Mobile Layout - Header + Content */}
            <div className="lg:hidden flex flex-col min-h-0 flex-1">
              {/* Mobile Header */}
              <div className="bg-background/95 backdrop-blur-sm border border-border rounded-lg p-3 mb-4 flex-shrink-0">
                {/* Compact Navigation and Presets in one row */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  {/* Tab Selector */}
                  <Select value={activeTab} onValueChange={(value: 'monthly' | 'weekly' | 'daily') => setActiveTab(value)}>
                    <SelectTrigger className="w-32 h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="monthly" className="text-xs">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          Monthly
                        </div>
                      </SelectItem>
                      <SelectItem value="weekly" className="text-xs">
                        <div className="flex items-center gap-2">
                          <BarChart3 className="h-4 w-4" />
                          Weekly
                        </div>
                      </SelectItem>
                      <SelectItem value="daily" className="text-xs">
                        <div className="flex items-center gap-2">
                          <RotateCcw className="h-4 w-4" />
                          Daily
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>

                  {/* Preset Selector */}
                  <Select value={selectedPreset || 'none'} onValueChange={(value) => {
                    if (value && value !== 'none') {
                      applyPreset(value);
                    } else {
                      setSelectedPreset(null);
                    }
                  }}>
                    <SelectTrigger className="w-32 h-8 text-xs">
                      <SelectValue placeholder="Presets" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none" className="text-xs text-muted-foreground">
                        Clear selection
                      </SelectItem>
                      {presets.map((preset) => (
                        <SelectItem key={`preset-${preset}`} value={preset} className="text-xs">
                          {preset}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {/* Quick Add Preset Button */}
                  <Button
                    onClick={() => setShowAddPreset(true)}
                    variant="ghost"
                    size="sm"
                    className="h-8 px-2 text-xs text-muted-foreground hover:text-primary"
                  >
                    +
                  </Button>
                </div>

                {/* Editing Status */}
                {editingPreset && (
                  <div className="text-xs text-primary font-medium mb-2 flex items-center gap-2">
                    <span>✏️ Editing: {editingPreset}</span>
                    <Button
                      onClick={() => setEditingPreset(null)}
                      variant="ghost"
                      size="sm"
                      className="h-6 px-2 text-xs"
                    >
                      Cancel
                    </Button>
                  </div>
                )}

                {/* Add Preset Form */}
                {showAddPreset && (
                  <div className="flex gap-2 mb-2">
                    <Input
                      placeholder="Preset name"
                      value={newPresetName}
                      onChange={(e) => setNewPresetName(e.target.value)}
                      className="h-7 text-xs flex-1"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && newPresetName.trim()) {
                          setPendingPresetName(newPresetName.trim());
                          setShowSavePresetDialog(true);
                          setShowAddPreset(false);
                        } else if (e.key === 'Escape') {
                          setNewPresetName('');
                          setShowAddPreset(false);
                        }
                      }}
                    />
                    <Button
                      onClick={() => {
                        if (newPresetName.trim()) {
                          setPendingPresetName(newPresetName.trim());
                          setShowSavePresetDialog(true);
                          setShowAddPreset(false);
                        }
                      }}
                      size="sm"
                      className="h-7 px-2"
                    >
                      ✓
                    </Button>
                    <Button
                      onClick={() => {
                        setNewPresetName('');
                        setShowAddPreset(false);
                      }}
                      variant="outline"
                      size="sm"
                      className="h-7 px-2"
                    >
                      ✕
                    </Button>
                  </div>
                )}
              </div>

              {/* Mobile Main Content - Flexible height */}
              <div className="flex-1 min-h-0">
                {/* Search Bar */}
                <div className="mb-4 flex-shrink-0">
                  <Input
                    placeholder={`Search ${activeTab} bosses...`}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full"
                  />
                </div>
                <ScrollArea className="flex-1 rounded border p-4 h-[50vh]" style={{ border: '0' }}>
                  <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
                    {([['monthly', filteredGroupedMonthly], ['weekly', filteredGroupedWeekly], ['daily', filteredGroupedDaily]] as const).map(([key, data]) => (
                      <TabsContent key={key} value={key} className="m-0">
                        {data.length === 0 ? (
                          <div className="text-center py-8 text-muted-foreground">
                            <p>No {key} bosses found matching your search.</p>
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {data.map(([base, variants]) => {
                              const isSelected = !!baseEnabledByBase[makeGroupKey(key, base)];
                              const selectedVariant = selectedVariantByBase[makeGroupKey(key, base)] || variants[0]?.name;
                              const currentVariant = variants.find(v => v.name === selectedVariant) || variants[0];
                              const partySize = partySizes[currentVariant?.name || ''] || 1;
                              // Determine world multiplier based on character's world
                              const worldMultiplier = getCharacterWorldMultiplier(characters.find(c => c.name === characterName) || characters[0]);
                              const mesosShare = currentVariant ? Math.floor((currentVariant.mesos / Math.max(1, partySize)) * worldMultiplier) : 0;

                              return (
                                <div
                                  key={`boss-${key}-${base}`}
                                  className={`relative rounded-lg border-2 transition-all duration-200 hover:shadow-lg ${
                                    isSelected
                                      ? 'border-primary bg-primary/5 shadow-md'
                                      : 'border-border hover:border-primary/50'
                                  }`}
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

                                  <div className="p-4 cursor-pointer" onClick={() => {
                                    const currentWeeklyCount = Object.values(baseEnabledByBase).filter((enabled, index) => {
                                      const keys = Object.keys(baseEnabledByBase);
                                      const key = keys[index];
                                      return enabled && key.startsWith('weekly:');
                                    }).length;

                                    const isWeekly = key === 'weekly';
                                    const isDaily = key === 'daily';
                                    const wouldExceedLimit = (isWeekly || isDaily) && !isSelected && currentWeeklyCount >= 14;

                                    if (wouldExceedLimit) {
                                      toast({
                                        title: "Weekly Boss Limit Reached",
                                        description: "You've reached the 14 weekly boss limit. Please remove another boss before adding this one.",
                                        variant: "destructive"
                                      });
                                      return;
                                    }

                                    setBaseEnabledByBase(prev => ({ ...prev, [makeGroupKey(key, base)]: !prev[makeGroupKey(key, base)] }));
                                  }}>
                                    {/* Boss Image */}
                                    <div className="flex justify-center mb-3">
                                      <div className="relative p-2 bg-gradient-to-br from-background to-muted/20 rounded-lg border border-border/50">
                                        <img
                                          src={variants[0].imageUrl}
                                          alt={base}
                                          className="h-6 w-6 rounded-sm object-cover border border-border/30"
                                          style={{
                                            imageRendering: 'pixelated'
                                          }}
                                          onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/placeholder.svg'; }}
                                        />
                                        <div className="absolute inset-0 rounded-lg bg-gradient-to-t from-black/5 to-transparent pointer-events-none" />
                                      </div>
                                    </div>

                                    {/* Boss Name */}
                                    <h3 className="font-semibold text-sm text-center mb-2 text-primary truncate">{base}</h3>

                                    {/* Difficulty Selector */}
                                    <div className="mb-3">
                                      <Select
                                        value={selectedVariant}
                                        onValueChange={(value) => setSelectedVariantByBase(prev => ({ ...prev, [makeGroupKey(key, base)]: value }))}
                                      >
                                        <SelectTrigger className="w-full h-8 text-xs">
                                          <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                          {variants.map(v => (
                                            <SelectItem key={v.name} value={v.name} className="text-xs">
                                              {v.difficulty}
                                            </SelectItem>
                                          ))}
                                        </SelectContent>
                                      </Select>
                                    </div>

                                    {/* Party Size */}
                                    <div className="flex items-center justify-between mb-2">
                                      <span className="text-xs text-muted-foreground">Party:</span>
                                      <div className="flex items-center gap-1">
                                        <Button
                                          type="button"
                                          variant="outline"
                                          size="sm"
                                          className="h-6 w-6 p-0"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            const newSize = Math.max(1, partySize - 1);
                                            setPartySizes(prev => ({ ...prev, [currentVariant?.name || '']: newSize }));
                                          }}
                                        >
                                          -
                                        </Button>
                                        <span className="text-xs w-6 text-center">{partySize}</span>
                                        <Button
                                          type="button"
                                          variant="outline"
                                          size="sm"
                                          className="h-6 w-6 p-0"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            const maxSize = getMaxPartySize(currentVariant?.name || '');
                                            const newSize = Math.min(maxSize, partySize + 1);
                                            setPartySizes(prev => ({ ...prev, [currentVariant?.name || '']: newSize }));
                                          }}
                                        >
                                          +
                                        </Button>
                                      </div>
                                    </div>

                                    {/* Mesos Estimate */}
                                    <div className="text-center">
                                      <div className="text-xs text-muted-foreground">Est. Mesos</div>
                                      <div className="font-semibold text-sm text-primary">
                                        {mesosShare.toLocaleString()}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </TabsContent>
                    ))}
                  </Tabs>
                </ScrollArea>
              </div>
            </div>

            {/* Desktop Layout - Sidebar and Main Content Side by Side */}
            <div className="hidden lg:flex lg:flex-row gap-4">
              {/* Desktop Sidebar */}
              <div className="w-48 flex-shrink-0">
                <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border border-border rounded-lg p-2">
                  <nav className="space-y-2 py-2">
                    <Button
                      onClick={() => setActiveTab('monthly')}
                      variant={activeTab === 'monthly' ? "default" : "ghost"}
                      className={`w-full justify-start space-x-2 ${
                        activeTab === 'monthly'
                          ? 'btn-hero shadow-[var(--shadow-button)]'
                          : 'hover:bg-card hover:text-primary'
                      }`}
                    >
                      <Calendar className="h-4 w-4" />
                      <span>Monthly</span>
                    </Button>
                    <Button
                      onClick={() => setActiveTab('weekly')}
                      variant={activeTab === 'weekly' ? "default" : "ghost"}
                      className={`w-full justify-start space-x-2 ${
                        activeTab === 'weekly'
                          ? 'btn-hero shadow-[var(--shadow-button)]'
                          : 'hover:bg-card hover:text-primary'
                      }`}
                    >
                      <BarChart3 className="h-4 w-4" />
                      <span>Weekly</span>
                    </Button>
                    <Button
                      onClick={() => setActiveTab('daily')}
                      variant={activeTab === 'daily' ? "default" : "ghost"}
                      className={`w-full justify-start space-x-2 ${
                        activeTab === 'daily'
                          ? 'btn-hero shadow-[var(--shadow-button)]'
                          : 'hover:bg-card hover:text-primary'
                      }`}
                    >
                      <RotateCcw className="h-4 w-4" />
                      <span>Daily</span>
                    </Button>
                  </nav>

                  {/* Presets Section */}
                  <div className="mt-6 pt-4 border-t border-border/50">
                    <div className="text-xs font-semibold text-muted-foreground mb-3 uppercase tracking-wide">
                      Presets
                    </div>
                    <div className="space-y-2">
                      {editingPreset && (
                        <div className="text-xs text-primary font-medium mb-2 flex items-center gap-2">
                          <span>✏️ Editing: {editingPreset}</span>
                        </div>
                      )}
                      {presets.map((preset) => {
                        const isDefaultPreset = ['NLomien Mule', 'HLotus Mule', 'Ctene Mule'].includes(preset);
                        const isBeingEdited = editingPreset === preset;
                        const isEditMode = editingPreset !== null;
                        return (
                          <div key={`preset-${preset}`} className="flex items-center gap-1">
                            <Button
                              onClick={() => applyPreset(preset)}
                              variant={selectedPreset === preset ? "default" : "outline"}
                              size="sm"
                              className={`flex-1 justify-start text-xs h-8 ${
                                selectedPreset === preset
                                  ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                                  : ''
                              }`}
                              disabled={isEditMode && !isBeingEdited}
                            >
                              {preset}
                            </Button>
                            {!isDefaultPreset && (
                              <>
                                <Button
                                  onClick={() => editPreset(preset)}
                                  variant={isBeingEdited ? "default" : "ghost"}
                                  size="sm"
                                  className={`h-8 w-8 p-0 ${
                                    isBeingEdited
                                      ? 'text-primary-foreground bg-primary hover:bg-primary/90'
                                      : 'text-muted-foreground hover:text-primary'
                                  }`}
                                  title={isBeingEdited ? `Finish editing ${preset}` : `Edit ${preset} preset`}
                                >
                                  {isBeingEdited ? (
                                    <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                  ) : (
                                    <Pencil className="h-3 w-3" />
                                  )}
                                </Button>
                                {isEditMode ? (
                                  <Button
                                    onClick={() => setEditingPreset(null)}
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 w-8 p-0 text-muted-foreground hover:text-orange-500"
                                    title="Cancel editing and discard changes"
                                  >
                                    <XIcon className="h-3 w-3" />
                                  </Button>
                                ) : (
                                  <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-8 w-8 p-0 text-muted-foreground hover:text-red-500"
                                        title={`Delete ${preset} preset`}
                                      >
                                        <XIcon className="h-3 w-3" />
                                      </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                      <AlertDialogHeader>
                                        <AlertDialogTitle>Delete Preset: {preset}</AlertDialogTitle>
                                        <AlertDialogDescription>
                                          Are you sure you want to delete the "{preset}" preset? This action cannot be undone.
                                        </AlertDialogDescription>
                                      </AlertDialogHeader>
                                      <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction
                                          onClick={() => deletePreset(preset)}
                                          className="bg-red-600 hover:bg-red-700"
                                        >
                                          Delete
                                        </AlertDialogAction>
                                      </AlertDialogFooter>
                                    </AlertDialogContent>
                                  </AlertDialog>
                                )}
                              </>
                            )}
                          </div>
                        );
                      })}

                      {/* Add New Preset */}
                      {showAddPreset ? (
                        <div className="flex gap-1">
                          <Input
                            placeholder="Preset name"
                            value={newPresetName}
                            onChange={(e) => setNewPresetName(e.target.value)}
                            className="h-8 text-xs"
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' && newPresetName.trim()) {
                                setPendingPresetName(newPresetName.trim());
                                setShowSavePresetDialog(true);
                                setShowAddPreset(false);
                              } else if (e.key === 'Escape') {
                                setNewPresetName('');
                                setShowAddPreset(false);
                              }
                            }}
                          />
                          <Button
                            onClick={() => {
                              if (newPresetName.trim()) {
                                setPendingPresetName(newPresetName.trim());
                                setShowSavePresetDialog(true);
                                setShowAddPreset(false);
                              }
                            }}
                            size="sm"
                            className="h-8 px-2"
                          >
                            ✓
                          </Button>
                          <Button
                            onClick={() => {
                              setNewPresetName('');
                              setShowAddPreset(false);
                            }}
                            variant="outline"
                            size="sm"
                            className="h-8 px-2"
                          >
                            ✕
                          </Button>
                        </div>
                      ) : (
                        <Button
                          onClick={() => setShowAddPreset(true)}
                          variant="ghost"
                          size="sm"
                          className="w-full justify-start text-xs h-8 text-muted-foreground hover:text-primary"
                        >
                          + Add Preset
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Main Content - Scrollable Boss Grid */}
              <div className="flex-1 min-w-0">
                {/* Search Bar */}
                <div className="mb-4">
                  <Input
                    placeholder={`Search ${activeTab} bosses...`}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full max-w-sm"
                  />
                </div>
                <ScrollArea className="h-[50vh] sm:h-[60vh] lg:h-[65vh] rounded border p-4" style={{ border: '0' }}>
                  <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
                    {([['monthly', filteredGroupedMonthly], ['weekly', filteredGroupedWeekly], ['daily', filteredGroupedDaily]] as const).map(([key, data]) => (
                      <TabsContent key={key} value={key} className="m-0">
                        {data.length === 0 ? (
                          <div className="text-center py-8 text-muted-foreground">
                            <p>No {key} bosses found matching your search.</p>
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            {data.map(([base, variants]) => {
                              const isSelected = !!baseEnabledByBase[makeGroupKey(key, base)];
                              const selectedVariant = selectedVariantByBase[makeGroupKey(key, base)] || variants[0]?.name;
                              const currentVariant = variants.find(v => v.name === selectedVariant) || variants[0];
                              const partySize = partySizes[currentVariant?.name || ''] || 1;
                              // Determine world multiplier based on character's world
                              const worldMultiplier = getCharacterWorldMultiplier(characters.find(c => c.name === characterName) || characters[0]);
                              const mesosShare = currentVariant ? Math.floor((currentVariant.mesos / Math.max(1, partySize)) * worldMultiplier) : 0;

                              return (
                                <div
                                  key={`boss-${key}-${base}`}
                                  className={`relative rounded-lg border-2 transition-all duration-200 hover:shadow-lg ${
                                    isSelected
                                      ? 'border-primary bg-primary/5 shadow-md'
                                      : 'border-border hover:border-primary/50'
                                  }`}
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

                                  <div className="p-4 cursor-pointer" onClick={() => {
                                    const currentWeeklyCount = Object.values(baseEnabledByBase).filter((enabled, index) => {
                                      const keys = Object.keys(baseEnabledByBase);
                                      const key = keys[index];
                                      return enabled && key.startsWith('weekly:');
                                    }).length;

                                    const isWeekly = key === 'weekly';
                                    const isDaily = key === 'daily';
                                    const wouldExceedLimit = (isWeekly || isDaily) && !isSelected && currentWeeklyCount >= 14;

                                    if (wouldExceedLimit) {
                                      toast({
                                        title: "Weekly Boss Limit Reached",
                                        description: "You've reached the 14 weekly boss limit. Please remove another boss before adding this one.",
                                        variant: "destructive"
                                      });
                                      return;
                                    }

                                    setBaseEnabledByBase(prev => ({ ...prev, [makeGroupKey(key, base)]: !prev[makeGroupKey(key, base)] }));
                                  }}>
                                    {/* Boss Image */}
                                    <div className="flex justify-center mb-3">
                                      <div className="relative p-2 bg-gradient-to-br from-background to-muted/20 rounded-lg border border-border/50">
                                        <img
                                          src={variants[0].imageUrl}
                                          alt={base}
                                          className="h-6 w-6 rounded-sm object-cover border border-border/30"
                                          style={{
                                            imageRendering: 'pixelated'
                                          }}
                                          onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/placeholder.svg'; }}
                                        />
                                        <div className="absolute inset-0 rounded-lg bg-gradient-to-t from-black/5 to-transparent pointer-events-none" />
                                      </div>
                                    </div>

                                    {/* Boss Name */}
                                    <h3 className="font-semibold text-sm text-center mb-2 text-primary truncate">{base}</h3>

                                    {/* Difficulty Selector */}
                                    <div className="mb-3">
                                      <Select
                                        value={selectedVariant}
                                        onValueChange={(value) => setSelectedVariantByBase(prev => ({ ...prev, [makeGroupKey(key, base)]: value }))}
                                      >
                                        <SelectTrigger className="w-full h-8 text-xs">
                                          <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                          {variants.map(v => (
                                            <SelectItem key={v.name} value={v.name} className="text-xs">
                                              {v.difficulty}
                                            </SelectItem>
                                          ))}
                                        </SelectContent>
                                      </Select>
                                    </div>

                                    {/* Party Size */}
                                    <div className="flex items-center justify-between mb-2">
                                      <span className="text-xs text-muted-foreground">Party:</span>
                                      <div className="flex items-center gap-1">
                                        <Button
                                          type="button"
                                          variant="outline"
                                          size="sm"
                                          className="h-6 w-6 p-0"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            const newSize = Math.max(1, partySize - 1);
                                            setPartySizes(prev => ({ ...prev, [currentVariant?.name || '']: newSize }));
                                          }}
                                        >
                                          -
                                        </Button>
                                        <span className="text-xs w-6 text-center">{partySize}</span>
                                        <Button
                                          type="button"
                                          variant="outline"
                                          size="sm"
                                          className="h-6 w-6 p-0"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            const maxSize = getMaxPartySize(currentVariant?.name || '');
                                            const newSize = Math.min(maxSize, partySize + 1);
                                            setPartySizes(prev => ({ ...prev, [currentVariant?.name || '']: newSize }));
                                          }}
                                        >
                                          +
                                        </Button>
                                      </div>
                                    </div>

                                    {/* Mesos Estimate */}
                                    <div className="text-center">
                                      <div className="text-xs text-muted-foreground">Est. Mesos</div>
                                      <div className="font-semibold text-sm text-primary">
                                        {mesosShare.toLocaleString()}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </TabsContent>
                    ))}
                  </Tabs>
                </ScrollArea>
              </div>
            </div>
          </div>
          
          <DialogFooter className="flex-shrink-0 px-6 py-4 sm:px-6 sm:py-4">
            <div className="flex items-center justify-between w-full">
              <div className="flex flex-col">
                <div className="text-sm text-muted-foreground">
                  {(() => {
                    const weeklyCount = Object.values(baseEnabledByBase).filter((enabled, index) => {
                      const keys = Object.keys(baseEnabledByBase);
                      const key = keys[index];
                      return enabled && key.startsWith('weekly:');
                    }).length;
                    const totalCount = Object.values(baseEnabledByBase).filter(Boolean).length;
                    return `${weeklyCount}/14 • ${totalCount} total selected`;
                  })()}
                </div>
                <div className="text-xs text-muted-foreground/70 mt-1">
                  Monthly bosses can be selected without restriction.
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <div className="text-sm font-semibold text-primary">
                    {(() => {
                      let totalWeeklyMesos = 0;
                      // Determine world multiplier based on character's world
                      const worldMultiplier = getCharacterWorldMultiplier(characters.find(c => c.name === characterName) || characters[0]);

                      // Calculate weekly bosses earnings
                      groupedWeekly.forEach(([base, variants]) => {
                        const gkey = makeGroupKey('weekly', base);
                        const enabled = !!baseEnabledByBase[gkey];
                        if (enabled) {
                          const selectedVariant = selectedVariantByBase[gkey] || variants[0]?.name;
                          const variant = variants.find(v => v.name === selectedVariant);
                          if (variant) {
                            const partySize = partySizes[variant.name] || 1;
                            totalWeeklyMesos += Math.floor((variant.mesos / Math.max(1, partySize)) * worldMultiplier);
                          }
                        }
                      });
                      // Calculate daily bosses earnings (daily bosses can be done multiple times per week)
                      groupedDaily.forEach(([base, variants]) => {
                        const gkey = makeGroupKey('daily', base);
                        const enabled = !!baseEnabledByBase[gkey];
                        if (enabled) {
                          const selectedVariant = selectedVariantByBase[gkey] || variants[0]?.name;
                          const variant = variants.find(v => v.name === selectedVariant);
                          if (variant) {
                            const partySize = partySizes[variant.name] || 1;
                            // Assume 7 days per week for daily bosses
                            totalWeeklyMesos += Math.floor((variant.mesos / Math.max(1, partySize)) * 7 * worldMultiplier);
                          }
                        }
                      });
                      return totalWeeklyMesos.toLocaleString();
                    })()} mesos/week
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Estimated earnings
                  </div>
                </div>
                <Button
                  onClick={handleSave}
                  disabled={editingPreset !== null}
                  className="btn-hero w-full sm:w-auto"
                >Save</Button>
              </div>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Save Preset Dialog */}
      <Dialog open={showSavePresetDialog} onOpenChange={setShowSavePresetDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Save Preset: {pendingPresetName}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {(() => {
              const selectedBosses = getCurrentlySelectedBosses();
              if (selectedBosses.length === 0) {
                return (
                  <div className="text-center py-6">
                    <div className="text-red-500 text-4xl mb-2">⚠️</div>
                    <p className="text-muted-foreground">
                      No bosses selected. Cannot save empty preset.
                    </p>
                    <p className="text-sm text-muted-foreground mt-2">
                      Please select at least one boss before saving.
                    </p>
                  </div>
                );
              }
                
              return (
                <div>
                  <p className="text-sm text-muted-foreground mb-3">
                    This preset will include the following {selectedBosses.length} boss(es):
                  </p>
                  <ScrollArea className="h-48 border rounded p-3">
                    <div className="space-y-2">
                      {selectedBosses.map((bossName, index) => (
                        <div key={`selected-boss-${bossName}-${index}`} className="flex items-center justify-between gap-2 text-sm">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 bg-primary/10 rounded flex items-center justify-center text-xs font-semibold">
                              {index + 1}
                            </div>
                            <span className="text-primary font-medium">{bossName}</span>
                          </div>
                          <div className="text-xs text-muted-foreground bg-muted/50 px-2 py-1 rounded">
                            PT: {partySizes[bossName] || 1}
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                  <p className="text-xs text-muted-foreground mt-2">
                    You can apply this preset anytime to quickly select these bosses.
                  </p>
                </div>
              );
            })()}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowSavePresetDialog(false);
                setPendingPresetName('');
                setNewPresetName('');
                setShowAddPreset(false);
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={() => saveCustomPreset(pendingPresetName)}
              disabled={getCurrentlySelectedBosses().length === 0}
              className="btn-hero"
            >
              Save Preset
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default BossEditorDialog;