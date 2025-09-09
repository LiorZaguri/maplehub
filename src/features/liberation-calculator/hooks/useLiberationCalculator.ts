import { useState, useEffect, useCallback } from 'react';
import { BossClear, LiberationProgress, LiberationSchedule, LiberationType } from '../types/liberation';
import { LIBERATION_REQUIREMENTS } from '../constants/liberationData';
import { calculateLiberationSchedule } from '../utils/calculationUtils';

const STORAGE_KEY = 'maplehub-liberation-calculator';

const createDefaultProgress = (type: LiberationType): LiberationProgress => ({
  type,
  currentQuest: LIBERATION_REQUIREMENTS[type].quests[0],
  traceOfDarkness: 0,
  totalTracesNeeded: LIBERATION_REQUIREMENTS[type].totalTraces,
  startDate: new Date().toISOString().split('T')[0],
  bossesCleared: []
});

export const useLiberationCalculator = () => {
  const [liberationType, setLiberationType] = useState<LiberationType>('genesis');
  const [progress, setProgress] = useState<LiberationProgress>(() =>
    createDefaultProgress('genesis')
  );
  const [schedule, setSchedule] = useState<LiberationSchedule>(() =>
    calculateLiberationSchedule(createDefaultProgress('genesis'))
  );

  // Load data from localStorage on mount
  useEffect(() => {
    try {
      const savedData = localStorage.getItem(STORAGE_KEY);
      if (savedData) {
        const parsed = JSON.parse(savedData);
        setLiberationType(parsed.liberationType || 'genesis');
        if (parsed.progress) {
          setProgress(parsed.progress);
        }
      }
    } catch (error) {
      console.error('Failed to load liberation calculator data:', error);
    }
  }, []);

  // Save data to localStorage whenever state changes
  useEffect(() => {
    try {
      const dataToSave = {
        liberationType,
        progress
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
    } catch (error) {
      console.error('Failed to save liberation calculator data:', error);
    }
  }, [liberationType, progress]);

  // Update schedule whenever progress changes
  useEffect(() => {
    const newSchedule = calculateLiberationSchedule(progress);
    setSchedule(newSchedule);
  }, [progress]);

  const switchLiberationType = useCallback((type: LiberationType) => {
    setLiberationType(type);
    const newProgress = createDefaultProgress(type);
    setProgress(newProgress);
  }, []);

  const updateProgress = useCallback((updates: Partial<LiberationProgress>) => {
    setProgress(prev => ({
      ...prev,
      ...updates
    }));
  }, []);

  const updateBossClear = useCallback((bossId: string, difficulty: string, updates: Partial<BossClear>) => {
    setProgress(prev => ({
      ...prev,
      bossesCleared: prev.bossesCleared.map(clear =>
        clear.bossId === bossId && clear.difficulty === difficulty
          ? { ...clear, ...updates }
          : clear
      )
    }));
  }, []);

  const addBossClear = useCallback((bossClear: BossClear) => {
    setProgress(prev => ({
      ...prev,
      bossesCleared: [...prev.bossesCleared, bossClear]
    }));
  }, []);

  const removeBossClear = useCallback((bossId: string, difficulty: string) => {
    setProgress(prev => ({
      ...prev,
      bossesCleared: prev.bossesCleared.filter(
        clear => !(clear.bossId === bossId && clear.difficulty === difficulty)
      )
    }));
  }, []);

  const resetProgress = useCallback(() => {
    const newProgress = createDefaultProgress(liberationType);
    setProgress(newProgress);
  }, [liberationType]);

  return {
    liberationType,
    progress,
    schedule,
    switchLiberationType,
    updateProgress,
    updateBossClear,
    addBossClear,
    removeBossClear,
    resetProgress
  };
};
