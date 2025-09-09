import { addDays, addYears, format, isSameDay, startOfDay } from 'date-fns';
import { DEFAULT_WEEKLY_RESET_DAY, LIBERATION_GOAL } from '../constants';

export interface ForecastArgs {
  startDate: string | Date;
  startTotal: number;
  weeklyTotal: number;
  monthlyTotal: number;
  goal?: number;
  weeklyResetDay?: number; // 0=Sun..6=Sat
}

/**
 * Marches day-by-day from startDate and adds:
 *  - weeklyTotal at each weekly reset day (except the starting day)
 *  - monthlyTotal on the 1st of the month (except the starting day)
 * until reaching `goal`.
 * Mirrors the algorithm your app uses.  :contentReference[oaicite:6]{index=6}
 */
export function forecastLiberationDate({
  startDate,
  startTotal,
  weeklyTotal,
  monthlyTotal,
  goal = LIBERATION_GOAL,
  weeklyResetDay = DEFAULT_WEEKLY_RESET_DAY,
}: ForecastArgs): { dateISO: string; weeks: number } {
  let total = startTotal;
  let weeks = 0;

  // Validate and create date objects
  const startDateObj = new Date(startDate);
  if (isNaN(startDateObj.getTime())) {
    const fallbackDate = new Date();
    
    // Return a safe fallback result
    return { 
      dateISO: format(fallbackDate, 'yyyy-MM-dd'), 
      weeks: 0 
    };
  }

  let d = startOfDay(startDateObj);
  const start = startOfDay(startDateObj);

  // safety cap: 5 years
  const safetyLimit = addYears(start, 5);

  while (total < goal && d < safetyLimit) {
    d = addDays(d, 1);

    // weekly reset (e.g., Thursday), don't grant at t0
    if (d.getDay() === weeklyResetDay) {
      if (!isSameDay(d, start)) {
        total += weeklyTotal;
      }
      weeks += 1;
    }

    // month change (1st)
    if (d.getDate() === 1 && !isSameDay(d, start)) {
      total += monthlyTotal;
    }
  }

  // Calculate precise weeks based on days elapsed
  const daysElapsed = Math.floor((d.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  const preciseWeeks = daysElapsed / 7;

  return { dateISO: format(d, 'yyyy-MM-dd'), weeks: preciseWeeks };
}
