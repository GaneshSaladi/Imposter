import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components';
import { useTheme } from '@/hooks/useTheme';

interface RevealProgressProps {
  /** Zero-based index of the current player. */
  index: number;
  total: number;
  /** Word before the count, e.g. "PLAYER" or "VOTER". */
  label?: string;
}

/** "PLAYER 2 OF 5" with dots. Position only — no names, roles or votes. */
export function RevealProgress({ index, total, label = 'PLAYER' }: RevealProgressProps) {
  const { colors, radius, spacing } = useTheme();

  return (
    <View
      style={[styles.root, { gap: spacing.xs }]}
      accessible
      accessibilityRole="progressbar"
      accessibilityLabel={`${label} ${index + 1} of ${total}`}>
      <AppText variant="label" color="textMuted">
        {label} {index + 1} OF {total}
      </AppText>
      <View style={[styles.dots, { gap: spacing.xs }]}>
        {Array.from({ length: total }, (_, i) => (
          <View
            key={i}
            style={[
              styles.dot,
              {
                borderRadius: radius.pill,
                width: i === index ? 18 : 8,
                backgroundColor: i < index ? colors.accent : i === index ? colors.primary : colors.secondary,
              },
            ]}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    alignItems: 'center',
  },
  dots: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dot: {
    height: 8,
  },
});
