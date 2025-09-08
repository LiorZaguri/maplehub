import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Character } from '../types/roster';
import { useBossPresets } from '../hooks/useBossPresets';
import BossEditorMobileLayout from './BossEditorMobileLayout';
import BossEditorDesktopLayout from './BossEditorDesktopLayout';
import { 
  getFilteredCategorizedBosses, 
  makeGroupKey, 
  type BossCategory 
} from '../utils/bossGroupingUtils';
import { listAllBosses } from '@/lib/bossData';
import { 
  loadBossEnabledForCharacter,
  loadBossPartySizesForCharacter,
  loadBossVariantsForCharacter,
  loadBossBaseEnabledForCharacter
} from '../services/rosterService';

export interface BossEditorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  characterName: string | null;
  pendingBulkNames: string[] | null;
  characters: Character[];
}

const BossEditorDialog: React.FC<BossEditorDialogProps> = ({ 
  open, 
  onOpenChange, 
  characterName, 
  pendingBulkNames,
  characters 
}) => {
  const { toast } = useToast();
  const allBosses = listAllBosses();
  
  // State management
  const [activeTab, setActiveTab] = useState<BossCategory>('weekly');
  const [searchQuery, setSearchQuery] = useState('');
  const [partySizes, setPartySizes] = useState<Record<string, number>>(() => {
    const initial: Record<string, number> = {};
    allBosses.forEach(b => { initial[b.name] = 1; });
    return initial;
  });
  const [selectedVariantByBase, setSelectedVariantByBase] = useState<Record<string, string>>({});
  const [baseEnabledByBase, setBaseEnabledByBase] = useState<Record<string, boolean>>({});
  
  // Get filtered and categorized bosses using utility functions
  const { 
    groupedDaily, 
    groupedWeekly, 
    groupedMonthly,
    filteredGroupedDaily, 
    filteredGroupedWeekly, 
    filteredGroupedMonthly 
  } = getFilteredCategorizedBosses(searchQuery);

  // Boss presets hook
  const {
    presets,
    newPresetName,
    showAddPreset,
    showSavePresetDialog,
    pendingPresetName,
    editingPreset,
    selectedPreset,
    setNewPresetName,
    setShowAddPreset,
    setShowSavePresetDialog,
    setPendingPresetName,
    setEditingPreset,
    setSelectedPreset,
    applyPreset,
    editPreset,
    saveCustomPreset,
    updateExistingPreset,
    deletePreset,
    clearEditingState,
  } = useBossPresets({
    groupedDaily,
    groupedWeekly,
    groupedMonthly,
    makeGroupKey,
    onPresetApplied: (config) => {
      setBaseEnabledByBase(config.baseEnabledByBase);
      setPartySizes(config.partySizes);
      setSelectedVariantByBase(config.selectedVariantByBase);
    },
  });

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

  // Get boss counts by category
  const getBossCountsByCategory = () => {
    const counts = { daily: 0, weekly: 0, monthly: 0 };
    
    ([['daily', groupedDaily], ['weekly', groupedWeekly], ['monthly', groupedMonthly]] as const).forEach(([cat, data]) => {
      data.forEach(([base, variants]) => {
        const gkey = makeGroupKey(cat, base);
        const enabled = !!baseEnabledByBase[gkey];
        if (enabled) {
          counts[cat]++;
        }
      });
    });
    
    return counts;
  };

  // Initialize default selections when dialog opens
  useEffect(() => {
    if (open && (characterName || pendingBulkNames)) {
      if (characterName && !pendingBulkNames) {
        // Single character - load existing config or defaults
        const enabledForChar = loadBossEnabledForCharacter(characterName);
        const characterParties = loadBossPartySizesForCharacter(characterName);
        const characterVariants = loadBossVariantsForCharacter(characterName);
        const characterBaseEnabled = loadBossBaseEnabledForCharacter(characterName);
        
        const defaults: Record<string, boolean> = {};
        const parties: Record<string, number> = {};
        const selectedByBase: Record<string, string> = {};
        const enabledByBase: Record<string, boolean> = {};
        
        listAllBosses().forEach(b => {
          defaults[b.name] = b.defaultEnabled;
          parties[b.name] = characterParties[b.name] || 1; // Use character's party size or default to 1
        });
        
        ([['daily', groupedDaily], ['weekly', groupedWeekly], ['monthly', groupedMonthly]] as const).forEach(([cat, data]) => {
          data.forEach(([base, variants]) => {
            const key = makeGroupKey(cat, base);
            
            // Use character's existing variant selection or find preferred/default
            const existingVariant = characterVariants[key];
            if (existingVariant && variants.some(v => v.name === existingVariant)) {
              selectedByBase[key] = existingVariant;
            } else {
              const preferred = variants.find(v => defaults[v.name]);
              const pick = preferred?.name || variants[0]?.name;
              if (pick) selectedByBase[key] = pick;
            }
            
            // Use character's existing enabled state or default
            const selectedVariant = selectedByBase[key];
            if (selectedVariant) {
              enabledByBase[key] = characterBaseEnabled[key] ?? enabledForChar[selectedVariant] ?? defaults[selectedVariant] ?? false;
            }
          });
        });
        
        setPartySizes(parties);
        setSelectedVariantByBase(selectedByBase);
        setBaseEnabledByBase(enabledByBase);
      } else if (pendingBulkNames) {
        // Bulk characters - find common enabled bosses
        const firstCharName = pendingBulkNames?.[0];
        const enabledForChar = firstCharName ? loadBossEnabledForCharacter(firstCharName) : {};
        const firstCharParties = firstCharName ? loadBossPartySizesForCharacter(firstCharName) : {};
        const firstCharVariants = firstCharName ? loadBossVariantsForCharacter(firstCharName) : {};
        const firstCharBaseEnabled = firstCharName ? loadBossBaseEnabledForCharacter(firstCharName) : {};

        const defaults: Record<string, boolean> = {};
        const parties: Record<string, number> = {};
        const nextSelectedByBase: Record<string, string> = {};
        const nextBaseEnabledByBase: Record<string, boolean> = {};

        listAllBosses().forEach(b => {
          defaults[b.name] = b.defaultEnabled;
          parties[b.name] = firstCharParties[b.name] || 1; // Use first character's party size or default to 1
        });

        (['daily', 'weekly', 'monthly'] as const).forEach((cat) => {
          const data = cat === 'daily' ? groupedDaily : cat === 'weekly' ? groupedWeekly : groupedMonthly;
          data.forEach(([base, variants]) => {
            const gkey = makeGroupKey(cat, base);
            
            // Use first character's existing variant selection or find preferred/default
            const existingVariant = firstCharVariants[gkey];
            if (existingVariant && variants.some(v => v.name === existingVariant)) {
              nextSelectedByBase[gkey] = existingVariant;
            } else {
              const preferred = variants.find(v => defaults[v.name]);
              const pick = preferred?.name || variants[0]?.name || '';
              if (pick) nextSelectedByBase[gkey] = pick;
            }
            
            // Use first character's existing enabled state or default
            const selectedVariant = nextSelectedByBase[gkey];
            if (selectedVariant) {
              nextBaseEnabledByBase[gkey] = firstCharBaseEnabled[gkey] ?? enabledForChar[selectedVariant] ?? defaults[selectedVariant] ?? false;
            }
          });
        });

        setPartySizes(parties);
        setSelectedVariantByBase(nextSelectedByBase);
        setBaseEnabledByBase(nextBaseEnabledByBase);
      } else {
        // Default initialization
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
            enabledByBase[key] = defaults[pick] || false;
          });
        });
        
        setPartySizes(parties);
        setSelectedVariantByBase(selectedByBase);
        setBaseEnabledByBase(enabledByBase);
      }
    }
  }, [open, characterName, pendingBulkNames]);

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
      parsed[characterName] = out;
      localStorage.setItem(key, JSON.stringify(parsed));

      // Save party sizes
      const partySizeKey = 'maplehub_boss_party_sizes';
      const storedPartySizes = localStorage.getItem(partySizeKey);
      const parsedPartySizes = storedPartySizes ? (JSON.parse(storedPartySizes) as Record<string, Record<string, number>>) : {};
      parsedPartySizes[characterName] = partySizes;
      localStorage.setItem(partySizeKey, JSON.stringify(parsedPartySizes));

      // Save selected variants
      const variantKey = 'maplehub_boss_variants';
      const storedVariants = localStorage.getItem(variantKey);
      const parsedVariants = storedVariants ? (JSON.parse(storedVariants) as Record<string, Record<string, string>>) : {};
      parsedVariants[characterName] = selectedVariantByBase;
      localStorage.setItem(variantKey, JSON.stringify(parsedVariants));

      toast({
        title: "Boss configuration saved",
        description: `Settings saved for ${characterName}`,
      });
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to save boss configuration:', error);
      toast({
        title: "Error saving configuration",
        description: "Please try again",
        variant: "destructive"
      });
    }
  };

  const handleBulkSave = () => {
    if (!pendingBulkNames?.length) return;

    try {
      const key = 'maplehub_boss_enabled';
      const stored = localStorage.getItem(key);
      const parsed = stored ? (JSON.parse(stored) as Record<string, Record<string, boolean>>) : {};

      pendingBulkNames.forEach(charName => {
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
        parsed[charName] = out;
      });
      
      localStorage.setItem(key, JSON.stringify(parsed));

      // Save party sizes and variants for all characters
      const partySizeKey = 'maplehub_boss_party_sizes';
      const variantKey = 'maplehub_boss_variants';
      const storedPartySizes = localStorage.getItem(partySizeKey);
      const storedVariants = localStorage.getItem(variantKey);
      const parsedPartySizes = storedPartySizes ? JSON.parse(storedPartySizes) : {};
      const parsedVariants = storedVariants ? JSON.parse(storedVariants) : {};

      pendingBulkNames.forEach(charName => {
        parsedPartySizes[charName] = partySizes;
        parsedVariants[charName] = selectedVariantByBase;
      });

      localStorage.setItem(partySizeKey, JSON.stringify(parsedPartySizes));
      localStorage.setItem(variantKey, JSON.stringify(parsedVariants));

      toast({
        title: "Boss configuration saved",
        description: `Settings applied to ${pendingBulkNames.length} characters`,
      });
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to save bulk boss configuration:', error);
      toast({
        title: "Error saving configuration",
        description: "Please try again",
        variant: "destructive"
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={(open) => {
      onOpenChange(open);
      if (!open) {
        clearEditingState();
      }
    }}>
      <DialogContent className="max-w-6xl h-[90vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle>
            {pendingBulkNames 
              ? `Configure bosses for ${pendingBulkNames.length} characters`
              : `Choose bosses for ${characterName || 'character'}`}
          </DialogTitle>
          <DialogDescription className="hidden sm:block">
            Select bosses and configure party sizes for this character. Monthly bosses have no restrictions, while weekly bosses are limited to 14 total.
          </DialogDescription>
          <DialogDescription className="sm:hidden text-sm">
            Choose bosses and party sizes. Weekly limit: 14
          </DialogDescription>
          <div className="text-sm text-muted-foreground">
            <span>{getBossCountsByCategory().weekly}/14 • {getCurrentlySelectedBosses().length} total selected</span>
          </div>
        </DialogHeader>
        
        <div className="flex flex-col gap-4 h-full">
          <BossEditorMobileLayout
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            filteredGroupedDaily={filteredGroupedDaily}
            filteredGroupedWeekly={filteredGroupedWeekly}
            filteredGroupedMonthly={filteredGroupedMonthly}
            baseEnabledByBase={baseEnabledByBase}
            selectedVariantByBase={selectedVariantByBase}
            partySizes={partySizes}
            characters={characters}
            characterName={characterName}
            makeGroupKey={makeGroupKey}
            setBaseEnabledByBase={setBaseEnabledByBase}
            setSelectedVariantByBase={setSelectedVariantByBase}
            setPartySizes={setPartySizes}
            toast={toast}
            presets={presets}
            selectedPreset={selectedPreset}
            showAddPreset={showAddPreset}
            newPresetName={newPresetName}
            editingPreset={editingPreset}
            setSelectedPreset={setSelectedPreset}
            setShowAddPreset={setShowAddPreset}
            setNewPresetName={setNewPresetName}
            applyPreset={applyPreset}
            editPreset={editPreset}
            deletePreset={deletePreset}
            saveCustomPreset={(name, config, partySizes) => saveCustomPreset(name, getCurrentlySelectedBosses(), partySizes)}
            updateExistingPreset={(name, config, partySizes) => updateExistingPreset(name, getCurrentlySelectedBosses(), partySizes)}
            getCurrentlySelectedBosses={getCurrentlySelectedBosses}
          />

          <BossEditorDesktopLayout
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            filteredGroupedDaily={filteredGroupedDaily}
            filteredGroupedWeekly={filteredGroupedWeekly}
            filteredGroupedMonthly={filteredGroupedMonthly}
            baseEnabledByBase={baseEnabledByBase}
            selectedVariantByBase={selectedVariantByBase}
            partySizes={partySizes}
            characters={characters}
            characterName={characterName}
            makeGroupKey={makeGroupKey}
            setBaseEnabledByBase={setBaseEnabledByBase}
            setSelectedVariantByBase={setSelectedVariantByBase}
            setPartySizes={setPartySizes}
            toast={toast}
            presets={presets}
            selectedPreset={selectedPreset}
            showAddPreset={showAddPreset}
            showSavePresetDialog={showSavePresetDialog}
            pendingPresetName={pendingPresetName}
            newPresetName={newPresetName}
            editingPreset={editingPreset}
            setSelectedPreset={setSelectedPreset}
            setShowAddPreset={setShowAddPreset}
            setShowSavePresetDialog={setShowSavePresetDialog}
            setPendingPresetName={setPendingPresetName}
            setNewPresetName={setNewPresetName}
            applyPreset={applyPreset}
            editPreset={editPreset}
            deletePreset={deletePreset}
            saveCustomPreset={(name, config, partySizes) => saveCustomPreset(name, getCurrentlySelectedBosses(), partySizes)}
            updateExistingPreset={(name, config, partySizes) => updateExistingPreset(name, getCurrentlySelectedBosses(), partySizes)}
            getCurrentlySelectedBosses={getCurrentlySelectedBosses}
          />
        </div>

        <DialogFooter className="flex-shrink-0">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={pendingBulkNames ? handleBulkSave : handleSave}>
            Save Configuration
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default BossEditorDialog;
