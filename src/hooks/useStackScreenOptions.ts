import type { NativeStackNavigationOptions } from 'expo-router';

import { useTheme } from '@/hooks/useTheme';

/** Shared themed header/screen options for stack navigators with visible headers. */
export function useStackScreenOptions(): NativeStackNavigationOptions {
  const { colors } = useTheme();

  return {
    // SDK 58 makes iOS 26 headers transparent by default; keep a solid themed header.
    headerTransparent: false,
    headerShadowVisible: false,
    headerStyle: { backgroundColor: colors.background },
    headerTintColor: colors.text,
    headerTitleStyle: { fontWeight: '700' },
    headerBackButtonDisplayMode: 'minimal',
    contentStyle: { backgroundColor: colors.background },
  };
}
