import Constants from 'expo-constants';

export type AppEnvironment = 'development' | 'staging' | 'production';

function resolveEnvironment(value: string | undefined): AppEnvironment {
  return value === 'staging' || value === 'production' ? value : 'development';
}

/**
 * Only `EXPO_PUBLIC_*` variables are inlined into the JS bundle, and only when
 * accessed as `process.env.EXPO_PUBLIC_NAME` (no destructuring).
 * Never put secrets in them — they ship to the client.
 */
const environment = resolveEnvironment(process.env.EXPO_PUBLIC_APP_ENV);

export const AppConfig = {
  name: Constants.expoConfig?.name ?? 'Imposter',
  version: Constants.expoConfig?.version ?? '0.0.0',
  environment,
  isDev: __DEV__,
  enableDebugLogs: __DEV__ || process.env.EXPO_PUBLIC_DEBUG_LOGS === 'true',
} as const;

/** Prefix for every persisted key, so app data never collides with other libraries. */
export const STORAGE_PREFIX = '@imposter';

export const StorageKeys = {
  settings: `${STORAGE_PREFIX}/settings`,
  gameSetup: `${STORAGE_PREFIX}/game-setup`,
  history: `${STORAGE_PREFIX}/history`,
} as const;

export type StorageKey = (typeof StorageKeys)[keyof typeof StorageKeys];
