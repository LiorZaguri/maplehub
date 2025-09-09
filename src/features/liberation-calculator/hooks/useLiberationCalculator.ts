import { useMemo } from 'react';
import { BossSelection, CalculatorConfig, PlanResult } from '../constants/types';
import { calculateLiberationPlan } from '../services/liberationService';

/**
 * Pure convenience hook. You can skip this and call the service directly
 * from your existing form submit handler.
 */
export function useLiberationCalculator(
  config: CalculatorConfig,
  selections: BossSelection[]
): PlanResult {
  return useMemo(() => calculateLiberationPlan(config, selections), [config, selections]);
}
