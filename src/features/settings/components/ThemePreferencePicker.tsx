import { StyleSheet, View } from 'react-native';

import { AppPressable, AppText } from '@/components';
import { Layout } from '@/constants/dimensions';
import { THEME_PREFERENCES, type ThemePreference } from '@/features/settings/types';
import { useTheme } from '@/hooks/useTheme';
import { useSettingsStore } from '@/store';

const LABELS: Record<ThemePreference, string> = {
  system: 'System',
  light: 'Light',
  dark: 'Dark',
};

/** Segmented control for the app color scheme. */
export function ThemePreferencePicker() {
  const { colors, radius, spacing } = useTheme();
  const preference = useSettingsStore((s) => s.themePreference);
  const setThemePreference = useSettingsStore((s) => s.setThemePreference);

  return (
    <View
      accessibilityRole="radiogroup"
      style={[styles.track, { backgroundColor: colors.secondary, borderRadius: radius.lg, padding: spacing.xs }]}>
      {THEME_PREFERENCES.map((option) => {
        const selected = option === preference;
        return (
          <AppPressable
            key={option}
            feedback="selection"
            debounceMs={0}
            accessibilityRole="radio"
            accessibilityState={{ selected }}
            onPress={() => setThemePreference(option)}
            containerStyle={styles.optionContainer}
            style={[styles.option, { borderRadius: radius.md }, selected && { backgroundColor: colors.surface }]}>
            <AppText variant="bodyStrong" color={selected ? 'accent' : 'onSecondary'}>
              {LABELS[option]}
            </AppText>
          </AppPressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    flexDirection: 'row',
  },
  optionContainer: {
    flex: 1,
  },
  option: {
    minHeight: Layout.minTouchTarget - 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
