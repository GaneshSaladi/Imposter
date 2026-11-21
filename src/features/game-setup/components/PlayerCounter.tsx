import { Minus, Plus, type LucideIcon } from 'lucide-react-native';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';

import { AppCard, AppPressable, AppText } from '@/components';
import { HitSlop } from '@/constants/dimensions';
import { useTheme } from '@/hooks/useTheme';

export interface PlayerCounterProps {
  label: string;
  icon: LucideIcon;
  value: number;
  onIncrement: () => void;
  onDecrement: () => void;
  canIncrement: boolean;
  canDecrement: boolean;
  helperText?: string;
  /** 'large' = standalone card; 'compact' = small header column. */
  size?: 'large' | 'compact';
}

function StepButton({
  kind,
  label,
  onPress,
  enabled,
  diameter,
}: {
  kind: 'increment' | 'decrement';
  label: string;
  onPress: () => void;
  enabled: boolean;
  diameter: number;
}) {
  const { colors, radius } = useTheme();
  const Icon = kind === 'increment' ? Plus : Minus;
  const isPlus = kind === 'increment';

  return (
    <AppPressable
      onPress={onPress}
      disabled={!enabled}
      debounceMs={0}
      pressedScale={0.88}
      hitSlop={HitSlop}
      accessibilityRole="button"
      accessibilityLabel={`${isPlus ? 'Increase' : 'Decrease'} ${label}`}
      accessibilityState={{ disabled: !enabled }}
      style={({ pressed }) => [
        styles.step,
        {
          width: diameter,
          height: diameter,
          borderRadius: radius.pill,
          backgroundColor: !enabled
            ? colors.disabled
            : isPlus
              ? pressed
                ? colors.primaryPressed
                : colors.primary
              : pressed
                ? colors.secondaryPressed
                : colors.secondary,
        },
      ]}>
      <Icon
        size={diameter * 0.45}
        strokeWidth={3}
        color={!enabled ? colors.onDisabled : isPlus ? colors.onPrimary : colors.onSecondary}
      />
    </AppPressable>
  );
}

export function PlayerCounter({
  label,
  icon: Icon,
  value,
  onIncrement,
  onDecrement,
  canIncrement,
  canDecrement,
  helperText,
  size = 'large',
}: PlayerCounterProps) {
  const { colors, radius, spacing } = useTheme();
  const compact = size === 'compact';

  // Screen readers get a single adjustable control (swipe up/down).
  const adjustableProps = {
    accessible: true,
    accessibilityRole: 'adjustable' as const,
    accessibilityLabel: label,
    accessibilityValue: { text: String(value) },
    accessibilityActions: [{ name: 'increment' as const }, { name: 'decrement' as const }],
    onAccessibilityAction: (event: { nativeEvent: { actionName: string } }) => {
      if (event.nativeEvent.actionName === 'increment' && canIncrement) onIncrement();
      if (event.nativeEvent.actionName === 'decrement' && canDecrement) onDecrement();
    },
  };

  const valueText = (
    <Animated.View key={value} entering={FadeInUp.duration(180)}>
      <AppText variant={compact ? 'heading' : 'display'} align="center" style={!compact && styles.bigValue}>
        {value}
      </AppText>
    </Animated.View>
  );

  if (compact) {
    return (
      <View style={[styles.compact, { gap: spacing.xs }]}>
        <View style={[styles.row, { gap: spacing.xs }]} {...adjustableProps}>
          <Icon size={18} color={colors.accent} strokeWidth={2.4} />
          {valueText}
        </View>
        <AppText variant="label" color="textMuted">
          {label.toUpperCase()}
        </AppText>
        <View style={[styles.row, { gap: spacing.sm }]}>
          <StepButton kind="decrement" label={label} onPress={onDecrement} enabled={canDecrement} diameter={34} />
          <StepButton kind="increment" label={label} onPress={onIncrement} enabled={canIncrement} diameter={34} />
        </View>
      </View>
    );
  }

  return (
    <AppCard style={{ gap: spacing.lg }}>
      <View style={[styles.row, { gap: spacing.md }]}>
        <View style={[styles.iconBubble, { borderRadius: radius.lg, backgroundColor: colors.secondary }]}>
          <Icon size={24} color={colors.accent} strokeWidth={2.4} />
        </View>
        <View style={styles.flex}>
          <AppText variant="subheading">{label}</AppText>
          {helperText ? (
            <AppText variant="caption" color="textMuted">
              {helperText}
            </AppText>
          ) : null}
        </View>
      </View>
      <View style={[styles.row, styles.controls, { gap: spacing.xl }]}>
        <StepButton kind="decrement" label={label} onPress={onDecrement} enabled={canDecrement} diameter={52} />
        <View style={styles.valueBox} {...adjustableProps}>
          {valueText}
        </View>
        <StepButton kind="increment" label={label} onPress={onIncrement} enabled={canIncrement} diameter={52} />
      </View>
    </AppCard>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  compact: {
    alignItems: 'center',
  },
  controls: {
    justifyContent: 'center',
  },
  iconBubble: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  valueBox: {
    minWidth: 72,
    alignItems: 'center',
  },
  bigValue: {
    fontVariant: ['tabular-nums'],
  },
  step: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
