import { ChevronRight, type LucideIcon } from 'lucide-react-native';
import { StyleSheet, View } from 'react-native';

import { AppPressable, AppText } from '@/components';
import { Layout } from '@/constants/dimensions';
import { useTheme } from '@/hooks/useTheme';

interface SettingsLinkRowProps {
  label: string;
  /** Current value summary, e.g. "4 of 12 selected". */
  detail?: string;
  icon: LucideIcon;
  onPress: () => void;
}

/** Settings row that opens a sub-screen. */
export function SettingsLinkRow({ label, detail, icon: Icon, onPress }: SettingsLinkRowProps) {
  const { colors, radius, spacing } = useTheme();

  return (
    <AppPressable
      onPress={onPress}
      pressedScale={0.98}
      accessibilityRole="button"
      accessibilityLabel={detail ? `${label}, ${detail}` : label}
      style={({ pressed }) => [
        styles.row,
        {
          gap: spacing.md,
          paddingHorizontal: spacing.sm,
          borderRadius: radius.md,
          backgroundColor: pressed ? colors.secondary : 'transparent',
        },
      ]}>
      <View style={[styles.icon, { borderRadius: radius.md, backgroundColor: colors.secondary }]}>
        <Icon size={20} color={colors.accent} strokeWidth={2.3} />
      </View>
      <View style={styles.text}>
        <AppText variant="bodyStrong">{label}</AppText>
        {detail ? (
          <AppText variant="caption" color="textMuted">
            {detail}
          </AppText>
        ) : null}
      </View>
      <ChevronRight size={20} color={colors.textMuted} />
    </AppPressable>
  );
}

const styles = StyleSheet.create({
  row: {
    minHeight: Layout.minTouchTarget + 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    flex: 1,
  },
});
