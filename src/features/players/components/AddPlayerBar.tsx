import { CircleCheck, UserPlus } from 'lucide-react-native';
import { StyleSheet, View } from 'react-native';

import { AppPressable, AppText } from '@/components';
import { useTheme } from '@/hooks/useTheme';
import { pluralize } from '@/utils/helpers';

interface AddPlayerBarProps {
  remainingSlots: number;
  onPress: () => void;
}

export function AddPlayerBar({ remainingSlots, onPress }: AddPlayerBarProps) {
  const { colors, radius, spacing } = useTheme();
  const full = remainingSlots === 0;

  return (
    <AppPressable
      onPress={onPress}
      disabled={full}
      accessibilityRole="button"
      accessibilityLabel={full ? 'All players added' : 'Add player'}
      accessibilityState={{ disabled: full }}
      style={({ pressed }) => [
        styles.bar,
        {
          gap: spacing.md,
          paddingHorizontal: spacing.lg,
          borderRadius: radius.lg,
          borderColor: full ? colors.border : colors.primary,
          borderStyle: full ? 'solid' : 'dashed',
          backgroundColor: pressed ? colors.secondaryPressed : full ? colors.surface : colors.secondary,
        },
      ]}>
      {full ? (
        <CircleCheck size={24} color={colors.success} strokeWidth={2.4} />
      ) : (
        <UserPlus size={24} color={colors.accent} strokeWidth={2.4} />
      )}
      <AppText variant="subheading" style={[styles.label, { color: full ? colors.textSecondary : colors.text }]}>
        {full ? 'All players added' : 'Add Player'}
      </AppText>
      {full ? null : (
        <View style={[styles.badge, { borderRadius: radius.pill, backgroundColor: colors.background, paddingHorizontal: spacing.sm }]}>
          <AppText variant="caption" color="accent">
            {pluralize(remainingSlots, 'spot')} left
          </AppText>
        </View>
      )}
    </AppPressable>
  );
}

const styles = StyleSheet.create({
  bar: {
    minHeight: 60,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
  },
  label: {
    flex: 1,
  },
  badge: {
    paddingVertical: 2,
  },
});
