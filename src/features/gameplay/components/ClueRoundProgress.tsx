import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import { AppText } from '@/components';
import { useTheme } from '@/hooks/useTheme';

interface ClueRoundProgressProps {
  round: number;
  totalRounds: number;
  completed: number;
  total: number;
}

/** "ROUND 1 OF 3" pips + "Completed 2 / 5" animated bar. */
export function ClueRoundProgress({ round, totalRounds, completed, total }: ClueRoundProgressProps) {
  const { colors, radius, spacing } = useTheme();
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.set(withTiming(total > 0 ? completed / total : 0, { duration: 300 }));
  }, [completed, total, progress]);

  const fillStyle = useAnimatedStyle(() => ({ width: `${progress.get() * 100}%` }));

  return (
    <View style={{ gap: spacing.sm }}>
      <View style={styles.row}>
        <View style={[styles.row, { gap: spacing.xs }]}>
          {Array.from({ length: totalRounds }, (_, index) => (
            <View
              key={index}
              style={[
                styles.pip,
                {
                  borderRadius: radius.pill,
                  width: index + 1 === round ? 22 : 10,
                  backgroundColor: index + 1 < round ? colors.accent : index + 1 === round ? colors.primary : colors.secondary,
                },
              ]}
            />
          ))}
        </View>
        <AppText variant="caption" color="textSecondary" accessibilityLiveRegion="polite">
          Completed {completed} / {total}
        </AppText>
      </View>
      <View
        style={[styles.track, { borderRadius: radius.pill, backgroundColor: colors.secondary }]}
        accessible
        accessibilityRole="progressbar"
        accessibilityValue={{ min: 0, max: total, now: completed }}>
        <Animated.View style={[styles.fill, { borderRadius: radius.pill, backgroundColor: colors.primary }, fillStyle]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  pip: {
    height: 10,
  },
  track: {
    height: 8,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
  },
});
