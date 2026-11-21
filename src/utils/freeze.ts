/**
 * Recursively freezes plain objects/arrays so state can't be mutated by
 * accident. Already-frozen branches are skipped, so re-freezing a new state
 * that shares frozen children is cheap.
 */
export function deepFreeze<T>(value: T): T {
  if (value !== null && typeof value === 'object' && !Object.isFrozen(value)) {
    Object.freeze(value);
    for (const key of Object.keys(value)) {
      deepFreeze((value as Record<string, unknown>)[key]);
    }
  }
  return value;
}
