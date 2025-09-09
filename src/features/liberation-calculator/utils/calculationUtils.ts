import { BossClear, BossInfo, LiberationProgress, LiberationSchedule, WeeklyTracesBreakdown } from '../types/liberation';
import { LIBERATION_BOSSES, LIBERATION_REQUIREMENTS } from '../constants/liberationData';

export const calculateWeeklyTraces = (bossesCleared: BossClear[]): number => {
  return bossesCleared.reduce((total, clear) => {
    const boss = LIBERATION_BOSSES.find(b => b.id === clear.bossId);
    if (!boss || !clear.clearedThisWeek) return total;

    const reward = boss.traceRewards[clear.difficulty] || 0;
    return total + reward;
  }, 0);
};

export const calculateTracesNeeded = (
  totalRequired: number,
  currentTraces: number,
  weeklyTraces: number
): number => {
  return Math.max(0, totalRequired - currentTraces);
};

export const calculateWeeksToComplete = (
  tracesNeeded: number,
  weeklyTraces: number
): number => {
  if (weeklyTraces <= 0) return Infinity;
  return Math.ceil(tracesNeeded / weeklyTraces);
};

export const calculateCompletionDate = (
  startDate: string,
  weeksToComplete: number
): string => {
  if (weeksToComplete === Infinity) return 'Never (no traces)';

  const start = new Date(startDate);
  start.setDate(start.getDate() + (weeksToComplete * 7));

  return start.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

export const generateWeeklyBreakdown = (bossesCleared: BossClear[]): WeeklyTracesBreakdown[] => {
  const breakdown: WeeklyTracesBreakdown[] = [];

  bossesCleared.forEach(clear => {
    if (!clear.clearedThisWeek) return;

    const boss = LIBERATION_BOSSES.find(b => b.id === clear.bossId);
    if (!boss) return;

    const traces = boss.traceRewards[clear.difficulty] || 0;
    if (traces === 0) return;

    breakdown.push({
      bossId: boss.id,
      bossName: boss.name,
      traces
    });
  });

  return breakdown.sort((a, b) => b.traces - a.traces);
};

export const calculateLiberationSchedule = (progress: LiberationProgress): LiberationSchedule => {
  const weeklyTraces = calculateWeeklyTraces(progress.bossesCleared);
  const tracesNeeded = calculateTracesNeeded(
    progress.totalTracesNeeded,
    progress.traceOfDarkness,
    0
  );
  const weeksToComplete = calculateWeeksToComplete(tracesNeeded, weeklyTraces);
  const completionDate = calculateCompletionDate(progress.startDate, weeksToComplete);
  const weeklyBreakdown = generateWeeklyBreakdown(progress.bossesCleared);

  const scheduleTimeline: string[] = [];
  if (weeklyTraces > 0) {
    const currentDate = new Date(progress.startDate);
    for (let week = 1; week <= Math.min(weeksToComplete, 10); week++) {
      currentDate.setDate(currentDate.getDate() + 7);
      const remainingAfterWeek = tracesNeeded - (weeklyTraces * week);
      if (remainingAfterWeek <= 0) {
        scheduleTimeline.push(`Week ${week}: Liberation Complete!`);
        break;
      }
      scheduleTimeline.push(`Week ${week}: ${remainingAfterWeek.toLocaleString()} traces remaining`);
    }
  } else {
    scheduleTimeline.push('No accrual events yet.');
  }

  return {
    totalTracesNeeded: progress.totalTracesNeeded,
    weeklyTraces,
    weeksToComplete,
    completionDate,
    weeklyBreakdown,
    scheduleTimeline
  };
};

export const getBossInfo = (bossId: string): BossInfo | undefined => {
  return LIBERATION_BOSSES.find(boss => boss.id === bossId);
};

export const getAvailableDifficulties = (bossId: string): string[] => {
  const boss = getBossInfo(bossId);
  return boss ? boss.availableDifficulties : [];
};

export const validateBossClear = (bossClear: BossClear): boolean => {
  const boss = getBossInfo(bossClear.bossId);
  if (!boss) return false;

  return boss.availableDifficulties.includes(bossClear.difficulty);
};
