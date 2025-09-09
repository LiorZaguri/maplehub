import { useState, useMemo, useEffect } from 'react';
import { useLiberationCalculator } from './useLiberationCalculator';
import { 
  LiberationCalculatorInputs, 
  LiberationCalculation, 
  BossSelection as OldBossSelection 
} from '../types';
import { 
  CalculatorConfig, 
  BossSelection, 
  QuestStage, 
  Difficulty, 
  BossId 
} from '../constants/types';
import { BOSS_DATA } from '../constants';
import { LiberationStorageService } from '../services/storageService';

// Map old boss names to new boss IDs
const BOSS_NAME_TO_ID: Record<string, BossId> = {
  'Lotus': 'Lotus',
  'Damien': 'Damien', 
  'Lucid': 'Lucid',
  'Will': 'Will',
  'Gloom': 'Gloom',
  'Darknell': 'Darknell',
  'Verus Hilla': 'Verus Hilla',
  'Black Mage': 'Black Mage'
};

// Map old difficulty names to new difficulty types
const DIFFICULTY_MAP: Record<string, Difficulty> = {
  'easy': 'Easy',
  'normal': 'Normal', 
  'hard': 'Hard',
  'chaos': 'Chaos',
  'extreme': 'Extreme'
};

// Map quest values to QuestStage
const QUEST_MAP: Record<string, QuestStage> = {
  '0|Von Leon': 'None',
  '500|Arkarium': 'Arkarium',
  '1000|Magnus': 'Magnus', 
  '1500|Lotus': 'Lotus',
  '2500|Damien': 'Damien',
  '3500|Will': 'Will',
  '4500|Lucid': 'Lucid',
  '5500|Verus Hilla': 'Verus Hilla'
};

// Using centralized LiberationStorageService instead of individual localStorage keys

// Default inputs
const getDefaultInputs = (): LiberationCalculatorInputs => ({
  currentTraces: 0,
  targetTraces: 6500,
  weeklyBonus: 0,
  startDate: new Date().toISOString().split('T')[0],
  bossSelections: BOSS_DATA.map(boss => ({
    bossName: boss.name,
    difficulty: boss.difficulties[0].label,
    partySize: boss.name === 'Black Mage' ? 6 : 1, // Default Black Mage to 6-man party
    weeklyShare: 0,
    isClearing: false
  })),
  bmDifficulty: 'hard',
  bmPartySize: 6,
  genesisPass: 'no',
  liberationQuest: '0|Von Leon',
  magnificationScale: '100%',
  stepCollected: 0,
  completionRate: 0
});

export function useLiberationCalculatorLogic(characterId?: string) {
  const [inputs, setInputs] = useState<LiberationCalculatorInputs>(getDefaultInputs());

  // Load saved data when characterId changes
  useEffect(() => {
    if (characterId) {
      const savedData = LiberationStorageService.loadCharacterData(characterId);
      if (savedData) {
        setInputs(savedData);
      } else {
        setInputs(getDefaultInputs());
      }
    }
  }, [characterId]);

  // Save data to localStorage whenever inputs change
  useEffect(() => {
    if (characterId) {
      LiberationStorageService.saveCharacterData(characterId, inputs);
    }
  }, [inputs, characterId]);

  // Convert old inputs to new format
  const config: CalculatorConfig = useMemo(() => {
    const questValue = inputs.liberationQuest;
    const currentQuest = QUEST_MAP[questValue] || 'None';
    
    return {
      currentQuest,
      tracesHeld: inputs.currentTraces,
      startDate: inputs.startDate,
      useGenesisPass: inputs.genesisPass === 'yes',
      goal: inputs.targetTraces
    };
  }, [inputs.liberationQuest, inputs.currentTraces, inputs.startDate, inputs.genesisPass, inputs.targetTraces]);

  const selections: BossSelection[] = useMemo(() => {
    const bossSelections: BossSelection[] = [];
    
    // Add all bosses (including Black Mage) from the main boss selections
    inputs.bossSelections.forEach(boss => {
      const bossId = BOSS_NAME_TO_ID[boss.bossName];
      const difficulty = DIFFICULTY_MAP[boss.difficulty];
      
      if (bossId && difficulty) {
        bossSelections.push({
          bossId,
          difficulty,
          partySize: boss.partySize,
          alreadyCleared: boss.isClearing, // If checked (isClearing=true), then already cleared
          include: true // Include all bosses, let the calculation logic handle cleared status
        });
      }
    });

    return bossSelections;
  }, [inputs.bossSelections]);

  // Use the new calculator
  const planResult = useLiberationCalculator(config, selections);

  // Convert new result to old format
  const calculation: LiberationCalculation | null = useMemo(() => {
    if (!planResult) return null;

    return {
      weeklyTraces: planResult.weeklyTraces,
      bmMonthly: planResult.monthlyTraces,
      totalPer4Weeks: planResult.weeklyTraces * 4 + planResult.monthlyTraces,
      weeksNeeded: planResult.weeks,
      eta: planResult.estimatedDateISO,
      finalTraces: planResult.totalAtStart
    };
  }, [planResult]);

  // Calculate and save completion rate whenever calculation changes
  useEffect(() => {
    if (calculation && inputs.targetTraces > 0) {
      const newCompletionRate = Math.round((calculation.finalTraces / inputs.targetTraces) * 100);
      
      // Always update the completion rate when calculation changes
      setInputs(prev => ({
        ...prev,
        completionRate: newCompletionRate
      }));
    }
  }, [calculation, inputs.targetTraces, characterId]);

  const updateInput = (field: keyof LiberationCalculatorInputs, value: any) => {
    setInputs(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const updateBossSelection = (index: number, field: string, value: any) => {
    setInputs(prev => ({
      ...prev,
      bossSelections: prev.bossSelections.map((boss, i) => 
        i === index ? { ...boss, [field]: value } : boss
      )
    }));
  };

  const resetToDefaults = () => {
    setInputs(getDefaultInputs());
  };

  const clearSavedData = () => {
    if (characterId) {
      // Clear the character data from centralized storage
      LiberationStorageService.saveCharacterData(characterId, getDefaultInputs());
    }
    setInputs(getDefaultInputs());
  };

  return {
    inputs,
    calculation,
    updateInput,
    updateBossSelection,
    resetToDefaults,
    clearSavedData
  };
}
