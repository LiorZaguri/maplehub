import { TIME_CONSTANTS } from '@/constants/taskTracker';

/**
 * Calculate time remaining until next reset
 */
export function getTimeUntilReset(frequency: 'daily' | 'weekly' | 'monthly'): number {
  const now = new Date();
  // Use UTC time directly instead of converting local time to UTC
  const utcNow = new Date(Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate(),
    now.getUTCHours(),
    now.getUTCMinutes(),
    now.getUTCSeconds(),
    now.getUTCMilliseconds()
  ));

  if (frequency === 'daily') {
    // Daily reset at UTC midnight
    const nextReset = new Date(utcNow);
    nextReset.setUTCDate(nextReset.getUTCDate() + 1);
    nextReset.setUTCHours(TIME_CONSTANTS.UTC_DAILY_RESET_HOUR, 0, 0, 0);
    const timeDiff = nextReset.getTime() - utcNow.getTime();
    return Math.max(0, Math.floor(timeDiff / 1000));
  } else if (frequency === 'weekly') {
    // Weekly reset Wednesday to Thursday at UTC
    const currentDay = utcNow.getUTCDay();
    let daysUntilReset = 0;

    if (currentDay < TIME_CONSTANTS.UTC_WEEKLY_RESET_DAY) {
      // Before Wednesday, reset is this Wednesday
      daysUntilReset = TIME_CONSTANTS.UTC_WEEKLY_RESET_DAY - currentDay;
    } else if (currentDay === TIME_CONSTANTS.UTC_WEEKLY_RESET_DAY) {
      // It's Wednesday, check if before midnight
      if (utcNow.getUTCHours() < TIME_CONSTANTS.HOURS_PER_DAY) {
        daysUntilReset = 0; // Reset today
      } else {
        daysUntilReset = 7; // Next Wednesday
      }
    } else if (currentDay === TIME_CONSTANTS.UTC_WEEKLY_RESET_DAY + 1) {
      // It's Thursday, reset was yesterday
      daysUntilReset = 6; // Next Wednesday
    } else {
      // Friday, Saturday, Sunday, Monday, Tuesday
      daysUntilReset = TIME_CONSTANTS.UTC_WEEKLY_RESET_DAY + (7 - currentDay);
    }

    // Calculate total seconds until reset
    const nextReset = new Date(utcNow);
    nextReset.setUTCDate(nextReset.getUTCDate() + daysUntilReset);
    nextReset.setUTCHours(TIME_CONSTANTS.UTC_DAILY_RESET_HOUR, 0, 0, 0);
    const timeDiff = nextReset.getTime() - utcNow.getTime();
    return Math.max(0, Math.floor(timeDiff / 1000));
  } else if (frequency === 'monthly') {
    // Monthly reset: last day of month to 1st of next month at UTC+0
    const currentYear = utcNow.getUTCFullYear();
    const currentMonth = utcNow.getUTCMonth();
    const lastDayOfMonth = new Date(Date.UTC(currentYear, currentMonth + 1, 0, 23, 59, 59, 999));

    if (utcNow.getTime() <= lastDayOfMonth.getTime()) {
      // Still in current month, reset at end of month
      const timeDiff = lastDayOfMonth.getTime() - utcNow.getTime();
      return Math.max(0, Math.floor(timeDiff / 1000));
    } else {
      // Already past end of month, calculate to end of next month
      const nextMonth = currentMonth + 1;
      const nextYear = nextMonth > 11 ? currentYear + 1 : currentYear;
      const actualNextMonth = nextMonth > 11 ? 0 : nextMonth;
      const lastDayOfNextMonth = new Date(Date.UTC(nextYear, actualNextMonth + 1, 0, 23, 59, 59, 999));
      const timeDiff = lastDayOfNextMonth.getTime() - utcNow.getTime();
      return Math.max(0, Math.floor(timeDiff / 1000));
    }
  }

  return 0;
}

/**
 * Format time remaining as human-readable string
 */
export function formatTimeRemaining(seconds: number, frequency?: 'daily' | 'weekly' | 'monthly'): string {
  if (seconds <= 0) return '00h 00m 00s';

  const days = Math.floor(seconds / (TIME_CONSTANTS.SECONDS_PER_MINUTE * TIME_CONSTANTS.MINUTES_PER_HOUR * TIME_CONSTANTS.HOURS_PER_DAY));
  const hours = Math.floor((seconds % (TIME_CONSTANTS.SECONDS_PER_MINUTE * TIME_CONSTANTS.MINUTES_PER_HOUR * TIME_CONSTANTS.HOURS_PER_DAY)) / (TIME_CONSTANTS.SECONDS_PER_MINUTE * TIME_CONSTANTS.MINUTES_PER_HOUR));
  const minutes = Math.floor((seconds % (TIME_CONSTANTS.SECONDS_PER_MINUTE * TIME_CONSTANTS.MINUTES_PER_HOUR)) / TIME_CONSTANTS.SECONDS_PER_MINUTE);
  const remainingSeconds = seconds % TIME_CONSTANTS.SECONDS_PER_MINUTE;

  // For weekly and monthly, show days, hours, minutes
  if (frequency === 'weekly' || frequency === 'monthly') {
    const parts: string[] = [];
    if (days > 0) parts.push(`${days}d`);
    if (hours > 0) parts.push(`${hours}h`);
    if (minutes > 0) parts.push(`${minutes}m`);
    return parts.join(' ') || '0m';
  }

  // For daily (and default), show hours, minutes, seconds
  if (hours > 0) {
    return `${hours}h ${minutes}m ${remainingSeconds}s`;
  } else {
    return `${minutes}m ${remainingSeconds}s`;
  }
}

/**
 * Format time remaining with days/hours/minutes
 */
export function formatTimeDetailed(seconds: number): string {
  if (seconds <= 0) return 'Now';

  const days = Math.floor(seconds / (TIME_CONSTANTS.SECONDS_PER_MINUTE * TIME_CONSTANTS.MINUTES_PER_HOUR * TIME_CONSTANTS.HOURS_PER_DAY));
  const hours = Math.floor((seconds % (TIME_CONSTANTS.SECONDS_PER_MINUTE * TIME_CONSTANTS.MINUTES_PER_HOUR * TIME_CONSTANTS.HOURS_PER_DAY)) / (TIME_CONSTANTS.SECONDS_PER_MINUTE * TIME_CONSTANTS.MINUTES_PER_HOUR));
  const minutes = Math.floor((seconds % (TIME_CONSTANTS.SECONDS_PER_MINUTE * TIME_CONSTANTS.MINUTES_PER_HOUR)) / TIME_CONSTANTS.SECONDS_PER_MINUTE);

  const parts: string[] = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);

  return parts.join(' ') || '< 1m';
}

/**
 * Check if current time is Ursus golden time
 */
export function isUrsusGoldenTime(): boolean {
  const now = new Date();
  const utcHour = now.getUTCHours();
  return (utcHour >= 1 && utcHour < 3) || (utcHour >= 18 && utcHour <= 20);
}

/**
 * Get remaining time until Ursus golden time ends
 */
export function getUrsusGoldenTimeRemaining(): number | null {
  if (!isUrsusGoldenTime()) return null;

  const now = new Date();
  const utcHour = now.getUTCHours();
  const utcMinute = now.getUTCMinutes();
  const utcSecond = now.getUTCSeconds();

  let endHour: number;
  if (utcHour >= 1 && utcHour < 3) {
    endHour = 3;
  } else if (utcHour >= 18 && utcHour <= 20) {
    endHour = 21; // End at 9:00 PM to include full 8:00 PM hour
  } else {
    return null;
  }

  const nowSeconds = utcHour * 3600 + utcMinute * TIME_CONSTANTS.SECONDS_PER_MINUTE + utcSecond;
  const endSeconds = endHour * 3600;
  const remainingSeconds = endSeconds - nowSeconds;

  return Math.max(0, remainingSeconds);
}

/**
 * Get next Ursus golden time
 */
export function getNextUrsusGoldenTime(): Date | null {
  const now = new Date();
  const utcHour = now.getUTCHours();

  if (utcHour < 1) {
    // Next golden time is 1:00 AM today
    const nextTime = new Date(now);
    nextTime.setUTCHours(1, 0, 0, 0);
    return nextTime;
  } else if (utcHour < 3) {
    // Currently in first golden time window
    return null; // Currently active
  } else if (utcHour < 18) {
    // Next golden time is 6:00 PM today
    const nextTime = new Date(now);
    nextTime.setUTCHours(18, 0, 0, 0);
    return nextTime;
  } else if (utcHour <= 20) {
    // Currently in second golden time window (including 8:00 PM)
    return null; // Currently active
  } else {
    // Next golden time is 1:00 AM tomorrow
    const nextTime = new Date(now);
    nextTime.setUTCDate(nextTime.getUTCDate() + 1);
    nextTime.setUTCHours(1, 0, 0, 0);
    return nextTime;
  }
}

/**
 * Format golden time remaining
 */
export function formatGoldenTimeRemaining(): string {
  const nextTime = getNextUrsusGoldenTime();
  if (!nextTime) return 'Active Now! 🔥';

  const now = new Date();
  const utcNow = new Date(Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate(),
    now.getUTCHours(),
    now.getUTCMinutes(),
    now.getUTCSeconds(),
    now.getUTCMilliseconds()
  ));

  const timeDiff = nextTime.getTime() - utcNow.getTime();
  const hours = Math.floor(timeDiff / (1000 * TIME_CONSTANTS.SECONDS_PER_MINUTE * TIME_CONSTANTS.MINUTES_PER_HOUR));
  const minutes = Math.floor((timeDiff % (1000 * TIME_CONSTANTS.SECONDS_PER_MINUTE * TIME_CONSTANTS.MINUTES_PER_HOUR)) / (1000 * TIME_CONSTANTS.SECONDS_PER_MINUTE));
  const seconds = Math.floor((timeDiff % (1000 * TIME_CONSTANTS.SECONDS_PER_MINUTE)) / 1000);

  if (hours > 0) {
    if (minutes === 0 && seconds === 0) return `${hours}h`;
    if (minutes === 0) return `${hours}h ${seconds}s`;
    if (seconds === 0) return `${hours}h ${minutes}m`;
    return `${hours}h ${minutes}m ${seconds}s`;
  } else if (minutes > 0) {
    if (seconds === 0) return `${minutes}m`;
    return `${minutes}m ${seconds}s`;
  } else {
    return `${seconds}s`;
  }
}
