import { CircleCheck, EyeOff } from 'lucide-react-native';
import { ScrollView, StyleSheet, View } from 'react-native';
import Animated, { FadeIn, ZoomIn } from 'react-native-reanimated';

import { AppButton, AppCard, AppText } from '@/components';
import { PlayerAvatar } from '@/features/players/components/PlayerAvatar';
import type { Player } from '@/features/players/types';
import { useTheme } from '@/hooks/useTheme';

interface VoteConfirmationProps {
  voter: Player;
  target: Player;
  /** Candidates with their aggregate counts (no voter identities). */
  tally: readonly { player: Player; votes: number }[];
  onDone: () => void;
}

/**
 * Shown to the voter right after submitting. Their own choice is visible
 * only here; "HIDE & PASS" removes it before the next voter takes the phone.
 */
export function VoteConfirmation({ voter, target, tally, onDone }: VoteConfirmationProps) {
  const { colors, radius, spacing } = useTheme();

  return (
    <Animated.View entering={FadeIn.duration(250)} style={[styles.flex, { gap: spacing.lg }]}>
      <View style={[styles.center, { gap: spacing.sm }]}>
        <Animated.View entering={ZoomIn.springify().damping(12)}>
          <CircleCheck size={56} color={colors.success} strokeWidth={2} />
        </Animated.View>
        <AppText variant="title" align="center" style={styles.bold}>
          VOTE LOCKED IN
        </AppText>
        <AppText color="textSecondary" align="center">
          {voter.name}, you voted for <AppText variant="bodyStrong">{target.name}</AppText>.
        </AppText>
      </View>

      <AppCard style={[styles.flex, { gap: spacing.sm }]}>
        <AppText variant="label" color="textMuted">
          VOTES SO FAR
        </AppText>
        <ScrollView style={styles.flex} contentContainerStyle={{ gap: spacing.sm }} showsVerticalScrollIndicator={false}>
          {tally.map(({ player, votes }) => (
            <View key={player.id} style={[styles.row, { gap: spacing.md }]}>
              <PlayerAvatar name={player.name} color={player.color} size={28} />
              <AppText variant="bodyStrong" style={styles.flex} numberOfLines={1}>
                {player.name}
              </AppText>
              <View
                style={[
                  styles.count,
                  { borderRadius: radius.pill, backgroundColor: player.id === target.id ? colors.primary : colors.secondary },
                ]}>
                <Animated.View key={votes} entering={player.id === target.id ? ZoomIn.duration(300) : undefined}>
                  <AppText
                    variant="caption"
                    style={[styles.bold, { color: player.id === target.id ? colors.onPrimary : colors.onSecondary }]}>
                    {votes}
                  </AppText>
                </Animated.View>
              </View>
            </View>
          ))}
        </ScrollView>
      </AppCard>

      <AppButton title="HIDE & PASS THE PHONE" icon={EyeOff} onPress={onDone} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  center: {
    alignItems: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bold: {
    fontWeight: 900,
  },
  count: {
    minWidth: 32,
    paddingHorizontal: 10,
    paddingVertical: 2,
    alignItems: 'center',
  },
});
