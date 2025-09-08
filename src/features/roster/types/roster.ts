// Roster types and interfaces

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
  worldName?: string;
  additionalData?: {
    rankings?: Record<string, number | null>;
    legion?: {
      rank?: number;
      legionLevel?: number;
      legionPower?: number;
      timeToCap?: string;
    };
    achievement?: {
      rank?: number;
      tier?: string;
      score?: number;
    };
    expData?: Record<string, string | number | null>;
    expGraphData?: {
      data?: number[];
      labels?: string[];
    };
    lastUpdated?: string;
  };
}

export interface ExpHistoryEntry {
  level: number;
  exp: number;
  timestamp: string;
  lastUpdated?: string;
}

export interface BossPreset {
  name: string;
  enabled: Record<string, boolean>;
  partySizes: Record<string, number>;
  variants: Record<string, string>;
}

export interface RosterState {
  characters: Character[];
  isLoading: boolean;
  selectedCharacter: Character | null;
  showExpGraph: boolean;
  newCharacterName: string;
  bulkNamesInput: string;
  characterRegion: 'na' | 'eu' | 'auto';
  isBossDialogOpen: boolean;
  pendingCharacterName: string | null;
  pendingBulkNames: string[] | null;
  selectedBossEnabled: Record<string, boolean>;
  partySizes: Record<string, number>;
  selectedVariantByBase: Record<string, string>;
  baseEnabledByBase: Record<string, boolean>;
  searchQuery: string;
  presets: string[];
  newPresetName: string;
  showAddPreset: boolean;
  showSavePresetDialog: boolean;
}

export type CharacterRegion = 'na' | 'eu' | 'auto';
