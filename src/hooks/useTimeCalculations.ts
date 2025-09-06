import { useState, useEffect, useMemo } from 'react';

export interface TimeCalculationOptions {
  updateInterval?: number; // in milliseconds
}

export function useTimeCalculations(options: TimeCalculationOptions = {}) {
  const { updateInterval = 1000 } = options; // Default to 1 second updates

  const [currentTime, setCurrentTime] = useState(new Date());

  // Update current time at specified interval
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, updateInterval);

    return () => clearInterval(interval);
  }, [updateInterval]);

  // Calculate time until next reset (daily, weekly, monthly)
  const getTimeUntilReset = useMemo(() => {
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

    return {
      daily: calculateDailyReset(utcNow),
      weekly: calculateWeeklyReset(utcNow),
      monthly: calculateMonthlyReset(utcNow)
    };
  }, [currentTime]);

  // Format time remaining as human-readable string
  const formatTimeRemaining = (seconds: number, frequency?: 'daily' | 'weekly' | 'monthly'): string => {
    if (seconds <= 0) return '00h 00m 00s';

    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;

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
  };

  // Format time remaining with days/hours/minutes
  const formatTimeDetailed = (seconds: number): string => {
    if (seconds <= 0) return 'Now';

    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    const parts: string[] = [];
    if (days > 0) parts.push(`${days}d`);
    if (hours > 0) parts.push(`${hours}h`);
    if (minutes > 0) parts.push(`${minutes}m`);

    return parts.join(' ') || '< 1m';
  };

  // Check if Ursus golden time is active
  const isUrsusGoldenTime = useMemo(() => {
    const utcHour = currentTime.getUTCHours();
    return (utcHour >= 1 && utcHour < 3) || (utcHour >= 18 && utcHour < 20);
  }, [currentTime]);

  // Get Ursus golden time remaining
  const getUrsusGoldenTimeRemaining = useMemo(() => {
    if (!isUrsusGoldenTime) return null;

    const now = new Date();
    const utcHour = now.getUTCHours();
    const utcMinute = now.getUTCMinutes();
    const utcSecond = now.getUTCSeconds();

    let endHour: number;
    if (utcHour >= 1 && utcHour < 3) {
      endHour = 3;
    } else if (utcHour >= 18 && utcHour < 20) {
      endHour = 20;
    } else {
      return null;
    }

    const nowSeconds = utcHour * 3600 + utcMinute * 60 + utcSecond;
    const endSeconds = endHour * 3600;
    const remainingSeconds = endSeconds - nowSeconds;

    return Math.max(0, remainingSeconds);
  }, [currentTime, isUrsusGoldenTime]);

  // Get next Ursus golden time
  const getNextUrsusGoldenTime = useMemo(() => {
    const now = new Date();
    const utcHour = now.getUTCHours();

    if (utcHour < 1) {
      const nextTime = new Date(now);
      nextTime.setUTCHours(1, 0, 0, 0);
      return nextTime;
    } else if (utcHour < 3) {
      return null; // Currently in first window
    } else if (utcHour < 18) {
      const nextTime = new Date(now);
      nextTime.setUTCHours(18, 0, 0, 0);
      return nextTime;
    } else if (utcHour < 20) {
      return null; // Currently in second window
    } else {
      const nextTime = new Date(now);
      nextTime.setUTCDate(nextTime.getUTCDate() + 1);
      nextTime.setUTCHours(1, 0, 0, 0);
      return nextTime;
    }
  }, [currentTime]);

  return {
    currentTime,
    getTimeUntilReset,
    formatTimeRemaining,
    formatTimeDetailed,
    isUrsusGoldenTime,
    getUrsusGoldenTimeRemaining,
    getNextUrsusGoldenTime,
  };
}

// Helper functions for time calculations
function calculateDailyReset(utcNow: Date): number {
  const nextReset = new Date(utcNow);
  nextReset.setUTCDate(nextReset.getUTCDate() + 1);
  nextReset.setUTCHours(0, 0, 0, 0);
  const timeDiff = nextReset.getTime() - utcNow.getTime();
  return Math.max(0, Math.floor(timeDiff / 1000));
}

function calculateWeeklyReset(utcNow: Date): number {
  const currentDay = utcNow.getUTCDay();
  let daysUntilReset = 0;

  if (currentDay < 4) {
    daysUntilReset = 4 - currentDay;
  } else if (currentDay === 4) {
    daysUntilReset = 7;
  } else {
    daysUntilReset = 4 + (7 - currentDay);
  }

  const nextReset = new Date(utcNow);
  nextReset.setUTCDate(nextReset.getUTCDate() + daysUntilReset);
  nextReset.setUTCHours(0, 0, 0, 0);
  const timeDiff = nextReset.getTime() - utcNow.getTime();
  return Math.max(0, Math.floor(timeDiff / 1000));
}

function calculateMonthlyReset(utcNow: Date): number {
  const currentDay = utcNow.getUTCDate();
  const currentMonth = utcNow.getUTCMonth();
  const currentYear = utcNow.getUTCFullYear();
  const lastDayOfMonth = new Date(Date.UTC(currentYear, currentMonth + 1, 0)).getDate();

  let resetDate: Date;
  if (currentDay === lastDayOfMonth) {
    resetDate = new Date(Date.UTC(currentYear, currentMonth + 1, 1));
  } else if (currentDay >= lastDayOfMonth) {
    resetDate = new Date(Date.UTC(currentYear, currentMonth + 1, 1));
  } else {
    resetDate = new Date(Date.UTC(currentYear, currentMonth, lastDayOfMonth));
  }

  resetDate.setUTCHours(23, 59, 59, 999);
  const timeDiff = resetDate.getTime() - utcNow.getTime();
  return Math.max(0, Math.floor(timeDiff / 1000));
}
