/**
 * Generic typed localStorage utility
 * Provides type-safe localStorage operations with error handling
 */

export interface StorageConfig<T> {
  key: string;
  defaultValue: T;
  serializer?: {
    stringify: (value: T) => string;
    parse: (value: string) => T;
  };
}

/**
 * Generic storage utility class for type-safe localStorage operations
 */
export class TypedStorage<T> {
  private config: StorageConfig<T>;

  constructor(config: StorageConfig<T>) {
    this.config = {
      serializer: {
        stringify: JSON.stringify,
        parse: JSON.parse,
      },
      ...config,
    };
  }

  /**
   * Load value from localStorage
   */
  load(): T {
    try {
      const stored = localStorage.getItem(this.config.key);
      if (stored === null) {
        return this.config.defaultValue;
      }
      return this.config.serializer!.parse(stored);
    } catch (error) {
      console.warn(`Failed to load ${this.config.key} from localStorage:`, error);
      return this.config.defaultValue;
    }
  }

  /**
   * Save value to localStorage
   */
  save(value: T): void {
    try {
      const serialized = this.config.serializer!.stringify(value);
      localStorage.setItem(this.config.key, serialized);
    } catch (error) {
      console.warn(`Failed to save ${this.config.key} to localStorage:`, error);
    }
  }

  /**
   * Remove value from localStorage
   */
  remove(): void {
    try {
      localStorage.removeItem(this.config.key);
    } catch (error) {
      console.warn(`Failed to remove ${this.config.key} from localStorage:`, error);
    }
  }

  /**
   * Check if key exists in localStorage
   */
  exists(): boolean {
    return localStorage.getItem(this.config.key) !== null;
  }
}

/**
 * Create a typed storage instance
 */
export function createStorage<T>(config: StorageConfig<T>): TypedStorage<T> {
  return new TypedStorage(config);
}

/**
 * Convenience function for simple string storage
 */
export function createStringStorage(key: string, defaultValue = ''): TypedStorage<string> {
  return createStorage({
    key,
    defaultValue,
    serializer: {
      stringify: (value: string) => value,
      parse: (value: string) => value,
    },
  });
}

/**
 * Convenience function for number storage
 */
export function createNumberStorage(key: string, defaultValue = 0): TypedStorage<number> {
  return createStorage({
    key,
    defaultValue,
    serializer: {
      stringify: (value: number) => value.toString(),
      parse: (value: string) => parseInt(value, 10),
    },
  });
}

/**
 * Convenience function for boolean storage
 */
export function createBooleanStorage(key: string, defaultValue = false): TypedStorage<boolean> {
  return createStorage({
    key,
    defaultValue,
    serializer: {
      stringify: (value: boolean) => value.toString(),
      parse: (value: string) => value === 'true',
    },
  });
}

/**
 * Convenience function for array storage
 */
export function createArrayStorage<T>(key: string, defaultValue: T[] = []): TypedStorage<T[]> {
  return createStorage({
    key,
    defaultValue,
  });
}

/**
 * Convenience function for object storage
 */
export function createObjectStorage<T extends Record<string, any>>(
  key: string, 
  defaultValue: T
): TypedStorage<T> {
  return createStorage({
    key,
    defaultValue,
  });
}
