import type { ColorScheme } from '@/types/common';

export type ThemePreference = ColorScheme | 'system';

export const THEME_PREFERENCES: readonly ThemePreference[] = ['system', 'light', 'dark'];

export interface SettingsState {
  themePreference: ThemePreference;
  soundEffectsEnabled: boolean;
  musicEnabled: boolean;
  hapticsEnabled: boolean;
  hasCompletedOnboarding: boolean;
}
