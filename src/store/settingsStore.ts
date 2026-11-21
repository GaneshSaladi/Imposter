import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { StorageKeys } from '@/constants/config';
import { THEME_PREFERENCES, type SettingsState, type ThemePreference } from '@/features/settings/types';
import { zustandStorage } from '@/services/storage/storageService';
import { isOneOf, isRecord } from '@/utils/validators';

interface SettingsActions {
  setThemePreference: (preference: ThemePreference) => void;
  setSoundEffectsEnabled: (enabled: boolean) => void;
  setMusicEnabled: (enabled: boolean) => void;
  setHapticsEnabled: (enabled: boolean) => void;
  completeOnboarding: () => void;
  resetSettings: () => void;
}

export type SettingsStore = SettingsState & SettingsActions;

const initialSettings: SettingsState = {
  // The game's signature look is dark; light/system remain available in Settings.
  themePreference: 'dark',
  soundEffectsEnabled: true,
  musicEnabled: true,
  hapticsEnabled: true,
  hasCompletedOnboarding: false,
};

const SETTINGS_VERSION = 2;

function readBoolean(value: unknown, fallback: boolean): boolean {
  return typeof value === 'boolean' ? value : fallback;
}

/** Validates persisted data and upgrades older versions. */
function migrateSettings(persisted: unknown, version: number): SettingsState {
  const raw = isRecord(persisted) ? persisted : {};
  let themePreference = isOneOf(raw.themePreference, THEME_PREFERENCES)
    ? raw.themePreference
    : initialSettings.themePreference;
  // v1 defaulted to 'system'; v2 makes the branded dark theme the default.
  if (version < 2 && themePreference === 'system') themePreference = 'dark';

  return {
    themePreference,
    soundEffectsEnabled: readBoolean(raw.soundEffectsEnabled, initialSettings.soundEffectsEnabled),
    musicEnabled: readBoolean(raw.musicEnabled, initialSettings.musicEnabled),
    hapticsEnabled: readBoolean(raw.hapticsEnabled, initialSettings.hapticsEnabled),
    hasCompletedOnboarding: readBoolean(raw.hasCompletedOnboarding, initialSettings.hasCompletedOnboarding),
  };
}

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      ...initialSettings,
      setThemePreference: (themePreference) => set({ themePreference }),
      setSoundEffectsEnabled: (soundEffectsEnabled) => set({ soundEffectsEnabled }),
      setMusicEnabled: (musicEnabled) => set({ musicEnabled }),
      setHapticsEnabled: (hapticsEnabled) => set({ hapticsEnabled }),
      completeOnboarding: () => set({ hasCompletedOnboarding: true }),
      resetSettings: () => set(initialSettings),
    }),
    {
      name: StorageKeys.settings,
      storage: zustandStorage,
      version: SETTINGS_VERSION,
      migrate: migrateSettings,
      // Persist data only, never actions.
      partialize: (state): SettingsState => ({
        themePreference: state.themePreference,
        soundEffectsEnabled: state.soundEffectsEnabled,
        musicEnabled: state.musicEnabled,
        hapticsEnabled: state.hapticsEnabled,
        hasCompletedOnboarding: state.hasCompletedOnboarding,
      }),
    },
  ),
);
