// Data validation utilities
import { ValidationError } from './errorHandling';

export interface ValidationRule<T> {
  validate: (value: T) => boolean;
  message: string;
}

export interface ValidationSchema<T> {
  [key: string]: ValidationRule<any>[];
}

// Generic validation function
export function validateField<T>(
  value: T,
  rules: ValidationRule<T>[]
): string[] {
  const errors: string[] = [];

  for (const rule of rules) {
    if (!rule.validate(value)) {
      errors.push(rule.message);
    }
  }

  return errors;
}

// Validate entire object against schema
export function validateObject<T extends Record<string, any>>(
  data: T,
  schema: ValidationSchema<T>
): Record<string, string[]> {
  const errors: Record<string, string[]> = {};

  for (const [field, rules] of Object.entries(schema)) {
    const fieldErrors = validateField(data[field], rules);
    if (fieldErrors.length > 0) {
      errors[field] = fieldErrors;
    }
  }

  return errors;
}

// Throw validation error if validation fails
export function validateAndThrow<T extends Record<string, any>>(
  data: T,
  schema: ValidationSchema<T>
): void {
  const errors = validateObject(data, schema);

  if (Object.keys(errors).length > 0) {
    const firstField = Object.keys(errors)[0];
    const firstError = errors[firstField][0];
    throw new ValidationError(`${firstField}: ${firstError}`, firstField);
  }
}

// Common validation rules
export const commonRules = {
  required: <T>(message = 'This field is required'): ValidationRule<T> => ({
    validate: (value: T) => value !== null && value !== undefined && value !== '',
    message,
  }),

  minLength: (min: number, message?: string): ValidationRule<string> => ({
    validate: (value: string) => value.length >= min,
    message: message || `Must be at least ${min} characters long`,
  }),

  maxLength: (max: number, message?: string): ValidationRule<string> => ({
    validate: (value: string) => value.length <= max,
    message: message || `Must be no more than ${max} characters long`,
  }),

  pattern: (regex: RegExp, message: string): ValidationRule<string> => ({
    validate: (value: string) => regex.test(value),
    message,
  }),

  email: (message = 'Invalid email format'): ValidationRule<string> => ({
    validate: (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
    message,
  }),

  min: (min: number, message?: string): ValidationRule<number> => ({
    validate: (value: number) => value >= min,
    message: message || `Must be at least ${min}`,
  }),

  max: (max: number, message?: string): ValidationRule<number> => ({
    validate: (value: number) => value <= max,
    message: message || `Must be no more than ${max}`,
  }),

  oneOf: <T>(options: T[], message?: string): ValidationRule<T> => ({
    validate: (value: T) => options.includes(value),
    message: message || `Must be one of: ${options.join(', ')}`,
  }),
};

// Character validation schema
export const characterValidationSchema = {
  name: [
    commonRules.required<string>('Character name is required'),
    commonRules.minLength(1, 'Character name cannot be empty'),
    commonRules.maxLength(50, 'Character name is too long'),
  ],
  class: [
    commonRules.required<string>('Character class is required'),
    commonRules.minLength(1, 'Character class cannot be empty'),
  ],
  level: [
    commonRules.required<number>('Character level is required'),
    commonRules.min(1, 'Level must be at least 1'),
    commonRules.max(300, 'Level cannot exceed 300'),
  ],
};

// Task validation schema
export const taskValidationSchema = {
  name: [
    commonRules.required<string>('Task name is required'),
    commonRules.minLength(1, 'Task name cannot be empty'),
    commonRules.maxLength(100, 'Task name is too long'),
  ],
  character: [
    commonRules.required<string>('Character is required'),
  ],
  frequency: [
    commonRules.required<string>('Frequency is required'),
    commonRules.oneOf(['daily', 'weekly', 'monthly'], 'Invalid frequency'),
  ],
  category: [
    commonRules.required<string>('Category is required'),
  ],
};

// Boss validation schema
export const bossValidationSchema = {
  name: [
    commonRules.required<string>('Boss name is required'),
    commonRules.minLength(1, 'Boss name cannot be empty'),
  ],
  difficulty: [
    commonRules.required<string>('Difficulty is required'),
    commonRules.oneOf(['easy', 'normal', 'hard', 'chaos', 'extreme'], 'Invalid difficulty'),
  ],
  level: [
    commonRules.required<number>('Level is required'),
    commonRules.min(1, 'Level must be at least 1'),
  ],
};
