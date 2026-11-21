import type { LucideIcon } from 'lucide-react-native';
import { ActivityIndicator, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';

import { AppPressable } from '@/components/buttons/AppPressable';
import { AppText } from '@/components/common/AppText';
import { Layout } from '@/constants/dimensions';
import { useTheme } from '@/hooks/useTheme';
import type { FeedbackKind } from '@/services/feedback/feedbackService';
import type { ThemeColors } from '@/theme';

export type AppButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
export type AppButtonSize = 'md' | 'lg';

export interface AppButtonProps {
  title: string;
  onPress: () => void;
  variant?: AppButtonVariant;
  size?: AppButtonSize;
  icon?: LucideIcon;
  /** Place the icon after the label (e.g. "Continue →"). */
  iconPosition?: 'start' | 'end';
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  /** Interaction feedback. Use 'none' when the caller plays its own (e.g. success/error). */
  feedback?: FeedbackKind;
  style?: StyleProp<ViewStyle>;
  accessibilityHint?: string;
}

type ColorKey = keyof ThemeColors;
type Background = ColorKey | 'transparent';

const variantColors: Record<AppButtonVariant, { bg: Background; pressed: ColorKey; fg: ColorKey }> = {
  primary: { bg: 'primary', pressed: 'primaryPressed', fg: 'onPrimary' },
  secondary: { bg: 'secondary', pressed: 'secondaryPressed', fg: 'onSecondary' },
  ghost: { bg: 'transparent', pressed: 'secondary', fg: 'primary' },
  danger: { bg: 'danger', pressed: 'dangerPressed', fg: 'onDanger' },
};

export function AppButton({
  title,
  onPress,
  variant = 'primary',
  size = 'lg',
  icon: Icon,
  iconPosition = 'start',
  loading = false,
  disabled = false,
  fullWidth = true,
  feedback = 'tap',
  style,
  accessibilityHint,
}: AppButtonProps) {
  const { colors, radius, spacing } = useTheme();

  const isInactive = disabled || loading;
  const palette = variantColors[variant];
  const foreground = isInactive ? colors.onDisabled : colors[palette.fg];
  const resolveBackground = (pressed: boolean): string => {
    if (isInactive) return variant === 'ghost' ? 'transparent' : colors.disabled;
    if (pressed) return colors[palette.pressed];
    return palette.bg === 'transparent' ? 'transparent' : colors[palette.bg];
  };

  const icon = Icon ? <Icon size={size === 'lg' ? 22 : 18} color={foreground} strokeWidth={2.5} /> : null;

  return (
    <AppPressable
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled: isInactive, busy: loading }}
      disabled={isInactive}
      onPress={onPress}
      feedback={feedback}
      containerStyle={[fullWidth && styles.fullWidth, style]}
      style={({ pressed }) => [
        styles.base,
        {
          minHeight: size === 'lg' ? 56 : Layout.minTouchTarget,
          paddingHorizontal: size === 'lg' ? spacing.xl : spacing.lg,
          borderRadius: radius.lg,
          gap: spacing.sm,
          backgroundColor: resolveBackground(pressed),
        },
        variant === 'ghost' && { borderWidth: 2, borderColor: colors.border },
      ]}>
      {loading ? (
        <ActivityIndicator color={foreground} />
      ) : (
        <>
          {iconPosition === 'start' ? icon : null}
          <AppText variant={size === 'lg' ? 'button' : 'bodyStrong'} style={{ color: foreground }}>
            {title}
          </AppText>
          {iconPosition === 'end' ? icon : null}
        </>
      )}
    </AppPressable>
  );
}

const styles = StyleSheet.create({
  fullWidth: {
    alignSelf: 'stretch',
  },
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
