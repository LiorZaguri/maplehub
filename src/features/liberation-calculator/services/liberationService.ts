import { QUEST_BASE } from '../constants/liberationData';
import { addUnclearedThisWeek, splitWeeklyMonthly, forecastLiberationDate } from '../utils';
import { BossSelection, CalculatorConfig, PlanResult } from '../constants/types';

export function calculateLiberationPlan(
  config: CalculatorConfig,
  selections: BossSelection[]
): PlanResult {
  const { weekly: weeklyTraces, monthly: monthlyTraces } = splitWeeklyMonthly(
    selections,
    !!config.useGenesisPass
  );

  // starting total = held + base quest stage + this week's uncleared runs
  const base = QUEST_BASE[config.currentQuest] ?? 0;
  const totalAtStart = addUnclearedThisWeek(
    selections,
    !!config.useGenesisPass,
    (config.tracesHeld || 0) + base
  );

  const { dateISO, weeks } = forecastLiberationDate({
    startDate: config.startDate,
    startTotal: totalAtStart,
    weeklyTotal: weeklyTraces,
    monthlyTotal: monthlyTraces,
    goal: config.goal,
    weeklyResetDay: config.weeklyResetDay,
  });

  return {
    estimatedDateISO: dateISO,
    weeks,
    weeklyTraces,
    monthlyTraces,
    totalAtStart,
  };
}
