// Boss preset configurations for different character types
// These presets define which bosses are enabled and their party sizes for common character builds

export interface BossPresetConfig {
  enabled: boolean;
  partySize: number;
  difficulty: string;
}

export interface BossPresetData {
  name: string;
  description: string;
  bosses: Record<string, BossPresetConfig>;
}

// Default preset names that are built-in (not custom user presets)
export const DEFAULT_PRESET_NAMES = ['NLomien Mule', 'HLotus Mule', 'Ctene Mule'];

// Hardcoded preset configurations
export const BOSS_PRESET_CONFIGS: Record<string, Record<string, BossPresetConfig>> = {
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

// Helper function to check if a preset name is a default preset
export const isDefaultPreset = (presetName: string): boolean => {
  return DEFAULT_PRESET_NAMES.includes(presetName);
};

// Helper function to get preset configuration
export const getPresetConfig = (presetName: string): Record<string, BossPresetConfig> => {
  return BOSS_PRESET_CONFIGS[presetName] || {};
};

// Helper function to get all available preset names
export const getAllPresetNames = (): string[] => {
  return Object.keys(BOSS_PRESET_CONFIGS);
};
