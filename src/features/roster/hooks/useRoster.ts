import { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Character, CharacterRegion } from '../types/roster';
import { getCharacterJobName } from '../utils/jobMapping';
import { useAutoRefresh } from '@/hooks/useAutoRefresh';
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
  const [isDataRefreshing, setIsDataRefreshing] = useState(false);
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

  // Ref to track if main character conflict was already resolved
  const mainCharacterConflictResolvedRef = useRef(false);

  // Listen for roster changes from localStorage
  useEffect(() => {
    const handleStorageChange = () => {
      const loadedCharacters = loadCharacters();
      const orderedCharacters = getOrderedCharacters(loadedCharacters);
      setCharacters(orderedCharacters);
      // Reset the conflict resolution flag when characters change
      mainCharacterConflictResolvedRef.current = false;
    };

    // Initial load
    handleStorageChange();

    // Listen for storage changes (but not rosterUpdate to avoid conflicts with move operations)
    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
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

  // Clear pending states when boss dialog closes
  useEffect(() => {
    if (!isBossDialogOpen) {
      setPendingCharacterName(null);
      setPendingBulkNames(null);
    }
  }, [isBossDialogOpen]);

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
      setIsDataRefreshing(true);
      
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
        class: getCharacterJobName({
          jobID: character.jobID,
          jobDetail: character.jobDetail
        }),
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
        additionalData: {
          // Only include specific fields from additionalData
          ...(character.additionalData?.achievement && { achievement: character.additionalData.achievement }),
          ...(character.additionalData?.expData && { expData: character.additionalData.expData }),
          ...(character.additionalData?.expGraphData && { expGraphData: character.additionalData.expGraphData }),
          ...(character.additionalData?.legion && { legion: character.additionalData.legion }),
        },
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
      setIsDataRefreshing(false);
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
    
    // Save character order first
    const characterOrder = updatedCharacters.map(c => c.id);
    saveCharacterOrder(characterOrder);
    
    // Then save characters and update state
    setCharacters(updatedCharacters);
    saveCharacters(updatedCharacters);
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

  // Helper function to refresh a single character
  const refreshCharacter = async (character: Character): Promise<Character> => {
    try {
      // Use character's actual region, fallback to 'na'
      const region = character.region || 'na';
      
      const { data, error } = await supabase.functions.invoke('nexon-character-lookup', {
        body: { 
          characterName: character.name, 
          region: region
        }
      });

      if (error || !data?.name) {
        console.warn(`Failed to refresh ${character.name}:`, error?.message || 'No data returned');
        throw new Error(error?.message || 'No data returned');
      }

      // Merge data more comprehensively, preserving existing data
      const updatedCharacter: Character = {
        ...character, // Preserve all existing data
        level: data.level || character.level,
        exp: data.exp || character.exp,
        class: getCharacterJobName({
          jobID: data.jobID,
          jobDetail: data.jobDetail
        }),
        lastUpdated: new Date().toISOString(),
        legionLevel: data.legionLevel !== null ? data.legionLevel : character.legionLevel,
        raidPower: data.raidPower !== null ? data.raidPower : character.raidPower,
        avatarUrl: data.characterImgURL || character.avatarUrl,
        region: data.region || character.region,
        worldName: data.worldName || character.worldName,
        isMain: character.isMain, // Never update isMain from API - keep local value
        // Only include specific fields from additionalData
        additionalData: {
          ...character.additionalData, // Preserve existing additionalData
          // Only extract the fields we want from new data
          ...(data.additionalData?.achievement && { achievement: data.additionalData.achievement }),
          ...(data.additionalData?.expData && { expData: data.additionalData.expData }),
          ...(data.additionalData?.expGraphData && { expGraphData: data.additionalData.expGraphData }),
          ...(data.additionalData?.legion && { legion: data.additionalData.legion }),
        }
      };

      return updatedCharacter;
    } catch (error) {
      console.error(`Error refreshing ${character.name}:`, error);
      throw error;
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
    setIsDataRefreshing(true);
    let successCount = 0;
    let errorCount = 0;
    const refreshedCharacters: Character[] = [];

    // Process characters in batches to avoid rate limiting
    const batchSize = 5;
    const batches = [];
    for (let i = 0; i < characters.length; i += batchSize) {
      batches.push(characters.slice(i, i + batchSize));
    }

    for (const batch of batches) {
      const batchPromises = batch.map(async (character) => {
        try {
          const updatedCharacter = await refreshCharacter(character);
          successCount++;
          return updatedCharacter;
        } catch (error) {
          errorCount++;
          return character; // Keep original if refresh fails
        }
      });

      const batchResults = await Promise.all(batchPromises);
      refreshedCharacters.push(...batchResults);

      // Add delay between batches to avoid rate limiting
      if (batches.indexOf(batch) < batches.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    try {
      setCharacters(refreshedCharacters);
      saveCharacters(refreshedCharacters);
      
      const message = errorCount > 0 
        ? `Updated ${successCount} character(s), ${errorCount} failed to update`
        : `Updated data for ${successCount} character(s)`;
      
      toast({
        title: "Characters Refreshed",
        description: message,
        className: errorCount > 0 ? "warning" : "progress-complete",
        duration: 4000
      });
    } catch (error) {
      console.error('Error saving refreshed characters:', error);
      toast({
        title: "Save Error",
        description: "Characters were refreshed but couldn't be saved",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
      setIsDataRefreshing(false);
    }
  };

  const refreshSingleCharacter = async (characterId: string) => {
    const character = characters.find(c => c.id === characterId);
    if (!character) {
      toast({
        title: "Character Not Found",
        description: "Character could not be found for refresh",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    setIsDataRefreshing(true);
    try {
      const updatedCharacter = await refreshCharacter(character);
      
      const updatedCharacters = characters.map(c => 
        c.id === characterId ? updatedCharacter : c
      );
      
      setCharacters(updatedCharacters);
      saveCharacters(updatedCharacters);
      
      toast({
        title: "Character Refreshed",
        description: `${updatedCharacter.name} has been updated`,
        className: "progress-complete",
        duration: 3000
      });
    } catch (error) {
      toast({
        title: "Refresh Failed",
        description: `Could not refresh ${character.name}`,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
      setIsDataRefreshing(false);
    }
  };

  const handleBulkAdd = async () => {
    if (!bulkNamesInput.trim()) return;

    const names = bulkNamesInput
      .split(/[,\s]+/)
      .map(name => name.trim())
      .filter(name => name.length > 0);

    if (names.length === 0) return;

    setIsLoading(true);
    setIsDataRefreshing(true);

    try {
      // Add all characters to roster first (works like single character addition)
      const successfullyAdded: string[] = [];
      const addedCharacters: Character[] = [];

    // Fetch all character data first
    const characterPromises = names.map(async (name) => {
      try {
        const { data, error } = await supabase.functions.invoke('nexon-character-lookup', {
          body: { characterName: name, region: characterRegion }
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
          class: getCharacterJobName({
            jobID: character.jobID,
            jobDetail: character.jobDetail
          }),
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
          additionalData: {
            // Only include specific fields from additionalData
            ...(character.additionalData?.achievement && { achievement: character.additionalData.achievement }),
            ...(character.additionalData?.expData && { expData: character.additionalData.expData }),
            ...(character.additionalData?.expGraphData && { expGraphData: character.additionalData.expGraphData }),
            ...(character.additionalData?.legion && { legion: character.additionalData.legion }),
          },
        };

        return { name, character: newCharacter, success: true };
      } catch (error) {
        console.error(`Failed to add character ${name}:`, error);
        return { name, character: null, success: false, error };
      }
    });

    // Wait for all fetches to complete
    const results = await Promise.all(characterPromises);

    // Process results and add to roster
    for (const result of results) {
      if (result.success && result.character) {
        // Check for duplicates
        const exists = characters.some(c =>
          c.name.toLowerCase() === result.character!.name.toLowerCase()
        );

        if (!exists) {
          successfullyAdded.push(result.name);
          addedCharacters.push(result.character);
        }
      }
    }

    // Update state with all new characters at once
    if (addedCharacters.length > 0) {
      const updatedCharacters = [...characters, ...addedCharacters];
      setCharacters(updatedCharacters);
      saveCharacters(updatedCharacters);

      // Show single success toast for bulk addition
      if (addedCharacters.length === 1) {
        // Single character - show individual toast
        const char = addedCharacters[0];
        toast({
          title: "Character Added",
          description: `${char.name} (Lv. ${char.level} ${char.class}) has been added to your roster`,
          className: "progress-complete",
          duration: 4000
        });
      } else {
        // Multiple characters - show summary toast
        toast({
          title: "Characters Added",
          description: `${addedCharacters.length} characters have been added to your roster`,
          className: "progress-complete",
          duration: 4000
        });
      }
    }

      // Clear input after adding
      setBulkNamesInput('');

      // If we have at least one successfully added character, open boss dialog
      if (successfullyAdded.length > 0) {
        setPendingBulkNames(successfullyAdded);
        // Set characterName to the first successfully added character for display purposes
        setPendingCharacterName(successfullyAdded[0]);
        setIsBossDialogOpen(true);
      }
    } catch (error) {
      console.error('Error during bulk add:', error);
    } finally {
      setIsLoading(false);
      setIsDataRefreshing(false);
    }
  };

  // Handle main character conflict resolution in useEffect to prevent repeated toasts
  useEffect(() => {
    const mainCharacters = characters.filter(c => c.isMain);
    
    if (mainCharacters.length > 1) {
      // Multiple main characters - pick the highest level one and fix the others
      const mainCharacter = mainCharacters.reduce((highest, current) => 
        current.level > highest.level ? current : highest);
      
      // Fix the other characters by setting isMain to false
      const updatedCharacters = characters.map(c => 
        c.isMain && c.id !== mainCharacter?.id ? { ...c, isMain: false } : c
      );
      
      // Only update if there were changes and we haven't already resolved this conflict
      if (updatedCharacters.some((c, i) => c.isMain !== characters[i].isMain) && !mainCharacterConflictResolvedRef.current) {
        setCharacters(updatedCharacters);
        saveCharacters(updatedCharacters);
        mainCharacterConflictResolvedRef.current = true;
        
        toast({
          title: "Main Character Conflict Resolved",
          description: `Multiple characters were marked as main. Set ${mainCharacter.name} as the main character.`,
          className: "warning",
          duration: 4000
        });
      }
    }
  }, [characters, toast]); // Only run when characters change

  // Computed values - handle main character selection (simplified)
  const mainCharacters = characters.filter(c => c.isMain);
  let mainCharacter: Character | null = null;
  
  if (mainCharacters.length === 1) {
    // Exactly one main character - use it
    mainCharacter = mainCharacters[0];
  } else if (mainCharacters.length > 1) {
    // Multiple main characters - pick the highest level one (conflict resolution will fix this)
    mainCharacter = mainCharacters.reduce((highest, current) => 
      current.level > highest.level ? current : highest);
  } else {
    // No main characters - auto-detect highest level
    mainCharacter = characters.reduce((highest, current) => 
      current.level > (highest?.level || 0) ? current : highest, 
      null as Character | null);
  }

  const mainLegion = mainCharacter?.legionLevel;
  const mainRaidPower = mainCharacter?.raidPower;

  const selectCharacterForExpGraph = (character: Character) => {
    setSelectedExpCharacter(character);
  };

  // Auto-refresh configuration - silent refresh during reset hours
  const autoRefreshConfig = useCallback(async () => {
    if (characters.length === 0) return;
    
    setIsDataRefreshing(true);
    
    try {
      // Use existing refresh logic but silently (no toast notifications)
    const refreshedCharacters: Character[] = [];
    const batchSize = 5;
    const batches = [];
    
    for (let i = 0; i < characters.length; i += batchSize) {
      batches.push(characters.slice(i, i + batchSize));
    }

    for (const batch of batches) {
      const batchPromises = batch.map(async (character) => {
        try {
          const updatedCharacter = await refreshCharacter(character);
          return updatedCharacter;
        } catch (error) {
          return character; // Keep original if refresh fails
        }
      });

      const batchResults = await Promise.all(batchPromises);
      refreshedCharacters.push(...batchResults);

      // Add delay between batches to avoid rate limiting
      if (batches.indexOf(batch) < batches.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

      // Update characters silently
      setCharacters(refreshedCharacters);
      saveCharacters(refreshedCharacters);
    } finally {
      setIsDataRefreshing(false);
    }
  }, [characters, refreshCharacter]);

  // Auto-refresh hook
  const autoRefresh = useAutoRefresh({
    onRefresh: autoRefreshConfig,
    isEnabled: characters.length > 0
  });

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
    isDataRefreshing,
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
    refreshSingleCharacter,
    handleBulkAdd,
    selectCharacterForExpGraph,

    // Auto-refresh info (for debugging/UI)
    autoRefreshInfo: {
      shouldRefresh: autoRefresh.shouldRefresh,
      isInResetHours: autoRefresh.isInResetHours,
      currentUTCHour: autoRefresh.currentUTCHour,
      lastVisitTimestamp: autoRefresh.lastVisitTimestamp,
      lastAutoRefreshHour: autoRefresh.lastAutoRefreshHour,
      lastRefreshDone: autoRefresh.lastRefreshDone
    }
  };
};
