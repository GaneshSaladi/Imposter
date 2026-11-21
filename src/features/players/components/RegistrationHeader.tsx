import { Users, VenetianMask } from 'lucide-react-native';
import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import { AppCard, AppText } from '@/components';
import { PlayerCounter } from '@/features/game-setup/components/PlayerCounter';
import { usePlayerCounters } from '@/features/game-setup/hooks/usePlayerCounters';
import { useTheme } from '@/hooks/useTheme';

/** Players counter · registration progress · imposters counter. */
export function RegistrationHeader() {
  const { colors, radius, spacing } = useTheme();
  const counters = usePlayerCounters();
  const { registeredPlayers, totalPlayers } = counters;
  const complete = registeredPlayers === totalPlayers;

  const progress = useSharedValue(0);
  useEffect(() => {
    progress.set(withTiming(totalPlayers > 0 ? registeredPlayers / totalPlayers : 0, { duration: 300 }));
  }, [progress, registeredPlayers, totalPlayers]);
  const fillStyle = useAnimatedStyle(() => ({ width: `${progress.get() * 100}%` }));

  return (
    <AppCard padding="md" style={[styles.row, { gap: spacing.sm }]}>
      <PlayerCounter
        size="compact"
        label="Players"
        icon={Users}
        value={totalPlayers}
        onIncrement={counters.incrementPlayers}
        onDecrement={counters.decrementPlayers}
        canIncrement={counters.canIncrementPlayers}
        canDecrement={counters.canDecrementPlayers}
      />

      <View
        style={[styles.progress, { gap: spacing.xs }]}
        accessible
        accessibilityRole="progressbar"
        accessibilityLabel={`${registeredPlayers} of ${totalPlayers} players added`}
        accessibilityValue={{ min: 0, max: totalPlayers, now: registeredPlayers }}>
        <AppText variant="title" align="center" style={{ color: complete ? colors.success : colors.text }}>
          {registeredPlayers}
          <AppText variant="heading" color="textMuted">
            {' '}
            / {totalPlayers}
          </AppText>
        </AppText>
        <AppText variant="caption" color="textSecondary" align="center">
          {complete ? 'All set!' : 'Players added'}
        </AppText>
        <View style={[styles.track, { borderRadius: radius.pill, backgroundColor: colors.secondary }]}>
          <Animated.View
            style={[
              styles.fill,
              { borderRadius: radius.pill, backgroundColor: complete ? colors.success : colors.primary },
              fillStyle,
            ]}
          />
        </View>
      </View>

      <PlayerCounter
        size="compact"
        label="Imposters"
        icon={VenetianMask}
        value={counters.imposters}
        onIncrement={counters.incrementImposters}
        onDecrement={counters.decrementImposters}
        canIncrement={counters.canIncrementImposters}
        canDecrement={counters.canDecrementImposters}
      />
    </AppCard>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  progress: {
    flex: 1,
    alignItems: 'stretch',
  },
  track: {
    height: 8,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
  },
});
