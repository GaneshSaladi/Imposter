import { ChevronRight, type LucideIcon } from 'lucide-react-native';
import { StyleSheet, View } from 'react-native';

import { AppPressable, AppText } from '@/components';
import { useTheme } from '@/hooks/useTheme';

export type MenuButtonVariant = 'primary' | 'secondary' | 'subtle';

export interface MenuButtonProps {
  label: string;
  icon: LucideIcon;
  onPress: () => void;
  variant?: MenuButtonVariant;
  accessibilityHint?: string;
}

export function MenuButton({ label, icon: Icon, onPress, variant = 'secondary', accessibilityHint }: MenuButtonProps) {
  const { colors, radius, spacing } = useTheme();
  const isPrimary = variant === 'primary';
  const isSubtle = variant === 'subtle';

  const foreground = isPrimary ? colors.onPrimary : isSubtle ? colors.textMuted : colors.text;
  const iconColor = isPrimary ? colors.onPrimary : isSubtle ? colors.textMuted : colors.accent;

  return (
    <AppPressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint={accessibilityHint}
      pressedScale={isPrimary ? 0.96 : 0.97}
      style={({ pressed }) => [
        styles.base,
        {
          // Compact but still comfortably above the 48pt minimum touch target.
          minHeight: isPrimary ? 64 : isSubtle ? 48 : 52,
          borderRadius: radius.xl,
          paddingHorizontal: spacing.lg,
          gap: spacing.md,
        },
        isPrimary && {
          backgroundImage: `linear-gradient(135deg, ${pressed ? colors.primaryPressed : '#9479FF'}, ${colors.primaryPressed})`,
          boxShadow: '0 10px 28px rgba(124, 92, 255, 0.45)',
        },
        variant === 'secondary' && {
          backgroundColor: pressed ? colors.secondary : colors.surface,
          borderWidth: 1,
          borderColor: colors.border,
        },
        isSubtle && {
          backgroundColor: pressed ? colors.surface : 'transparent',
        },
      ]}>
      <View
        style={[
          styles.iconBubble,
          {
            borderRadius: radius.pill,
            width: isPrimary ? 40 : 32,
            height: isPrimary ? 40 : 32,
            backgroundColor: isPrimary ? 'rgba(255, 255, 255, 0.2)' : isSubtle ? 'transparent' : colors.secondary,
          },
        ]}>
        <Icon size={isPrimary ? 22 : 18} color={iconColor} strokeWidth={2.4} />
      </View>
      <AppText variant={isPrimary ? 'heading' : 'subheading'} style={[styles.label, { color: foreground }]}>
        {label}
      </AppText>
      {isSubtle ? null : <ChevronRight size={22} color={isPrimary ? colors.onPrimary : colors.textMuted} />}
    </AppPressable>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconBubble: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    flex: 1,
  },
});
