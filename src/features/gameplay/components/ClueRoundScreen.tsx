import { ArrowRight, Flag, MessageCircle, Vote } from 'lucide-react-native';
import { useEffect, useRef, type ComponentRef } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import Animated, { FadeIn, FadeInDown, ZoomIn } from 'react-native-reanimated';

import { AppButton, AppCard, AppText, SettleGate } from '@/components';
import type { GameEngineView } from '@/features/gameplay/hooks/useGameEngine';
import { PlayerAvatar } from '@/features/players/components/PlayerAvatar';
import { useTheme } from '@/hooks/useTheme';
import { brandColors } from '@/theme';

import { ClueRoundProgress } from './ClueRoundProgress';
import { PLAYER_ROW_HEIGHT, PlayerOrderRow, type PlayerOrderState } from './PlayerOrderRow';

interface ClueRoundScreenProps {
  game: GameEngineView;
}

/**
 * Verbal clue rounds: the app only tracks whose turn it is. The host taps
 * NEXT PLAYER when the speaker is done — no timers, no text input.
 */
export function ClueRoundScreen({ game }: ClueRoundScreenProps) {
  const { cycle, clueRoundsPerCycle, currentSpeaker } = game;
  if (!cycle) return null;
  if (game.isCycleComplete) {
    return (
      <SettleGate key="voting-transition">
        <VotingTransition game={game} />
      </SettleGate>
    );
  }

  return <SpeakingTurns game={game} cycle={cycle} rounds={clueRoundsPerCycle} speakerName={currentSpeaker?.name} />;
}

function SpeakingTurns({
  game,
  cycle,
  rounds,
  speakerName,
}: {
  game: GameEngineView;
  cycle: NonNullable<GameEngineView['cycle']>;
  rounds: number;
  speakerName: string | undefined;
}) {
  const { colors, radius, spacing, scheme } = useTheme();
  const scrollRef = useRef<ComponentRef<typeof ScrollView>>(null);
  const total = cycle.speakingOrder.length;
  const isLastSpeaker = cycle.spokenCount === total - 1;
  const isLastRound = cycle.currentRound === rounds;
  const speaker = game.currentSpeaker;

  // Keep the current speaker visible in long lists.
  useEffect(() => {
    scrollRef.current?.scrollTo({ y: Math.max(0, (cycle.spokenCount - 1) * (PLAYER_ROW_HEIGHT + spacing.sm)), animated: true });
  }, [cycle.spokenCount, cycle.currentRound, spacing.sm]);

  const buttonLabel = !isLastSpeaker ? 'NEXT PLAYER' : isLastRound ? 'FINISH CLUES' : `FINISH ROUND ${cycle.currentRound}`;

  const next = () =>
    game.actions.advanceSpeakingTurn({
      cycleNumber: cycle.cycleNumber,
      round: cycle.currentRound,
      spokenCount: cycle.spokenCount,
    });

  const stateFor = (index: number): PlayerOrderState =>
    index < cycle.spokenCount ? 'done' : index === cycle.spokenCount ? 'current' : 'upcoming';

  return (
    <View style={[styles.flex, { gap: spacing.md }]}>
      <Animated.View key={`round-${cycle.currentRound}`} entering={ZoomIn.springify().damping(14)} style={styles.center}>
        <AppText variant="title" align="center" style={[styles.title, scheme === 'dark' && styles.glow]}>
          ROUND {cycle.currentRound} OF {rounds}
        </AppText>
        {cycle.currentRound > 1 ? (
          <AppText variant="caption" color="accent">
            Same order — new clues!
          </AppText>
        ) : null}
      </Animated.View>

      <ClueRoundProgress round={cycle.currentRound} totalRounds={rounds} completed={cycle.spokenCount} total={total} />

      {speaker ? (
        <Animated.View key={`${cycle.currentRound}-${speaker.id}`} entering={FadeIn.duration(250)}>
          <AppCard elevated style={[styles.spotlight, { gap: spacing.md, borderColor: colors.primary }]}>
            <View style={[styles.avatarRing, { borderRadius: radius.pill, borderColor: speaker.color }]}>
              <PlayerAvatar name={speaker.name} color={speaker.color} size={56} />
            </View>
            <View style={styles.flex}>
              <AppText variant="label" color="accent">
                NOW SPEAKING
              </AppText>
              <AppText variant="heading" numberOfLines={1} adjustsFontSizeToFit>
                {speaker.name}
              </AppText>
              <View style={[styles.row, { gap: spacing.xs }]}>
                <MessageCircle size={14} color={colors.textMuted} />
                <AppText variant="caption" color="textMuted" style={styles.flexShrink}>
                  Give one short clue out loud.
                </AppText>
              </View>
            </View>
          </AppCard>
        </Animated.View>
      ) : null}

      <ScrollView ref={scrollRef} style={styles.flex} contentContainerStyle={{ gap: spacing.sm }} showsVerticalScrollIndicator={false}>
        {cycle.speakingOrder.map((id, index) => {
          const player = game.playerById(id);
          return player ? <PlayerOrderRow key={id} player={player} position={index + 1} state={stateFor(index)} /> : null;
        })}
      </ScrollView>

      <AppButton
        title={buttonLabel}
        icon={isLastSpeaker ? Flag : ArrowRight}
        iconPosition={isLastSpeaker ? 'start' : 'end'}
        onPress={next}
        accessibilityHint={speakerName ? `Confirms ${speakerName} has finished speaking` : undefined}
      />
    </View>
  );
}

/** All clue rounds done → the build-up to voting. */
function VotingTransition({ game }: { game: GameEngineView }) {
  const { colors, radius, spacing, scheme } = useTheme();

  return (
    <View style={[styles.flex, styles.centerFill, { gap: spacing.xl }]}>
      <Animated.View entering={ZoomIn.springify().damping(12)} style={[styles.bigIcon, { borderRadius: radius.pill, backgroundColor: colors.secondary }]}>
        <Vote size={44} color={colors.accent} />
      </Animated.View>
      <Animated.View entering={FadeInDown.delay(120).duration(400)} style={[styles.center, { gap: spacing.sm }]}>
        <AppText variant="label" color="accent">
          ALL CLUES ARE IN
        </AppText>
        <AppText variant="title" align="center" style={[styles.title, scheme === 'dark' && styles.glow]}>
          TIME TO FIND THE IMPOSTER
        </AppText>
        <AppText color="textSecondary" align="center">
          Discuss your suspicions and cast your votes.
        </AppText>
      </Animated.View>
      <Animated.View entering={FadeInDown.delay(240).duration(400)} style={styles.stretch}>
        <AppButton title="START VOTING" icon={Vote} onPress={() => game.actions.startVoting()} />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  flexShrink: {
    flexShrink: 1,
  },
  center: {
    alignItems: 'center',
  },
  centerFill: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  stretch: {
    alignSelf: 'stretch',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontWeight: 900,
    letterSpacing: 2,
  },
  glow: {
    textShadowColor: brandColors.violetGlow,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 16,
  },
  spotlight: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    boxShadow: '0 8px 24px rgba(124, 92, 255, 0.3)',
  },
  avatarRing: {
    padding: 3,
    borderWidth: 3,
  },
  bigIcon: {
    width: 96,
    height: 96,
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: `0 0 32px ${brandColors.violetGlow}`,
  },
});
