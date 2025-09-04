import { useEffect, useState, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

import { Plus, RefreshCw, User, Clock, Pencil, XIcon, ArrowUp, ArrowDown, Trophy, Calendar, BarChart3, RotateCcw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { listAllBosses, getMaxPartySize } from '@/lib/bossData';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input as UiInput } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getLevelProgress } from '@/lib/levels';
import CharacterCard from '@/components/CharacterCard';
import {
  AlertDialog, AlertDialogTrigger, AlertDialogContent,
  AlertDialogHeader, AlertDialogTitle, AlertDialogDescription,
  AlertDialogFooter, AlertDialogCancel, AlertDialogAction
} from "@/components/ui/alert-dialog";

interface Character {
  id: string;
  name: string;
  class: string;
  exp: number;
  level: number;
  reboot: boolean;
  lastUpdated: string;
  avatarUrl?: string;
  isMain: boolean;
  legionLevel?: number;
  raidPower?: number;
};


const Roster = () => {
  const { toast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const [characters, setCharacters] = useState<Character[]>(() => {
    try {
      const stored = JSON.parse(localStorage.getItem("maplehub_roster") || "[]") as Character[];
      const seen = new Set<string>();
      const withIds = stored.map((c) => {
        let id = c.id;
        if (!id || seen.has(id)) {
          id = (globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`);
        }
        seen.add(id);
        return { ...c, id };
      });
      // Persist back if we added/fixed any ids
      if (withIds.some((c, i) => c.id !== stored[i]?.id)) {
        localStorage.setItem("maplehub_roster", JSON.stringify(withIds));
      }
      return withIds;
    } catch {
      return [];
    }
  });
  const [newCharacterName, setNewCharacterName] = useState('');
  const [bulkNamesInput, setBulkNamesInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isBossDialogOpen, setIsBossDialogOpen] = useState(false);
  const [pendingCharacterName, setPendingCharacterName] = useState<string | null>(null);
  const [pendingBulkNames, setPendingBulkNames] = useState<string[] | null>(null);
  const allBosses = listAllBosses();
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
  const [searchQuery, setSearchQuery] = useState('');
  const [presets, setPresets] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem('maplehub_boss_presets');
      const defaultPresets = ['NLomien Mule', 'HLotus Mule', 'Ctene Mule'];
      if (stored) {
        const parsed = JSON.parse(stored);
        // Merge defaults with stored presets, ensuring no duplicates
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
  const makeGroupKey = (category: 'monthly' | 'weekly' | 'daily', base: string) => `${category}:${base}`;

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
        'Normal Lotus': {
          "enabled": true,
          "partySize": 1,
          "difficulty": "Normal Lotus"
        },
        "Normal Damien": {
          "enabled": true,
          "partySize": 1,
          "difficulty": "Normal Damien"
        },
        "Normal Akechi": {
          "enabled": true,
          "partySize": 1,
          "difficulty": "Normal Akechi"
        },
        "Chaos Papulatus": {
          "enabled": true,
          "partySize": 1,
          "difficulty": "Chaos Papulatus"
        },
        "Chaos Vellum": {
          "enabled": true,
          "partySize": 1,
          "difficulty": "Chaos Vellum"
        },
        "Hard Magnus": {
          "enabled": true,
          "partySize": 1,
          "difficulty": "Hard Magnus"
        },
        "Chaos Crimson Queen": {
          "enabled": true,
          "partySize": 1,
          "difficulty": "Chaos Crimson Queen"
        },
        "Chaos Pierre": {
          "enabled": true,
          "partySize": 1,
          "difficulty": "Chaos Pierre"
        },
        "Normal Princess No": {
          "enabled": true,
          "partySize": 1,
          "difficulty": "Normal Princess No"
        },
        "Chaos Von Bon": {
          "enabled": true,
          "partySize": 1,
          "difficulty": "Chaos Von Bon"
        },
        "Chaos Zakum": {
          "enabled": true,
          "partySize": 1,
          "difficulty": "Chaos Zakum"
        },
        "Easy Cygnus": {
          "enabled": true,
          "partySize": 1,
          "difficulty": "Easy Cygnus"
        },
        "Chaos Pink Bean": {
          "enabled": true,
          "partySize": 1,
          "difficulty": "Chaos Pink Bean"
        },
        "Hard Hilla": {
          "enabled": true,
          "partySize": 1,
          "difficulty": "Hard Hilla"
        }
      },
      'HLotus Mule': {
          "Hard Lotus": {
            "enabled": true,
            "partySize": 1,
            "difficulty": "Hard Lotus"
          },
          "Normal Slime": {
            "enabled": true,
            "partySize": 1,
            "difficulty": "Normal Slime"
          },
          "Easy Lucid": {
            "enabled": true,
            "partySize": 1,
            "difficulty": "Easy Lucid"
          },
          "Normal Damien": {
            "enabled": true,
            "partySize": 1,
            "difficulty": "Normal Damien"
          },
          "Normal Akechi": {
            "enabled": true,
            "partySize": 1,
            "difficulty": "Normal Akechi"
          },
          "Chaos Papulatus": {
            "enabled": true,
            "partySize": 1,
            "difficulty": "Chaos Papulatus"
          },
          "Chaos Vellum": {
            "enabled": true,
            "partySize": 1,
            "difficulty": "Chaos Vellum"
          },
          "Hard Magnus": {
            "enabled": true,
            "partySize": 1,
            "difficulty": "Hard Magnus"
          },
          "Chaos Crimson Queen": {
            "enabled": true,
            "partySize": 1,
            "difficulty": "Chaos Crimson Queen"
          },
          "Chaos Pierre": {
            "enabled": true,
            "partySize": 1,
            "difficulty": "Chaos Pierre"
          },
          "Normal Princess No": {
            "enabled": true,
            "partySize": 1,
            "difficulty": "Normal Princess No"
          },
          "Chaos Von Bon": {
            "enabled": true,
            "partySize": 1,
            "difficulty": "Chaos Von Bon"
          },
          "Chaos Zakum": {
            "enabled": true,
            "partySize": 1,
            "difficulty": "Chaos Zakum"
          },
          "Easy Cygnus": {
            "enabled": true,
            "partySize": 1,
            "difficulty": "Easy Cygnus"
          }
      },
      'Ctene Mule': {
          "Hard Lotus": {
            "enabled": true,
            "partySize": 1,
            "difficulty": "Hard Lotus"
          },
          "Hard Verus Hilla": {
            "enabled": true,
            "partySize": 1,
            "difficulty": "Hard Verus Hilla"
          },
          "Hard Darknell": {
            "enabled": true,
            "partySize": 1,
            "difficulty": "Hard Darknell"
          },
          "Hard Will": {
            "enabled": true,
            "partySize": 1,
            "difficulty": "Hard Will"
          },
          "Chaos Slime": {
            "enabled": true,
            "partySize": 1,
            "difficulty": "Chaos Slime"
          },
          "Chaos Gloom": {
            "enabled": true,
            "partySize": 1,
            "difficulty": "Chaos Gloom"
          },
          "Hard Lucid": {
            "enabled": true,
            "partySize": 1,
            "difficulty": "Hard Lucid"
          },
          "Hard Damien": {
            "enabled": true,
            "partySize": 1,
            "difficulty": "Hard Damien"
          },
          "Normal Akechi": {
            "enabled": true,
            "partySize": 1,
            "difficulty": "Normal Akechi"
          },
          "Chaos Papulatus": {
            "enabled": true,
            "partySize": 1,
            "difficulty": "Chaos Papulatus"
          },
          "Chaos Vellum": {
            "enabled": true,
            "partySize": 1,
            "difficulty": "Chaos Vellum"
          },
          "Hard Magnus": {
            "enabled": true,
            "partySize": 1,
            "difficulty": "Hard Magnus"
          },
          "Chaos Crimson Queen": {
            "enabled": true,
            "partySize": 1,
            "difficulty": "Chaos Crimson Queen"
          },
          "Chaos Zakum": {
            "enabled": true,
            "partySize": 1,
            "difficulty": "Chaos Zakum"
          }
      },
    };
    return presetConfigs[presetName] || {};
  };

  // Save custom preset with current boss configuration
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
        difficulty: bossName // The boss name already includes the difficulty (e.g., "Hard Lotus")
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
        description: `${presetName} preset has been deleted.`,
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

  // Edit a preset (load its configuration)
  const editPreset = (presetName: string) => {
    if (editingPreset === presetName) {
      // Exit edit mode
      setEditingPreset(null);
      toast({
        title: 'Edit Mode Exited',
        description: 'Changes discarded. Preset not modified.',
        className: 'progress-warning'
      });
      return;
    }

    const defaultPresets = ['NLomien Mule', 'HLotus Mule', 'Ctene Mule'];
    let bossConfig: Record<string, any> = {};
    let isCustomPreset = false;

    if (defaultPresets.includes(presetName)) {
      // Load default preset configuration
      bossConfig = getPresetBosses(presetName);
    } else {
      // Load custom preset configuration
      const stored = localStorage.getItem('maplehub_custom_presets');
      if (stored) {
        const customPresets = JSON.parse(stored);
        bossConfig = customPresets[presetName] || {};
        isCustomPreset = true;
      }
    }

    // Apply the preset configuration to current selections
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
    Object.entries(bossConfig).forEach(([bossName, config]) => {
      // Handle both old format (boolean) and new format (object with enabled and partySize)
      const enabled = isCustomPreset ? (config as any).enabled : config;
      const partySize = isCustomPreset ? (config as any).partySize || 1 : 1;

      if (enabled) {
        // Find which category this boss belongs to
        let found = false;

        // Check daily bosses
        groupedDaily.forEach(([base, variants]) => {
          if (variants.some(v => v.name === bossName)) {
            resetBaseEnabled[makeGroupKey('daily', base)] = true;
            resetPartySizes[bossName] = partySize;
            resetSelectedVariants[makeGroupKey('daily', base)] = bossName; // Set the specific variant
            found = true;
          }
        });

        // Check weekly bosses
        if (!found) {
          groupedWeekly.forEach(([base, variants]) => {
            if (variants.some(v => v.name === bossName)) {
              resetBaseEnabled[makeGroupKey('weekly', base)] = true;
              resetPartySizes[bossName] = partySize;
              resetSelectedVariants[makeGroupKey('weekly', base)] = bossName; // Set the specific variant
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
              resetSelectedVariants[makeGroupKey('monthly', base)] = bossName; // Set the specific variant
              found = true;
            }
          });
        }
      }
    });

    // Update state
    setBaseEnabledByBase(resetBaseEnabled);
    setPartySizes(prev => ({ ...prev, ...resetPartySizes }));
    setSelectedVariantByBase(prev => ({ ...prev, ...resetSelectedVariants })); // Update selected variants
    setEditingPreset(presetName);

    toast({
      title: 'Edit Mode Activated',
      description: `Editing ${presetName}. Make changes and save as a new preset.`,
      className: 'progress-complete'
    });
  };

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
      const enabled = isCustomPreset ? (config as any).enabled : config;
      const partySize = isCustomPreset ? (config as any).partySize || 1 : 1;

      if (enabled) {
        // Find which category this boss belongs to
        let found = false;

        // Check daily bosses
        groupedDaily.forEach(([base, variants]) => {
          if (variants.some(v => v.name === bossName)) {
            resetBaseEnabled[makeGroupKey('daily', base)] = true;
            resetPartySizes[bossName] = partySize;
            resetSelectedVariants[makeGroupKey('daily', base)] = bossName; // Set the specific variant
            found = true;
          }
        });

        // Check weekly bosses
        if (!found) {
          groupedWeekly.forEach(([base, variants]) => {
            if (variants.some(v => v.name === bossName)) {
              resetBaseEnabled[makeGroupKey('weekly', base)] = true;
              resetPartySizes[bossName] = partySize;
              resetSelectedVariants[makeGroupKey('weekly', base)] = bossName; // Set the specific variant
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
              resetSelectedVariants[makeGroupKey('monthly', base)] = bossName; // Set the specific variant
              found = true;
            }
          });
        }
      }
    });

    // Update state
    setBaseEnabledByBase(resetBaseEnabled);
    setPartySizes(resetPartySizes); // Replace entire state instead of merging
    setSelectedVariantByBase(prev => ({ ...prev, ...resetSelectedVariants })); // Update selected variants
    setSelectedPreset(presetName);

    toast({
      title: 'Preset Applied',
      description: `${presetName} preset applied successfully!`,
      className: 'progress-complete'
    });
  };

  const parseBoss = (fullName: string): { difficulty: string; base: string } => {
    const parts = fullName.split(' ');
    const difficulty = parts[0];
    const base = parts.slice(1).join(' ');
    return { difficulty, base };
  };

  
  const handleBulkAdd = async () => {
    const names = Array.from(new Set(bulkNamesInput
      .split(/(?:,|\s|&nbsp;|\u00A0)+/)
      .map(n => n.trim())
      .filter(Boolean)));
    if (names.length === 0) {
      toast({ title: 'Error', description: 'Enter one or more character names (comma or space separated)', variant: 'destructive' });
      return;
    }
    setIsLoading(true);
    try {
      const existingLower = new Set(characters.map(c => c.name.toLowerCase()));
      const toAdd = names.filter(n => !existingLower.has(n.toLowerCase()));
      if (toAdd.length === 0) {
        toast({ title: 'No new characters', description: 'All provided names already exist in the roster', variant: 'destructive' });
        return;
      }
      const results = await Promise.allSettled(toAdd.map(n => fetchCharacterData(n)));
      const added: Character[] = [];
      results.forEach((res) => {
        if (res.status === 'fulfilled') {
          const d = res.value;
          added.push({
            id: (crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`),
            ...d,
            lastUpdated: new Date().toISOString(),
          });
        }
      });
      if (added.length === 0) {
        toast({ title: 'Error', description: 'Failed to fetch data for provided names', variant: 'destructive' });
        return;
      }
      setCharacters(prev => enforceSingleMain([...prev, ...added]));
      setBulkNamesInput('');
      // Initialize dialog selections once
      const defaults: Record<string, boolean> = {};
      const parties: Record<string, number> = {};
      const selectedByBase: Record<string, string> = {};
      const enabledByBase: Record<string, boolean> = {};
      listAllBosses().forEach(b => { defaults[b.name] = b.defaultEnabled; parties[b.name] = 1; });
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
      setPendingBulkNames(added.map(a => a.name));
      setPendingCharacterName(added[0].name);
      setIsBossDialogOpen(true);
      toast({ title: 'Characters Added', description: `Added ${added.length} character(s). Choose bosses once to apply to all.`, className: 'progress-complete' });
    } catch (e) {
      toast({ title: 'Error', description: 'Bulk add failed. Please verify names and try again.', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

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
    'Normal Zakum',
    'Normal Magnus',
    'Normal Hilla',
    'Normal Papulatus',
    'Normal Pierre',
    'Normal Von Bon',
    'Normal Crimson Queen',
    'Normal Vellum',
    'Normal Von Leon',
    'Hard Von Leon',
    'Normal Horntail',
    'Chaos Horntail',
    'Easy Arkarium',
    'Normal Arkarium',
    'Normal Pink Bean',
    'Normal Ranmaru',
    'Hard Ranmaru',
    'Normal Gollux'
  ]);
  const isMonthlyBase = (base: string) => base.includes('Black Mage');
  const sortByMesosDesc = (list: Array<[string, Array<{ name: string; difficulty: string; mesos: number; imageUrl: string }>]>) =>
    list.sort((a, z) => {
      const aMax = Math.max(...a[1].map(v => v.mesos));
      const zMax = Math.max(...z[1].map(v => v.mesos));
      return zMax - aMax;
    });
  // Build per-tab groups with variant-level filtering so bases can appear in multiple tabs
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
  const groupedAllForSave = [...groupedDaily, ...groupedWeekly, ...groupedMonthly];
  const [activeTab, setActiveTab] = useState<'monthly' | 'weekly' | 'daily'>('weekly');

  // Filtered data for search
  const filteredGroupedDaily = searchQuery ? groupedDaily.filter(([base]) => base.toLowerCase().includes(searchQuery.toLowerCase())) : groupedDaily;
  const filteredGroupedWeekly = searchQuery ? groupedWeekly.filter(([base]) => base.toLowerCase().includes(searchQuery.toLowerCase())) : groupedWeekly;
  const filteredGroupedMonthly = searchQuery ? groupedMonthly.filter(([base]) => base.toLowerCase().includes(searchQuery.toLowerCase())) : groupedMonthly;

  useEffect(() => {
    try {
      localStorage.setItem('maplehub_roster', JSON.stringify(characters));
    } catch {
      // Ignore storage errors
    }
  }, [characters]);

  // Load stored EXP map to show level percentage like in BossTracker
  const [charExp, setCharExp] = useState<Record<string, number>>(() => {
    try {
      const stored = localStorage.getItem('maplehub_char_exp');
      return stored ? (JSON.parse(stored) as Record<string, number>) : {};
    } catch {
      return {};
    }
  });

  useEffect(() => {
    const norm = (s: string) => s.normalize("NFKC").trim().toLowerCase();
  
    const target = searchParams.get("edit") ?? searchParams.get("editBosses");
    if (!target || characters.length === 0) return;
  
    const match = characters.find(c => norm(c.name) === norm(target));
    if (!match) return;
  
    openBossEditor(match.name); // open the dialog
  
    // clear only the edit params, and don't push a new history entry
    const next = new URLSearchParams(searchParams);
    next.delete("edit");
    next.delete("editBosses");
    setSearchParams(next, { replace: true });
  }, [searchParams, characters]); // <- depend on searchParams, not window/setter

  const getJobName = (jobID: number, jobDetail: number): string => {
    // Prefer specific class names by jobDetail when available
    const jobDetailMap: Record<number, Record<number, string>> = {
      // Thief branches (example provided)
      1: {
        12: 'Hero',
        22: 'Paladin',
        32: 'Dark Knight'
      },
      2: {
        12: 'Fire Poison (F/P)',
        22: 'Arch Mage (I/L)',
        32: 'Bishop'
      },
      3: {
        12: 'Bowmaster',
        22: 'Marksman',
        32: 'Pathfinder'
      },
      4: {
        12: 'Night Lord',
        22: 'Shadower',
        34: 'Dual Blade'
      },
      5: {
        12: 'Buccaneer',
        22: 'Corsair',
        32: 'Cannoneer'
      }
      // Add more detailed mappings here in the future as needed per jobID → jobDetail
    };

    const detailed = jobDetailMap[jobID]?.[jobDetail];
    if (detailed) return detailed;

    // Fallback to broad job family when detailed mapping is not known
    const jobMap: { [key: number]: string } = {
      1: 'Warrior',
      2: 'Magician', 
      3: 'Bowman',
      4: 'Thief',
      5: 'Pirate',
      11: 'Dawn Warrior',
      12: 'Blaze Wizard',
      13: 'Wind Archer',
      14: 'Night Walker',
      15: 'Thunder Breaker',
      21: 'Aran',
      22: 'Evan',
      23: 'Mercedes',
      24: 'Phantom',
      28: 'Kinesis',
      31: 'Demon Slayer',
      32: 'Battle Mage',
      33: 'Wild Hunter',
      35: 'Mechanic',
      202: 'Mihile',
      203: 'Luminous',
      204: 'Kaiser',
      205: 'Angelic Buster',
      206: 'Hayato',
      207: 'Kanna',
      208: 'Xenon',
      209: 'Demon Avenger',
      210: 'Zero',
      212: 'Shade',
      214: 'Kinesis',
      215: 'Blaster',
      216: 'Cadena',
      217: 'Illium',
      218: 'Ark',
      220: 'Hoyoung',
      221: 'Adele',
      222: 'Kain',
      223: 'Lara',
      224: 'Khali',
      225: 'Lynn',
      226: 'Mo Xuan',
      227: 'Sia Astelle'
    };
    return jobMap[jobID] || 'Unknown';
  };

  const didRunRef = useRef(false);

  useEffect(() => {
    if (didRunRef.current) return;        // guard StrictMode double-run
    didRunRef.current = true;

    if (!characters.length || isLoading) return;

    const MIN_INTERVAL_MS = 15 * 60 * 1000; // at most every 15 min
    const STALE_MS = 6 * 60 * 60 * 1000;    // refresh if older than 6h

    const lastAuto = Number(localStorage.getItem("lastAutoRefreshAt") || 0);
    if (Date.now() - lastAuto < MIN_INTERVAL_MS) return;

    const isStale = characters.some(c => {
      const t = c.lastUpdated ? Date.parse(c.lastUpdated) : 0;
      return !t || Date.now() - t > STALE_MS;
    });

    if (isStale) {
      handleRefreshAll().finally(() => {
        localStorage.setItem("lastAutoRefreshAt", String(Date.now()));
      });
    }
  }, [characters, isLoading]);

  const openBossEditor = (characterName: string) => {
    try {
      setPendingCharacterName(characterName);
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
      setIsBossDialogOpen(true);
    } catch {
      // Fall back to defaults if anything goes wrong
      const defaults: Record<string, boolean> = {};
      const parties: Record<string, number> = {};
      const selectedByBase: Record<string, string> = {};
      const enabledByBase: Record<string, boolean> = {};
      listAllBosses().forEach(b => { defaults[b.name] = b.defaultEnabled; parties[b.name] = 1; });
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
      setIsBossDialogOpen(true);
    }
  };

  const fetchCharacterData = async (characterName: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('nexon-character-lookup', {
        body: { characterName }
      });

      if (error) {
        throw new Error(error.message || 'Failed to fetch character data');
      }

      return {
        name: data.name,
        class: getJobName(data.jobID, data.jobDetail),
        level: data.level,
        reboot: true, // Using reboot_index=1 in API call
        avatarUrl: data.characterImgURL as string | undefined,
        exp: data.exp,
        isMain: data.isMain,
        legionLevel: data.legionLevel,
        raidPower: data.raidPower
      };
    } catch (error) {
      throw new Error('Failed to fetch character data from Nexon API');
    }
  };

  const handleAddCharacter = async () => {
    if (!newCharacterName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a character name",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      const existing = characters.some(c => c.name.toLowerCase() === newCharacterName.trim().toLowerCase());
      if (existing) {
        toast({ title: "Duplicate", description: "Character already in roster", variant: "destructive" });
        return;
      }

      const characterData = await fetchCharacterData(newCharacterName.trim());
      const newCharacter: Character = {
        id: Date.now().toString(),
        ...characterData,
        lastUpdated: new Date().toLocaleString()
      };
      
      setCharacters(prev => enforceSingleMain([...prev, newCharacter]));
      setNewCharacterName('');
      // Open boss selection dialog for this character
      setPendingCharacterName(characterData.name);
      const defaults: Record<string, boolean> = {};
      const parties: Record<string, number> = {};
      const selectedByBase: Record<string, string> = {};
      const enabledByBase: Record<string, boolean> = {};
      listAllBosses().forEach(b => { defaults[b.name] = b.defaultEnabled; parties[b.name] = 1; });
      // initialize per-category group keys
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
      setIsBossDialogOpen(true);
      
      toast({
        title: "Character Added",
        description: `${characterData.name} has been added to your roster!`,
        className: "progress-complete"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch character data. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const [mainLegion, setMainLegion] = useState<number | null>(null);
  const [mainRaidPower, setMainRaidPower] = useState<number | null>(null);
  const [mainCharacter, setMainCharacter] = useState<Character | null>(null);

  // Function to enforce single main character
  const enforceSingleMain = (chars: Character[]): Character[] => {
    const mains = chars.filter(c => c.isMain);
    if (mains.length <= 1) return chars;

    // If multiple mains, keep only the one with highest level
    const sortedMains = mains.sort((a, b) => b.level - a.level);
    const mainToKeep = sortedMains[0];

    return chars.map(c =>
      c.id === mainToKeep.id ? c : { ...c, isMain: false }
    );
  };

  // Function to set a character as main
  const setCharacterAsMain = (characterId: string) => {
    setCharacters(prev => {
      const updated = prev.map(c =>
        c.id === characterId
          ? { ...c, isMain: true }
          : { ...c, isMain: false }
      );
      return enforceSingleMain(updated);
    });
  };

  useEffect(() => {
    const main = characters.find(c => !!c.isMain) ?? null;
    setMainCharacter(main);
    setMainLegion(main?.legionLevel ?? null);
    setMainRaidPower(main?.raidPower ?? null);
  }, [characters]);
  
  const handleRefreshAll = async () => {
    setIsLoading(true);
    toast({
      title: "Refreshing Data",
      description: "Updating all character information...",
      className: "progress-partial",
    });
  
    try {
      const BATCH = 5; // adjust as needed
      const now = new Date().toISOString();
      const updated: Character[] = [];
      let failed = 0;
  
      for (let i = 0; i < characters.length; i += BATCH) {
        const batch = characters.slice(i, i + BATCH);
  
        const results = await Promise.allSettled(
          batch.map(async (char) => {
            const data = await fetchCharacterData(char.name);
            const isMain = data.isMain ?? char.isMain;
  
            return {
              ...char,
              name: data.name ?? char.name,
              class: data.class ?? char.class,
              level: data.level ?? char.level,
              reboot: char.reboot,
              avatarUrl: data.avatarUrl ?? char.avatarUrl,
              exp: data.exp ?? char.exp,
              lastUpdated: now,
  
              // fresh main/legion fields
              isMain,
              legionLevel:
                isMain === false ? null : (data.legionLevel ?? char.legionLevel ?? null),
              raidPower:
                isMain === false ? null : (data.raidPower ?? char.raidPower ?? null),
            } as Character;
          })
        );
  
        results.forEach((res, idx) => {
          if (res.status === "fulfilled") {
            updated.push(res.value);
          } else {
            failed++;
            updated.push({ ...batch[idx], lastUpdated: now });
          }
        });
      }
  
      const enforced = enforceSingleMain(updated);
      setCharacters(enforced);

      const main = enforced.find((c) => c.isMain) ?? null;
      setMainCharacter(main);
      setMainLegion(main?.legionLevel ?? null);
      setMainRaidPower(main?.raidPower ?? null);
  
      toast({
        title: "Data Updated",
        description: failed
          ? `Updated ${updated.length - failed} character(s); ${failed} failed.`
          : "All character data has been refreshed!",
        className: failed ? "progress-warning" : "progress-complete",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const moveCharacter = (index: number, direction: -1 | 1) => {
    setCharacters(prev => {
      const next = [...prev];
      const newIndex = index + direction;
      if (newIndex < 0 || newIndex >= next.length) return prev;
      const [item] = next.splice(index, 1);
      next.splice(newIndex, 0, item);
      return next;
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Character Roster
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage your Maplestory characters with live data from Nexon API
          </p>
        </div>
        <Button
          onClick={handleRefreshAll}
          disabled={isLoading}
          className="btn-accent w-full sm:w-auto"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh All
        </Button>
      </div>

      <Card className="card-glow">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Plus className="h-5 w-5 text-primary" />
            <span>Add Character</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-2">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!isLoading) handleBulkAdd();
            }}
            className="w-full flex gap-2"
          >
            <Input
              placeholder="Enter character name(s)"
              value={bulkNamesInput}
              onChange={(e) => setBulkNamesInput(e.target.value)}
              className="flex-1"
            />
            <Button
              type="submit"                // <-- important
              disabled={isLoading}
              className="btn-hero w-full sm:w-auto"
            >
              {isLoading ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <Plus className="h-4 w-4" />
              )}
            </Button>
          </form>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
              Advanced: To add multiple characters at once, you can enter their names separated by commas or spaces.
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Example: "Hikma, Mirae, Sancta, Ghost"
          </p>
        </CardContent>
      </Card>
      
      <Dialog open={isBossDialogOpen} onOpenChange={(open) => {
        setIsBossDialogOpen(open);
        if (!open) {
          // Exit edit mode and clear selected preset when dialog is closed
          setEditingPreset(null);
          setSelectedPreset(null);
        }
      }}>
        <DialogContent className="max-w-4xl w-[95vw] max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle>
              {pendingBulkNames && pendingBulkNames.length > 1
                ? `Choose bosses for ${pendingBulkNames.length} characters`
                : `Choose bosses for ${pendingCharacterName}`}
            </DialogTitle>
          </DialogHeader>
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Compact Sidebar - Navigation Style */}
            <div className="lg:w-48 lg:flex-shrink-0">
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
                        <div key={preset} className="flex items-center gap-1">
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
                            const mesosShare = currentVariant ? Math.floor(currentVariant.mesos / Math.max(1, partySize)) : 0;

                            return (
                              <div
                                key={base}
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
          <DialogFooter className="px-6 py-4 sm:px-6 sm:py-4">
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
                      // Calculate weekly bosses earnings
                      groupedWeekly.forEach(([base, variants]) => {
                        const gkey = makeGroupKey('weekly', base);
                        const enabled = !!baseEnabledByBase[gkey];
                        if (enabled) {
                          const selectedVariant = selectedVariantByBase[gkey] || variants[0]?.name;
                          const variant = variants.find(v => v.name === selectedVariant);
                          if (variant) {
                            const partySize = partySizes[variant.name] || 1;
                            totalWeeklyMesos += Math.floor(variant.mesos / Math.max(1, partySize));
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
                            totalWeeklyMesos += Math.floor(variant.mesos / Math.max(1, partySize)) * 7;
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
                  onClick={() => {
                    if (!pendingCharacterName) { setIsBossDialogOpen(false); return; }
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
                        parsed[pendingCharacterName] = out;
                      }
                      localStorage.setItem(key, JSON.stringify(parsed));
                      const pkey = 'maplehub_boss_party';
                      const pstored = localStorage.getItem(pkey);
                      const pparsed = pstored ? (JSON.parse(pstored) as Record<string, Record<string, number>>) : {};
                      if (pendingBulkNames && pendingBulkNames.length > 0) {
                        pendingBulkNames.forEach(n => { pparsed[n] = { ...partySizes }; });
                      } else {
                        pparsed[pendingCharacterName] = { ...partySizes };
                      }
                      localStorage.setItem(pkey, JSON.stringify(pparsed));
                    } catch {}
                    setIsBossDialogOpen(false);
                    setPendingCharacterName(null);
                    setPendingBulkNames(null);
                    toast({ title: 'Bosses Saved', description: 'Your boss selections were saved for this character.', className: 'progress-complete' });
                  }}
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
                        <div key={bossName} className="flex items-center justify-between gap-2 text-sm">
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

      <Card className="card-gaming">
        <CardHeader>
          {mainCharacter && ( 
            <div className='absolute right-10 '>
              <Button
                    variant="ghost"
                    size="sm"
                    title="Edit bosses"
                    onClick={() => openBossEditor(mainCharacter.name)}
                    className=""
                  >
                    <Pencil className="" />
                    Edit
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-red-500"
                    aria-label="Delete character"
                    title="Delete character"
                  >
                    <XIcon className="h-4 w-4" aria-hidden="true" />
                  </Button>
                </AlertDialogTrigger>

                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete {mainCharacter.name}?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will remove the character from your roster. This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      className="bg-red-600 hover:bg-red-700"
                      onClick={() =>
                        setCharacters(prev => prev.filter(c => c.id !== mainCharacter.id))
                      }
                    >
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div> 
            )
          } 
          <CardTitle className="flex items-center space-x-2">
            <Trophy className="h-5 w-5 text-amber-400" aria-hidden="true" />
            <span>Main Character</span>
          </CardTitle>
        </CardHeader>

        {mainCharacter ? (
          <CardContent className="flex items-center space-x-4">
            {/* Avatar */}
            <img
              src={mainCharacter.avatarUrl}
              alt={mainCharacter.name}
              className="w-22 h-22 rounded-md"
            />

            <div className="flex flex-col">
              {/* Name + Level/Class */}
              <span className="font-semibold text-lg text-white">
                {mainCharacter.name}
              </span>
              <span className="text-sm text-gray-400">
                Lv. {mainCharacter.level} ({getLevelProgress(mainCharacter.level, mainCharacter.exp)}%) — {mainCharacter.class}
              </span>

              {/* Legion / RaidPower badges */}
              <div className="mt-2 flex space-x-2">
                <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-md">
                  Legion: {mainLegion?.toLocaleString() ?? "N/A"}
                </span>
                <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-md">
                  Raid Power: {mainRaidPower?.toLocaleString() ?? "N/A"}
                </span>
              </div>
            </div>
          </CardContent>
        ) : (
          <CardContent className="text-sm text-gray-400">
            No main character detected.
            <p className='text-xs'>We auto-detect the main character as the highest-level on the account.</p>
          </CardContent>
        )}
      </Card>
      <Card className="card-gaming">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <User className="h-5 w-5 text-primary" />
            <span>Mule Characters ({characters.length - (mainCharacter ? 1 : 0)})</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Character Cards - Responsive Grid Layout */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {characters.map((character, idx) => (
              <>
              {!character.isMain && 
                <CharacterCard
                  key={character.id}
                  character={character}
                  variant="roster"
                  index={idx}
                  onMoveUp={() => moveCharacter(idx, -1)}
                  onMoveDown={() => moveCharacter(idx, 1)}
                  onEditBosses={() => openBossEditor(character.name)}
                  onRemove={() => setCharacters(prev => prev.filter(c => c.id !== character.id))}
                  onSetAsMain={setCharacterAsMain}
                />
              }
              </>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="card-gaming border-primary/20">
        <CardContent className="pt-6">
          <div className="text-center space-y-2">
            <h3 className="text-lg font-semibold text-primary">Live Data Integration</h3>
            <p className="text-muted-foreground">
              Character data is now fetched live from Nexon's Maplestory Ranking API. 
              Add characters to see their current level and class information.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Roster;
