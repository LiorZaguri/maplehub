import { Character, BossPreset } from '../types/roster';
import { createArrayStorage, createObjectStorage } from '@/utils/storageUtils';

// Storage keys
export const STORAGE_KEYS = {
  ROSTER: 'maplehub_roster',
  CHARACTER_ORDER: 'maplehub_roster_character_order',
  BOSS_PRESETS: 'maplehub_boss_presets',
  BOSS_ENABLED: 'maplehub_boss_enabled',
  BOSS_PARTY_SIZES: 'maplehub_boss_party_sizes',
  BOSS_VARIANTS: 'maplehub_boss_variants',
  BOSS_BASE_ENABLED: 'maplehub_boss_base_enabled',
} as const;

// Typed storage instances
const rosterStorage = createArrayStorage<Character>(STORAGE_KEYS.ROSTER, []);
const characterOrderStorage = createArrayStorage<string>(STORAGE_KEYS.CHARACTER_ORDER, []);
const bossPresetsStorage = createArrayStorage<string>(STORAGE_KEYS.BOSS_PRESETS, []);
const bossEnabledStorage = createObjectStorage<Record<string, boolean>>(STORAGE_KEYS.BOSS_ENABLED, {});
const bossPartySizesStorage = createObjectStorage<Record<string, number>>(STORAGE_KEYS.BOSS_PARTY_SIZES, {});
const bossVariantsStorage = createObjectStorage<Record<string, string>>(STORAGE_KEYS.BOSS_VARIANTS, {});
const bossBaseEnabledStorage = createObjectStorage<Record<string, boolean>>(STORAGE_KEYS.BOSS_BASE_ENABLED, {});

/**
 * Load characters from localStorage
 */
export const loadCharacters = (): Character[] => {
  const characters = rosterStorage.load();
  
  // Ensure all characters have IDs
  const seen = new Set<string>();
  const withIds = characters.map((c) => {
    let id = c.id;
    if (!id || seen.has(id)) {
      id = (globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`);
    }
    seen.add(id);
    return { ...c, id };
  });

  // Save back if we added/fixed any IDs
  if (withIds.some((c, i) => c.id !== characters[i]?.id)) {
    saveCharacters(withIds);
  }

  return withIds;
};

/**
 * Save characters to localStorage
 */
export const saveCharacters = (characters: Character[]): void => {
  rosterStorage.save(characters);
  
  // Dispatch custom event for cross-component updates
  window.dispatchEvent(new CustomEvent('rosterUpdate'));
};

/**
 * Load character order from localStorage
 */
export const loadCharacterOrder = (): string[] | null => {
  const order = characterOrderStorage.load();
  return order.length > 0 ? order : null;
};

/**
 * Save character order to localStorage
 */
export const saveCharacterOrder = (order: string[]): void => {
  characterOrderStorage.save(order);
};

/**
 * Load boss presets from localStorage
 */
export const loadBossPresets = (): string[] => bossPresetsStorage.load();

/**
 * Save boss presets to localStorage
 */
export const saveBossPresets = (presets: string[]): void => bossPresetsStorage.save(presets);

/**
 * Load boss enabled settings from localStorage
 */
export const loadBossEnabled = (): Record<string, boolean> => bossEnabledStorage.load();

/**
 * Save boss enabled settings to localStorage
 */
export const saveBossEnabled = (enabled: Record<string, boolean>): void => bossEnabledStorage.save(enabled);

/**
 * Load boss enabled settings for a specific character
 */
export const loadBossEnabledForCharacter = (characterName: string): Record<string, boolean> => {
  const stored = localStorage.getItem(STORAGE_KEYS.BOSS_ENABLED);
  const parsed = stored ? (JSON.parse(stored) as Record<string, Record<string, boolean>>) : {};
  return parsed[characterName] || {};
};

/**
 * Save boss enabled settings for a specific character
 */
export const saveBossEnabledForCharacter = (characterName: string, enabled: Record<string, boolean>): void => {
  const stored = localStorage.getItem(STORAGE_KEYS.BOSS_ENABLED);
  const parsed = stored ? (JSON.parse(stored) as Record<string, Record<string, boolean>>) : {};
  parsed[characterName] = enabled;
  localStorage.setItem(STORAGE_KEYS.BOSS_ENABLED, JSON.stringify(parsed));
};

/**
 * Load boss party sizes from localStorage
 */
export const loadBossPartySizes = (): Record<string, number> => bossPartySizesStorage.load();

/**
 * Save boss party sizes to localStorage
 */
export const saveBossPartySizes = (sizes: Record<string, number>): void => bossPartySizesStorage.save(sizes);

/**
 * Load boss party sizes for a specific character
 */
export const loadBossPartySizesForCharacter = (characterName: string): Record<string, number> => {
  const stored = localStorage.getItem(STORAGE_KEYS.BOSS_PARTY_SIZES);
  const parsed = stored ? (JSON.parse(stored) as Record<string, Record<string, number>>) : {};
  return parsed[characterName] || {};
};

/**
 * Save boss party sizes for a specific character
 */
export const saveBossPartySizesForCharacter = (characterName: string, sizes: Record<string, number>): void => {
  const stored = localStorage.getItem(STORAGE_KEYS.BOSS_PARTY_SIZES);
  const parsed = stored ? (JSON.parse(stored) as Record<string, Record<string, number>>) : {};
  parsed[characterName] = sizes;
  localStorage.setItem(STORAGE_KEYS.BOSS_PARTY_SIZES, JSON.stringify(parsed));
};

/**
 * Load boss variants from localStorage
 */
export const loadBossVariants = (): Record<string, string> => bossVariantsStorage.load();

/**
 * Save boss variants to localStorage
 */
export const saveBossVariants = (variants: Record<string, string>): void => bossVariantsStorage.save(variants);

/**
 * Load boss variants for a specific character
 */
export const loadBossVariantsForCharacter = (characterName: string): Record<string, string> => {
  const stored = localStorage.getItem(STORAGE_KEYS.BOSS_VARIANTS);
  const parsed = stored ? (JSON.parse(stored) as Record<string, Record<string, string>>) : {};
  return parsed[characterName] || {};
};

/**
 * Save boss variants for a specific character
 */
export const saveBossVariantsForCharacter = (characterName: string, variants: Record<string, string>): void => {
  const stored = localStorage.getItem(STORAGE_KEYS.BOSS_VARIANTS);
  const parsed = stored ? (JSON.parse(stored) as Record<string, Record<string, string>>) : {};
  parsed[characterName] = variants;
  localStorage.setItem(STORAGE_KEYS.BOSS_VARIANTS, JSON.stringify(parsed));
};

/**
 * Load boss base enabled settings from localStorage
 */
export const loadBossBaseEnabled = (): Record<string, boolean> => bossBaseEnabledStorage.load();

/**
 * Save boss base enabled settings to localStorage
 */
export const saveBossBaseEnabled = (enabled: Record<string, boolean>): void => bossBaseEnabledStorage.save(enabled);

/**
 * Load boss base enabled settings for a specific character
 */
export const loadBossBaseEnabledForCharacter = (characterName: string): Record<string, boolean> => {
  const stored = localStorage.getItem(STORAGE_KEYS.BOSS_BASE_ENABLED);
  const parsed = stored ? (JSON.parse(stored) as Record<string, Record<string, boolean>>) : {};
  return parsed[characterName] || {};
};

/**
 * Save boss base enabled settings for a specific character
 */
export const saveBossBaseEnabledForCharacter = (characterName: string, enabled: Record<string, boolean>): void => {
  const stored = localStorage.getItem(STORAGE_KEYS.BOSS_BASE_ENABLED);
  const parsed = stored ? (JSON.parse(stored) as Record<string, Record<string, boolean>>) : {};
  parsed[characterName] = enabled;
  localStorage.setItem(STORAGE_KEYS.BOSS_BASE_ENABLED, JSON.stringify(parsed));
};

/**
 * Get characters ordered by saved order preference
 */
export const getOrderedCharacters = (characters: Character[]): Character[] => {
  const savedOrder = loadCharacterOrder();
  if (savedOrder) {
    const orderedCharacters = savedOrder
      .map(id => characters.find(c => c.id === id))
      .filter(Boolean) as Character[];
    const newCharacters = characters.filter(c => !savedOrder.includes(c.id));
    return [...orderedCharacters, ...newCharacters];
  }
  return characters;
};
