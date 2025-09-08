import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Character, CharacterRegion } from '../types/roster';
import {
  loadCharacters,
  saveCharacters,
  loadCharacterOrder,
  saveCharacterOrder,
  loadBossEnabled,
  saveBossEnabled,
  loadBossPartySizes,
  saveBossPartySizes,
  loadBossVariants,
  saveBossVariants,
  loadBossBaseEnabled,
  saveBossBaseEnabled,
  loadBossPresets,
  saveBossPresets,
  getOrderedCharacters
} from '../services/rosterService';
import { listAllBosses, getMaxPartySize } from '@/lib/bossData';

export const useRoster = () => {
  const { toast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();

  // Core character state
  const [characters, setCharacters] = useState<Character[]>(() => {
    const loadedCharacters = loadCharacters();
    return getOrderedCharacters(loadedCharacters);
  });

  // UI state
  const [newCharacterName, setNewCharacterName] = useState('');
  const [bulkNamesInput, setBulkNamesInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [characterRegion, setCharacterRegion] = useState<CharacterRegion>('na');
  
  // Boss dialog state
  const [isBossDialogOpen, setIsBossDialogOpen] = useState(false);
  const [pendingCharacterName, setPendingCharacterName] = useState<string | null>(null);
  const [pendingBulkNames, setPendingBulkNames] = useState<string[] | null>(null);
  
  // Boss configuration state
  const [selectedBossEnabled, setSelectedBossEnabled] = useState<Record<string, boolean>>(() => loadBossEnabled());
  const [partySizes, setPartySizes] = useState<Record<string, number>>(() => loadBossPartySizes());
  const [selectedVariantByBase, setSelectedVariantByBase] = useState<Record<string, string>>(() => loadBossVariants());
  const [baseEnabledByBase, setBaseEnabledByBase] = useState<Record<string, boolean>>(() => loadBossBaseEnabled());
  
  // Preset state
  const [presets, setPresets] = useState<string[]>(() => loadBossPresets());
  const [newPresetName, setNewPresetName] = useState('');
  const [showAddPreset, setShowAddPreset] = useState(false);
  const [showSavePresetDialog, setShowSavePresetDialog] = useState(false);
  const [pendingPresetName, setPendingPresetName] = useState('');
  const [editingPreset, setEditingPreset] = useState<string | null>(null);
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);
  
  // Search and filtering
  const [searchQuery, setSearchQuery] = useState('');
  
  // Experience graph state
  const [selectedExpCharacter, setSelectedExpCharacter] = useState<Character | null>(null);
  const [expChartTimePeriod, setExpChartTimePeriod] = useState<'7D' | '14D' | '30D'>('7D');

  // Listen for roster changes from localStorage
  useEffect(() => {
    const handleStorageChange = () => {
      const loadedCharacters = loadCharacters();
      const orderedCharacters = getOrderedCharacters(loadedCharacters);
      setCharacters(orderedCharacters);
    };

    // Initial load
    handleStorageChange();

    // Listen for storage changes
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('rosterUpdate', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('rosterUpdate', handleStorageChange);
    };
  }, []);

  // Handle URL parameters for opening boss editor
  useEffect(() => {
    const norm = (s: string) => s.normalize("NFKC").trim().toLowerCase();
  
    const target = searchParams.get("edit") ?? searchParams.get("editBosses");
    if (!target || characters.length === 0) return;
  
    const match = characters.find(c => norm(c.name) === norm(target));
    if (!match) return;
  
    // Open the boss editor dialog
    setPendingCharacterName(match.name);
    setIsBossDialogOpen(true);
  
    // Clear the edit params without pushing a new history entry
    const next = new URLSearchParams(searchParams);
    next.delete("edit");
    next.delete("editBosses");
    setSearchParams(next, { replace: true });
  }, [searchParams, characters, setSearchParams]);

  // Save state changes to localStorage
  useEffect(() => {
    saveBossEnabled(selectedBossEnabled);
  }, [selectedBossEnabled]);

  useEffect(() => {
    saveBossPartySizes(partySizes);
  }, [partySizes]);

  useEffect(() => {
    saveBossVariants(selectedVariantByBase);
  }, [selectedVariantByBase]);

  useEffect(() => {
    saveBossBaseEnabled(baseEnabledByBase);
  }, [baseEnabledByBase]);

  useEffect(() => {
    saveBossPresets(presets);
  }, [presets]);

  // Character management functions
  const addCharacter = async (name: string, region: CharacterRegion = 'na') => {
    try {
      setIsLoading(true);
      
      // Fetch character data from Nexon API via Supabase
      const { data, error } = await supabase.functions.invoke('nexon-character-lookup', {
        body: { characterName: name, region }
      });

      if (error) {
        throw new Error(error.message || 'Failed to fetch character data');
      }

      if (!data || !data.name) {
        throw new Error('Character not found');
      }

      const character = data;
      const newCharacter: Character = {
        id: globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        name: character.name,
        class: character.additionalData?.class || 'Unknown',
        level: character.level,
        exp: character.exp || 0,
        reboot: character.worldName?.includes('Reboot') || false,
        lastUpdated: new Date().toISOString(),
        avatarUrl: character.characterImgURL || '/placeholder.svg',
        isMain: character.isMain || false,
        legionLevel: character.legionLevel,
        raidPower: character.raidPower,
        region: character.region,
        worldName: character.worldName,
        additionalData: character.additionalData,
      };

      // Check for duplicates
      const exists = characters.some(c => 
        c.name.toLowerCase() === newCharacter.name.toLowerCase()
      );
      
      if (exists) {
        throw new Error(`Character "${newCharacter.name}" already exists in your roster`);
      }

      const updatedCharacters = [...characters, newCharacter];
      setCharacters(updatedCharacters);
      saveCharacters(updatedCharacters);

      toast({
        title: "Character Added",
        description: `${newCharacter.name} (Lv. ${newCharacter.level} ${newCharacter.class}) has been added to your roster`,
        className: "progress-complete",
        duration: 4000
      });

      return newCharacter;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error occurred';
      toast({
        title: "Error Adding Character",
        description: message,
        variant: "destructive",
        duration: 5000
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const removeCharacter = (characterId: string) => {
    const updatedCharacters = characters.filter(c => c.id !== characterId);
    setCharacters(updatedCharacters);
    saveCharacters(updatedCharacters);
    
    const character = characters.find(c => c.id === characterId);
    if (character) {
      toast({
        title: "Character Removed",
        description: `${character.name} has been removed from your roster`,
        className: "progress-complete",
        duration: 4000
      });
    }
  };

  const moveCharacter = (fromIndex: number, direction: number) => {
    const newIndex = fromIndex + direction;
    if (newIndex < 0 || newIndex >= characters.length) return;

    const updatedCharacters = [...characters];
    [updatedCharacters[fromIndex], updatedCharacters[newIndex]] = 
    [updatedCharacters[newIndex], updatedCharacters[fromIndex]];
    
    setCharacters(updatedCharacters);
    saveCharacters(updatedCharacters);
    
    // Save character order
    const characterOrder = updatedCharacters.map(c => c.id);
    saveCharacterOrder(characterOrder);
  };

  const setCharacterAsMain = (characterId: string) => {
    const updatedCharacters = characters.map(c => ({
      ...c,
      isMain: c.id === characterId
    }));
    
    setCharacters(updatedCharacters);
    saveCharacters(updatedCharacters);
    
    const character = characters.find(c => c.id === characterId);
    if (character) {
      toast({
        title: "Main Character Updated",
        description: `${character.name} is now your main character`,
        className: "progress-complete",
        duration: 4000
      });
    }
  };

  const refreshAllCharacters = async () => {
    if (characters.length === 0) {
      toast({
        title: "No Characters",
        description: "Add some characters first to refresh their data",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    const refreshPromises = characters.map(async (character) => {
      try {
        const { data, error } = await supabase.functions.invoke('nexon-character-lookup', {
          body: { 
            characterName: character.name, 
            region: character.reboot ? 'na' : 'na' // Simplified for now
          }
        });

        if (error || !data?.name) {
          return character; // Keep original if refresh fails
        }

        return {
          ...character,
          level: data.level,
          exp: data.exp || character.exp,
          class: data.additionalData?.class || character.class,
          lastUpdated: new Date().toISOString(),
          legionLevel: data.legionLevel,
          raidPower: data.raidPower,
          avatarUrl: data.characterImgURL || character.avatarUrl,
          region: data.region || character.region,
          worldName: data.worldName || character.worldName,
          additionalData: data.additionalData || character.additionalData,
        };
      } catch {
        return character; // Keep original if refresh fails
      }
    });

    try {
      const refreshedCharacters = await Promise.all(refreshPromises);
      setCharacters(refreshedCharacters);
      saveCharacters(refreshedCharacters);
      
      toast({
        title: "Characters Refreshed",
        description: `Updated data for ${refreshedCharacters.length} character(s)`,
        className: "progress-complete",
        duration: 4000
      });
    } catch (error) {
      toast({
        title: "Refresh Error",
        description: "Some characters could not be refreshed",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleBulkAdd = async () => {
    if (!bulkNamesInput.trim()) return;
    
    const names = bulkNamesInput
      .split(/[,\s]+/)
      .map(name => name.trim())
      .filter(name => name.length > 0);
    
    if (names.length === 0) return;

    if (names.length > 1) {
      // Show boss dialog for bulk add
      setPendingBulkNames(names);
      setIsBossDialogOpen(true);
      return;
    }

    // Single character - add directly
    try {
      await addCharacter(names[0], characterRegion);
      setBulkNamesInput('');
    } catch {
      // Error already handled in addCharacter
    }
  };

  // Computed values
  const mainCharacter = characters.find(c => c.isMain) || 
                       characters.reduce((highest, current) => 
                         current.level > (highest?.level || 0) ? current : highest, 
                         null as Character | null);

  const mainLegion = mainCharacter?.legionLevel;
  const mainRaidPower = mainCharacter?.raidPower;

  const selectCharacterForExpGraph = (character: Character) => {
    setSelectedExpCharacter(character);
  };

  return {
    // State
    characters,
    mainCharacter,
    mainLegion,
    mainRaidPower,
    selectedExpCharacter,
    expChartTimePeriod,
    newCharacterName,
    bulkNamesInput,
    isLoading,
    characterRegion,
    isBossDialogOpen,
    pendingCharacterName,
    pendingBulkNames,
    selectedBossEnabled,
    partySizes,
    selectedVariantByBase,
    baseEnabledByBase,
    searchQuery,
    presets,
    newPresetName,
    showAddPreset,
    showSavePresetDialog,
    pendingPresetName,
    editingPreset,
    selectedPreset,

    // Actions
    setNewCharacterName,
    setBulkNamesInput,
    setCharacterRegion,
    setIsBossDialogOpen,
    setPendingCharacterName,
    setPendingBulkNames,
    setSelectedBossEnabled,
    setPartySizes,
    setSelectedVariantByBase,
    setBaseEnabledByBase,
    setSearchQuery,
    setPresets,
    setNewPresetName,
    setShowAddPreset,
    setShowSavePresetDialog,
    setPendingPresetName,
    setEditingPreset,
    setSelectedPreset,
    setExpChartTimePeriod,

    // Functions
    addCharacter,
    removeCharacter,
    moveCharacter,
    setCharacterAsMain,
    refreshAllCharacters,
    handleBulkAdd,
    selectCharacterForExpGraph,
  };
};
