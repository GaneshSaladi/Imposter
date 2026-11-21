export interface ValidationResult {
  valid: boolean;
  message?: string;
}

export const valid = (): ValidationResult => ({ valid: true });
export const invalid = (message: string): ValidationResult => ({ valid: false, message });

export function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function isOneOf<T extends string>(value: unknown, options: readonly T[]): value is T {
  return typeof value === 'string' && (options as readonly string[]).includes(value);
}

export function validateLength(
  value: string,
  { min = 0, max = Number.POSITIVE_INFINITY, label = 'Value' }: { min?: number; max?: number; label?: string },
): ValidationResult {
  const length = value.trim().length;
  if (length < min) return invalid(min === 1 ? `${label} is required` : `${label} must be at least ${min} characters`);
  if (length > max) return invalid(`${label} must be at most ${max} characters`);
  return valid();
}
