import { Gavel, RotateCcw, Scale } from 'lucide-react-native';
import { useEffect } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import Animated, { FadeInDown, useAnimatedStyle, useSharedValue, withDelay, withTiming, ZoomIn } from 'react-native-reanimated';

import { AppButton, AppCard, AppText } from '@/components';
import type { GameEngineView, PublicPlayer } from '@/features/gameplay/hooks/useGameEngine';
import { PlayerAvatar } from '@/features/players/components/PlayerAvatar';
import { useTheme } from '@/hooks/useTheme';
import { brandColors } from '@/theme';

interface VotingResultsScreenProps {
  game: GameEngineView;
}

function TallyRow({
  player,
  votes,
  maxVotes,
  highlighted,
  delay,
}: {
  player: PublicPlayer;
  votes: number;
  maxVotes: number;
  highlighted: boolean;
  delay: number;
}) {
  const { colors, radius, spacing } = useTheme();
  const fill = useSharedValue(0);
  useEffect(() => {
    fill.set(withDelay(delay, withTiming(maxVotes > 0 ? votes / maxVotes : 0, { duration: 600 })));
  }, [fill, votes, maxVotes, delay]);
  const barStyle = useAnimatedStyle(() => ({ width: `${Math.max(fill.get() * 100, 2)}%` }));

  return (
    <View style={[styles.row, { gap: spacing.md }]} accessible accessibilityLabel={`${player.name}: ${votes} votes`}>
      <PlayerAvatar name={player.name} color={player.color} size={32} />
      <View style={[styles.flex, { gap: 4 }]}>
        <AppText variant="bodyStrong" numberOfLines={1}>
          {player.name}
        </AppText>
        <View style={[styles.track, { borderRadius: radius.pill, backgroundColor: colors.secondary }]}>
          <Animated.View
            style={[
              styles.fill,
              { borderRadius: radius.pill, backgroundColor: highlighted ? colors.primary : colors.textMuted },
              barStyle,
            ]}
          />
        </View>
      </View>
      <AppText variant="heading" style={{ color: highlighted ? colors.text : colors.textMuted }}>
        {votes}
      </AppText>
    </View>
  );
}

/** Vote tally, then either a tie announcement or the build-up to an elimination. */
export function VotingResultsScreen({ game }: VotingResultsScreenProps) {
  const { colors, radius, spacing, scheme } = useTheme();
  const result = game.votingPhase?.result;
  if (!result) return null;

  const tally = game.activePlayers
    .concat(game.eliminatedPlayers.filter((player) => player.id === result.eliminatedPlayerId))
    .map((player) => ({ player, votes: result.voteCounts[player.id] ?? 0 }))
    .filter((entry, index, all) => all.findIndex((other) => other.player.id === entry.player.id) === index)
    .sort((a, b) => b.votes - a.votes);
  const top = new Set(result.topPlayerIds);
  const topNames = result.topPlayerIds.map((id) => game.playerById(id)?.name ?? '').join(' & ');
  const eliminated = game.playerById(result.eliminatedPlayerId);

  return (
    <View style={[styles.flex, { gap: spacing.lg }]}>
      <Animated.View entering={ZoomIn.springify().damping(13)} style={[styles.center, { gap: spacing.sm }]}>
        <View style={[styles.iconBubble, { borderRadius: radius.pill, backgroundColor: colors.secondary }]}>
          {result.isTie ? <Scale size={32} color={colors.warning} /> : <Gavel size={32} color={colors.accent} />}
        </View>
        <AppText variant="label" color="textMuted">
          VOTING COMPLETE
        </AppText>
        <AppText variant="title" align="center" style={[styles.bold, scheme === 'dark' && styles.glow]}>
          {result.isTie ? "IT'S A TIE!" : 'THE VOTES ARE IN'}
        </AppText>
        <AppText color="textSecondary" align="center">
          {result.isTie
            ? `${topNames} tied with ${result.maxVotes} votes each. Nobody gets eliminated this round.`
            : `${eliminated?.name ?? 'One player'} received the most votes…`}
        </AppText>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(150).duration(350)} style={styles.flex}>
        <AppCard style={[styles.flex, { gap: spacing.md }]}>
          <ScrollView style={styles.flex} contentContainerStyle={{ gap: spacing.md }} showsVerticalScrollIndicator={false}>
            {tally.map(({ player, votes }, index) => (
              <TallyRow
                key={player.id}
                player={player}
                votes={votes}
                maxVotes={result.maxVotes}
                highlighted={top.has(player.id)}
                delay={200 + index * 80}
              />
            ))}
          </ScrollView>
        </AppCard>
      </Animated.View>

      {result.isTie ? (
        <AppButton title="CONTINUE" icon={RotateCcw} onPress={() => game.actions.continueFromVoteResults()} />
      ) : (
        <AppButton title="REVEAL ELIMINATION" icon={Gavel} onPress={() => game.actions.continueFromVoteResults()} />
      )}
    </View>
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
    letterSpacing: 1.5,
  },
  glow: {
    textShadowColor: brandColors.violetGlow,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 16,
  },
  iconBubble: {
    width: 64,
    height: 64,
    alignItems: 'center',
    justifyContent: 'center',
  },
  track: {
    height: 8,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
  },
});
