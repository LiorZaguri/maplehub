import { useState, useEffect, useCallback } from 'react';

type SetValue<T> = T | ((prevValue: T) => T);

export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: SetValue<T>) => void, () => void] {
  // Get from local storage then parse stored json or return initialValue
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  // Return a wrapped version of useState's setter function that persists the new value to localStorage
  const setValue = useCallback(
    (value: SetValue<T>) => {
      try {
        // Allow value to be a function so we have the same API as useState
        const valueToStore = value instanceof Function ? value(storedValue) : value;
        setStoredValue(valueToStore);
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      } catch (error) {
        console.error(`Error setting localStorage key "${key}":`, error);
      }
    },
    [key, storedValue]
  );

  // Remove from localStorage
  const removeValue = useCallback(() => {
    try {
      window.localStorage.removeItem(key);
      setStoredValue(initialValue);
    } catch (error) {
      console.error(`Error removing localStorage key "${key}":`, error);
    }
  }, [key, initialValue]);

  // Listen for changes to this key in other tabs/windows
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === key && e.newValue !== null) {
        try {
          setStoredValue(JSON.parse(e.newValue));
        } catch (error) {
          console.error(`Error parsing localStorage value for key "${key}":`, error);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [key]);

  return [storedValue, setValue, removeValue];
}

// Specialized hook for objects/maps
export function useLocalStorageObject<T extends Record<string, any>>(
  key: string,
  initialValue: T
): [T, (value: SetValue<T>) => void, (key: keyof T) => void, (key: keyof T, value: any) => void] {
  const [storedValue, setStoredValue, removeValue] = useLocalStorage(key, initialValue);

  const updateKey = useCallback(
    (objectKey: keyof T, value: any) => {
      setStoredValue(prev => ({
        ...prev,
        [objectKey]: value
      }));
    },
    [setStoredValue]
  );

  const removeKey = useCallback(
    (objectKey: keyof T) => {
      setStoredValue(prev => {
        const newValue = { ...prev };
        delete newValue[objectKey];
        return newValue;
      });
    },
    [setStoredValue]
  );

  return [storedValue, setStoredValue, removeKey, updateKey];
}

// Specialized hook for arrays
export function useLocalStorageArray<T>(
  key: string,
  initialValue: T[] = []
): [T[], (value: SetValue<T[]>) => void, (item: T) => void, (index: number) => void, (index: number, item: T) => void] {
  const [storedValue, setStoredValue, removeValue] = useLocalStorage(key, initialValue);

  const addItem = useCallback(
    (item: T) => {
      setStoredValue(prev => [...prev, item]);
    },
    [setStoredValue]
  );

  const removeItem = useCallback(
    (index: number) => {
      setStoredValue(prev => prev.filter((_, i) => i !== index));
    },
    [setStoredValue]
  );

  const updateItem = useCallback(
    (index: number, item: T) => {
      setStoredValue(prev => prev.map((existingItem, i) => i === index ? item : existingItem));
    },
    [setStoredValue]
  );

  return [storedValue, setStoredValue, addItem, removeItem, updateItem];
}
