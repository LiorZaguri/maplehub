import { useCallback, useEffect, useRef } from 'react';
import { useLocalStorage } from './useLocalStorage';

interface AutoRefreshConfig {
  onRefresh: () => Promise<void>;
  isEnabled?: boolean;
}

interface AutoRefreshState {
  lastVisitTimestamp: number;
  lastAutoRefreshHour: number | null;
  lastRefreshDone: number | null; // Timestamp when last refresh was actually performed
}

const RESET_HOURS = [18, 19, 20, 21]; // UTC hours for auto-refresh
const STORAGE_KEY = 'maplehub_auto_refresh_state';

export const useAutoRefresh = ({ onRefresh, isEnabled = true }: AutoRefreshConfig) => {
  const [autoRefreshState, setAutoRefreshState] = useLocalStorage<AutoRefreshState>(
    STORAGE_KEY,
    {
      lastVisitTimestamp: Date.now(),
      lastAutoRefreshHour: null,
      lastRefreshDone: null
    }
  );

  // Migrate old state structure to new one
  useEffect(() => {
    if (autoRefreshState && (autoRefreshState.lastRefreshDone === undefined)) {
      setAutoRefreshState(prev => ({
        ...prev,
        lastRefreshDone: null
      }));
    }
  }, [autoRefreshState, setAutoRefreshState]);

  const isRefreshingRef = useRef(false);
  const hasUpdatedTimestampRef = useRef(false);

  // Get current UTC hour
  const getCurrentUTCHour = useCallback(() => {
    return new Date().getUTCHours();
  }, []);

  // Check if current time is in reset hours
  const isInResetHours = useCallback(() => {
    const currentHour = getCurrentUTCHour();
    return RESET_HOURS.includes(currentHour);
  }, [getCurrentUTCHour]);

  // Check if refresh is needed
  const shouldRefresh = useCallback(() => {
    if (!isEnabled || isRefreshingRef.current) return false;

    const currentHour = getCurrentUTCHour();
    const lastRefreshHour = autoRefreshState.lastAutoRefreshHour;

    // If we already refreshed this hour, don't refresh again
    if (lastRefreshHour === currentHour) return false;

    // Check if lastRefreshDone falls within the no-refresh window (21:00 UTC to 18:00 UTC next day)
    if (autoRefreshState.lastRefreshDone !== null && autoRefreshState.lastRefreshDone !== undefined) {
      const lastRefreshDate = new Date(autoRefreshState.lastRefreshDone);
      const lastRefreshHour = lastRefreshDate.getUTCHours();
      
      // If lastRefreshDone was between 21:00 UTC and 23:59 UTC, or between 00:00 UTC and 17:59 UTC
      // (i.e., in the no-refresh window), don't auto-refresh
      if (lastRefreshHour >= 21 || lastRefreshHour < 18) {
        return false;
      }
    }

    // Check if we need to refresh based on lastRefreshDone
    const currentHourStart = new Date();
    currentHourStart.setUTCHours(currentHour, 0, 0, 0);
    const currentHourStartTime = currentHourStart.getTime();

    // If no refresh has been done yet, or last refresh was before current hour's reset
    const needsRefresh = autoRefreshState.lastRefreshDone === null || autoRefreshState.lastRefreshDone === undefined || autoRefreshState.lastRefreshDone < currentHourStartTime;

    // Allow refresh if:
    // 1. We're currently in reset hours, OR
    // 2. We're outside reset hours but missed a refresh (needsRefresh is true)
    const inResetHours = isInResetHours();
    const missedRefresh = !inResetHours && needsRefresh;

    return inResetHours || missedRefresh;
  }, [isEnabled, isInResetHours, getCurrentUTCHour, autoRefreshState.lastAutoRefreshHour, autoRefreshState.lastRefreshDone]);

  // Perform auto-refresh
  const performAutoRefresh = useCallback(async () => {
    if (!shouldRefresh()) return;

    try {
      isRefreshingRef.current = true;
      const currentHour = getCurrentUTCHour();
      const refreshTimestamp = Date.now();
      
      console.log('Auto-refresh starting, current hour:', currentHour);
      console.log('Auto-refresh state before:', autoRefreshState);
      
      // Update state before refresh to prevent duplicate refreshes
      setAutoRefreshState(prev => ({
        ...prev,
        lastAutoRefreshHour: currentHour
      }));

      console.log('Calling onRefresh...');
      await onRefresh();
      console.log('onRefresh completed successfully');

      // Update timestamps after successful refresh
      console.log('Updating auto-refresh state...');
      setAutoRefreshState(prev => ({
        ...prev,
        lastVisitTimestamp: refreshTimestamp,
        lastRefreshDone: refreshTimestamp
      }));
      console.log('Auto-refresh state updated successfully');

    } catch (error) {
      console.warn('Auto-refresh failed:', error);
      console.log('Auto-refresh failed, resetting lastAutoRefreshHour to null');
      // Reset the refresh hour on failure so it can be retried
      setAutoRefreshState(prev => ({
        ...prev,
        lastAutoRefreshHour: null
      }));
    } finally {
      isRefreshingRef.current = false;
    }
  }, [shouldRefresh, onRefresh, getCurrentUTCHour, setAutoRefreshState]);

  // Update last visit timestamp on mount only (once per session)
  useEffect(() => {
    if (isEnabled && !hasUpdatedTimestampRef.current) {
      hasUpdatedTimestampRef.current = true;
      setAutoRefreshState(prev => ({
        ...prev,
        lastVisitTimestamp: Date.now()
      }));
    }
  }, [isEnabled]);

  // Check for auto-refresh on mount
  useEffect(() => {
    if (isEnabled && shouldRefresh()) {
      performAutoRefresh();
    }
  }, [isEnabled, shouldRefresh, performAutoRefresh]);

  // Function to manually mark a refresh as completed
  const markRefreshCompleted = useCallback(() => {
    const currentHour = getCurrentUTCHour();
    const refreshTimestamp = Date.now();
    const inResetHours = isInResetHours();
    
    setAutoRefreshState(prev => ({
      ...prev,
      // Only set lastAutoRefreshHour if we're in reset hours
      // This prevents manual refreshes from interfering with auto-refresh logic
      lastAutoRefreshHour: inResetHours ? currentHour : prev.lastAutoRefreshHour,
      lastVisitTimestamp: refreshTimestamp,
      lastRefreshDone: refreshTimestamp
    }));
  }, [getCurrentUTCHour, setAutoRefreshState, isInResetHours]);

  return {
    shouldRefresh: shouldRefresh(),
    isInResetHours: isInResetHours(),
    currentUTCHour: getCurrentUTCHour(),
    lastVisitTimestamp: autoRefreshState.lastVisitTimestamp,
    lastAutoRefreshHour: autoRefreshState.lastAutoRefreshHour,
    lastRefreshDone: autoRefreshState.lastRefreshDone,
    markRefreshCompleted
  };
};
