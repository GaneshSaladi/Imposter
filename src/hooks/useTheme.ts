import { useColorScheme } from '@/hooks/useColorScheme';
import { useSettingsStore } from '@/store/settingsStore';
import { themes, type AppTheme } from '@/theme';

/**
 * Returns the active theme: the user's saved preference, or the
 * system scheme when the preference is 'system'.
 */
export function useTheme(): AppTheme {
  const preference = useSettingsStore((state) => state.themePreference);
  const systemScheme = useColorScheme();

  if (preference !== 'system') return themes[preference];
  return themes[systemScheme === 'dark' ? 'dark' : 'light'];
}
