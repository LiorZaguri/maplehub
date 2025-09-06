// Error handling utilities
export class AppError extends Error {
  constructor(
    message: string,
    public code?: string,
    public statusCode?: number
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export class ValidationError extends AppError {
  constructor(message: string, public field?: string) {
    super(message, 'VALIDATION_ERROR');
    this.name = 'ValidationError';
  }
}

export class NetworkError extends AppError {
  constructor(message: string, public statusCode: number) {
    super(message, 'NETWORK_ERROR', statusCode);
    this.name = 'NetworkError';
  }
}

export class DataError extends AppError {
  constructor(message: string) {
    super(message, 'DATA_ERROR');
    this.name = 'DataError';
  }
}

// Error handling wrapper
export async function withErrorHandling<T>(
  operation: () => Promise<T>,
  fallbackValue?: T
): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    console.error('Operation failed:', error);

    if (error instanceof AppError) {
      // Re-throw custom errors
      throw error;
    }

    // Wrap unknown errors
    if (error instanceof Error) {
      throw new AppError(error.message);
    }

    throw new AppError('An unknown error occurred');
  }
}

// Retry mechanism
export async function withRetry<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> {
  let lastError: Error;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;

      if (attempt === maxRetries) {
        break;
      }

      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delay * attempt));
    }
  }

  throw lastError!;
}

// Error boundary helper
export function handleAsyncError(error: unknown): string {
  if (error instanceof AppError) {
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'An unexpected error occurred';
}
