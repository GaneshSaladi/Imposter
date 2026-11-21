import type { LucideIcon } from 'lucide-react-native';
import { StyleSheet } from 'react-native';

import { AppPressable, AppText } from '@/components';
import { useTheme } from '@/hooks/useTheme';

interface CardActionButtonProps {
  title: string;
  onPress: () => void;
  /** Text/icon color — usually the card's main hue. */
  color: string;
  icon?: LucideIcon;
  disabled?: boolean;
}

/** High-contrast white button for colored role cards. */
export function CardActionButton({ title, onPress, color, icon: Icon, disabled = false }: CardActionButtonProps) {
  const { radius, spacing } = useTheme();

  return (
    <AppPressable
      onPress={onPress}
      disabled={disabled}
      pressedScale={0.95}
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityState={{ disabled }}
      containerStyle={styles.container}
      style={({ pressed }) => [
        styles.button,
        {
          gap: spacing.sm,
          borderRadius: radius.lg,
          backgroundColor: pressed ? 'rgba(255, 255, 255, 0.82)' : '#FFFFFF',
          opacity: disabled ? 0.55 : 1,
        },
      ]}>
      {Icon ? <Icon size={20} color={color} strokeWidth={2.6} /> : null}
      <AppText variant="button" style={[styles.label, { color }]}>
        {title}
      </AppText>
    </AppPressable>
  );
}

const styles = StyleSheet.create({
  container: {
    alignSelf: 'stretch',
  },
  button: {
    minHeight: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 6px 16px rgba(0, 0, 0, 0.25)',
  },
  label: {
    letterSpacing: 1.2,
    fontWeight: 800,
  },
});
