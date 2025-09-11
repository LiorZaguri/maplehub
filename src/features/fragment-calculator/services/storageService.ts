import { HEXASkill, HEXASkillUserData } from '../types';

const SELECTED_CHARACTER_IDS_KEY = 'fragment-calculator-selected-character-ids';

export class FragmentStorageService {
  static saveSelectedCharacterIds(characterIds: string[]): void {
    try {
      localStorage.setItem(SELECTED_CHARACTER_IDS_KEY, JSON.stringify(characterIds));
    } catch (error) {
      console.error('Failed to save selected character IDs:', error);
    }
  }

  static loadSelectedCharacterIds(): string[] {
    try {
      const saved = localStorage.getItem(SELECTED_CHARACTER_IDS_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      console.error('Failed to load selected character IDs:', error);
      return [];
    }
  }

  static clearSelectedCharacterIds(): void {
    try {
      localStorage.removeItem(SELECTED_CHARACTER_IDS_KEY);
    } catch (error) {
      console.error('Failed to clear selected character IDs:', error);
    }
  }

  static saveCharacterSkills(characterId: string, skills: HEXASkill[]): void {
    try {
      const storageKey = `fragment-calculator-character-${characterId}`;
      // Only save user data, not metadata
      const userData: HEXASkillUserData[] = skills.map(skill => ({
        id: skill.id,
        currentLevel: skill.currentLevel,
        targetLevel: skill.targetLevel,
        isComplete: skill.isComplete
      }));
      const characterData = { hexaSkills: userData };
      localStorage.setItem(storageKey, JSON.stringify(characterData));
    } catch (error) {
      console.error('Failed to save character skills:', error);
    }
  }

  static loadCharacterSkills(characterId: string): HEXASkillUserData[] | null {
    try {
      const storageKey = `fragment-calculator-character-${characterId}`;
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const characterData = JSON.parse(saved);
        return characterData.hexaSkills || null;
      }
      return null;
    } catch (error) {
      console.error('Failed to load character skills:', error);
      return null;
    }
  }

  static clearCharacterSkills(characterId: string): void {
    try {
      const storageKey = `fragment-calculator-character-${characterId}`;
      localStorage.removeItem(storageKey);
    } catch (error) {
      console.error('Failed to clear character skills:', error);
    }
  }
}
