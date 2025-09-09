import { LIBERATION_STORAGE_KEY } from '../constants';
import { LiberationCalculatorInputs } from '../types';

interface LiberationStorageData {
  selectedCharacterIds: string[];
  characterData: Record<string, LiberationCalculatorInputs>;
}

export class LiberationStorageService {
  static saveSelectedCharacterIds(characterIds: string[]): void {
    try {
      const existingData = this.loadAllData();
      const updatedData: LiberationStorageData = {
        ...existingData,
        selectedCharacterIds: characterIds
      };
      localStorage.setItem(LIBERATION_STORAGE_KEY, JSON.stringify(updatedData));
    } catch (error) {
      console.error('Failed to save selected character IDs to localStorage:', error);
    }
  }

  static loadSelectedCharacterIds(): string[] {
    try {
      const data = this.loadAllData();
      return data.selectedCharacterIds || [];
    } catch (error) {
      console.error('Failed to load selected character IDs from localStorage:', error);
      return [];
    }
  }

  static saveCharacterData(characterId: string, inputs: LiberationCalculatorInputs): void {
    try {
      const existingData = this.loadAllData();
      const updatedData: LiberationStorageData = {
        ...existingData,
        characterData: {
          ...existingData.characterData,
          [characterId]: inputs
        }
      };
      localStorage.setItem(LIBERATION_STORAGE_KEY, JSON.stringify(updatedData));
    } catch (error) {
      console.error('Failed to save character liberation data to localStorage:', error);
    }
  }

  static loadCharacterData(characterId: string): LiberationCalculatorInputs | null {
    try {
      const data = this.loadAllData();
      return data.characterData?.[characterId] || null;
    } catch (error) {
      console.error('Failed to load character liberation data from localStorage:', error);
      return null;
    }
  }

  static loadAllData(): LiberationStorageData {
    try {
      const serialized = localStorage.getItem(LIBERATION_STORAGE_KEY);
      if (!serialized) {
        return { selectedCharacterIds: [], characterData: {} };
      }
      
      const parsed = JSON.parse(serialized);
      return {
        selectedCharacterIds: parsed.selectedCharacterIds || [],
        characterData: parsed.characterData || {}
      };
    } catch (error) {
      console.error('Failed to load liberation data from localStorage:', error);
      return { selectedCharacterIds: [], characterData: {} };
    }
  }

  static clearSelectedCharacters(): void {
    try {
      localStorage.removeItem(LIBERATION_STORAGE_KEY);
    } catch (error) {
      console.error('Failed to clear selected characters from localStorage:', error);
    }
  }
}
