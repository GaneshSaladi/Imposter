import { X } from 'lucide-react-native';
import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { AppPressable } from '@/components';
import { HitSlop } from '@/constants/dimensions';
import { useTheme } from '@/hooks/useTheme';

interface GameTopBarProps {
  onLeave: () => void;
  /** Optional centered content (e.g. reveal progress). */
  children?: ReactNode;
}

const SIDE = 40;

/** Minimal in-game header: a leave button and optional center content. */
export function GameTopBar({ onLeave, children }: GameTopBarProps) {
  const { colors, radius } = useTheme();

  return (
    <View style={styles.bar}>
      <AppPressable
        onPress={onLeave}
        hitSlop={HitSlop}
        pressedScale={0.88}
        accessibilityRole="button"
        accessibilityLabel="Leave game"
        style={({ pressed }) => [
          styles.side,
          { borderRadius: radius.pill, backgroundColor: pressed ? colors.secondaryPressed : colors.secondary },
        ]}>
        <X size={20} color={colors.textSecondary} strokeWidth={2.6} />
      </AppPressable>
      <View style={styles.center}>{children}</View>
      <View style={styles.side} />
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  side: {
    width: SIDE,
    height: SIDE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  center: {
    flex: 1,
    alignItems: 'center',
  },
});
