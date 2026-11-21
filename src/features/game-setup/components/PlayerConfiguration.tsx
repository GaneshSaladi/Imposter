import { ArrowRight, Info, Users, VenetianMask } from 'lucide-react-native';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { AppButton, AppCard, AppText } from '@/components';
import { SetupLimits } from '@/features/game-setup/constants';
import { usePlayerCounters } from '@/features/game-setup/hooks/usePlayerCounters';
import { MAX_IMPOSTERS } from '@/features/game-setup/logic/configurationRules';
import { useTheme } from '@/hooks/useTheme';
import { pluralize } from '@/utils/helpers';

import { PlayerCounter } from './PlayerCounter';

interface PlayerConfigurationProps {
  onContinue: () => void;
}

export function PlayerConfiguration({ onContinue }: PlayerConfigurationProps) {
  const { colors, spacing } = useTheme();
  const counters = usePlayerCounters();

  return (
    <View style={[styles.root, { gap: spacing.lg }]}>
      <Animated.View entering={FadeInDown.duration(350)} style={{ gap: spacing.xs }}>
        <AppText variant="title">Who&apos;s playing?</AppText>
        <AppText color="textSecondary">Set how many players and imposters are in this round.</AppText>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(80).duration(350)}>
        <PlayerCounter
          label="Players"
          icon={Users}
          value={counters.totalPlayers}
          helperText={`Min ${counters.minTotalPlayers} · Max ${SetupLimits.maxPlayers}`}
          onIncrement={counters.incrementPlayers}
          onDecrement={counters.decrementPlayers}
          canIncrement={counters.canIncrementPlayers}
          canDecrement={counters.canDecrementPlayers}
        />
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(160).duration(350)}>
        <PlayerCounter
          label="Imposters"
          icon={VenetianMask}
          value={counters.imposters}
          helperText={`Min ${SetupLimits.minImposters} · Max ${MAX_IMPOSTERS}`}
          onIncrement={counters.incrementImposters}
          onDecrement={counters.decrementImposters}
          canIncrement={counters.canIncrementImposters}
          canDecrement={counters.canDecrementImposters}
        />
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(240).duration(350)}>
        <AppCard padding="md" style={[styles.ruleCard, { gap: spacing.md, backgroundColor: colors.secondary }]}>
          <Info size={20} color={colors.accent} />
          <View style={styles.flex}>
            <AppText variant="bodyStrong" style={{ color: colors.onSecondary }}>
              {pluralize(counters.crewmates, 'crewmate')} vs {pluralize(counters.imposters, 'imposter')}
            </AppText>
            <AppText variant="caption" color="textSecondary">
              Every game needs at least {SetupLimits.minCrewmates} crewmates, and more crewmates than imposters.
            </AppText>
          </View>
        </AppCard>
      </Animated.View>

      <View style={styles.spacer} />

      <AppButton title="Continue" icon={ArrowRight} iconPosition="end" onPress={onContinue} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  ruleCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderWidth: 0,
  },
  spacer: {
    flex: 1,
  },
});
