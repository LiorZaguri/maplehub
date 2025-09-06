import { useState, useEffect, useCallback } from 'react';

export interface Character {
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
  region?: 'na' | 'eu';
}

interface UseCharacterDataOptions {
  autoLoad?: boolean;
  storageKey?: string;
}

export function useCharacterData(options: UseCharacterDataOptions = {}) {
  const { autoLoad = true, storageKey = 'maplehub_roster' } = options;

  const [characters, setCharacters] = useState<Character[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load characters from localStorage
  const loadCharacters = useCallback(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      if (!stored) {
        setCharacters([]);
        return;
      }

      const parsed = JSON.parse(stored) as Character[];
      const seen = new Set<string>();
      const withIds = parsed.map((c) => {
        let id = c.id;
        if (!id || seen.has(id)) {
          id = (globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`);
        }
        seen.add(id);
        return { ...c, id };
      });

      setCharacters(withIds);
      setError(null);
    } catch (err) {
      console.error('Failed to load characters:', err);
      setError('Failed to load characters');
      setCharacters([]);
    } finally {
      setIsLoading(false);
    }
  }, [storageKey]);

  // Save characters to localStorage
  const saveCharacters = useCallback((newCharacters: Character[]) => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(newCharacters));
      setCharacters(newCharacters);
      setError(null);
    } catch (err) {
      console.error('Failed to save characters:', err);
      setError('Failed to save characters');
    }
  }, [storageKey]);

  // Add a new character
  const addCharacter = useCallback((character: Omit<Character, 'id'>) => {
    const newCharacter: Character = {
      ...character,
      id: (globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`),
    };

    setCharacters(prev => {
      const updated = [...prev, newCharacter];
      saveCharacters(updated);
      return updated;
    });

    return newCharacter;
  }, [saveCharacters]);

  // Update a character
  const updateCharacter = useCallback((id: string, updates: Partial<Character>) => {
    setCharacters(prev => {
      const updated = prev.map(char =>
        char.id === id ? { ...char, ...updates } : char
      );
      saveCharacters(updated);
      return updated;
    });
  }, [saveCharacters]);

  // Remove a character
  const removeCharacter = useCallback((id: string) => {
    setCharacters(prev => {
      const updated = prev.filter(char => char.id !== id);
      saveCharacters(updated);
      return updated;
    });
  }, [saveCharacters]);

  // Get character by ID
  const getCharacterById = useCallback((id: string) => {
    return characters.find(char => char.id === id);
  }, [characters]);

  // Get character by name
  const getCharacterByName = useCallback((name: string) => {
    return characters.find(char => char.name.toLowerCase() === name.toLowerCase());
  }, [characters]);

  // Get main character
  const getMainCharacter = useCallback(() => {
    return characters.find(char => char.isMain);
  }, [characters]);

  // Set character as main (ensures only one main character)
  const setMainCharacter = useCallback((id: string) => {
    setCharacters(prev => {
      const updated = prev.map(char => ({
        ...char,
        isMain: char.id === id
      }));
      saveCharacters(updated);
      return updated;
    });
  }, [saveCharacters]);

  // Reorder characters
  const reorderCharacters = useCallback((newOrder: Character[]) => {
    saveCharacters(newOrder);
  }, [saveCharacters]);

  // Listen for storage changes
  useEffect(() => {
    if (!autoLoad) return;

    loadCharacters();

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === storageKey) {
        loadCharacters();
      }
    };

    const handleRosterUpdate = () => {
      loadCharacters();
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('rosterUpdate', handleRosterUpdate);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('rosterUpdate', handleRosterUpdate);
    };
  }, [autoLoad, storageKey, loadCharacters]);

  return {
    characters,
    isLoading,
    error,
    loadCharacters,
    saveCharacters,
    addCharacter,
    updateCharacter,
    removeCharacter,
    getCharacterById,
    getCharacterByName,
    getMainCharacter,
    setMainCharacter,
    reorderCharacters,
  };
}
