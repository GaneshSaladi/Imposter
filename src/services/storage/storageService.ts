import AsyncStorage from '@react-native-async-storage/async-storage';
import { createJSONStorage } from 'zustand/middleware';

import { STORAGE_PREFIX, type StorageKey } from '@/constants/config';
import { logError } from '@/utils/errors';

type TypeGuard<T> = (value: unknown) => value is T;

/**
 * Thin JSON wrapper around AsyncStorage. All methods swallow storage failures
 * (logging them) so a corrupt or unavailable store never crashes the app.
 */
export const storageService = {
  /**
   * Reads and parses a value. Pass a type guard to validate the stored shape;
   * without one the parsed value is trusted as `T`.
   */
  async get<T>(key: StorageKey, guard?: TypeGuard<T>): Promise<T | null> {
    try {
      const raw = await AsyncStorage.getItem(key);
      if (raw === null) return null;
      const parsed: unknown = JSON.parse(raw);
      if (guard && !guard(parsed)) return null;
      return parsed as T;
    } catch (error) {
      logError(error, `storage.get(${key})`);
      return null;
    }
  },

  async set<T>(key: StorageKey, value: T): Promise<boolean> {
    try {
      await AsyncStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      logError(error, `storage.set(${key})`);
      return false;
    }
  },

  async remove(key: StorageKey): Promise<boolean> {
    try {
      await AsyncStorage.removeItem(key);
      return true;
    } catch (error) {
      logError(error, `storage.remove(${key})`);
      return false;
    }
  },

  /** Removes only this app's keys (those with the app prefix). */
  async clearAppData(): Promise<boolean> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const appKeys = keys.filter((key) => key.startsWith(STORAGE_PREFIX));
      if (appKeys.length > 0) await AsyncStorage.multiRemove(appKeys);
      return true;
    } catch (error) {
      logError(error, 'storage.clearAppData');
      return false;
    }
  },
};

/** Storage adapter for Zustand's `persist` middleware. */
export const zustandStorage = createJSONStorage(() => AsyncStorage);
