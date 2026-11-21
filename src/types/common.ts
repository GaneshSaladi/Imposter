export type ColorScheme = 'light' | 'dark';

export type Nullable<T> = T | null;

export type ValueOf<T> = T[keyof T];

/** Unique identifier for persisted entities. */
export type EntityId = string;

/**
 * Discriminated result for operations that can fail without throwing.
 * Use with `tryAsync()` from `@/utils/errors`.
 */
export type Result<T, E = Error> = { ok: true; value: T } | { ok: false; error: E };

/** Normalized permission state shared by all permission-based services. */
export type PermissionState = 'granted' | 'denied' | 'blocked' | 'undetermined' | 'unavailable';
