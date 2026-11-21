import { ArrowRight, ChartColumn } from 'lucide-react-native';
import { useState } from 'react';
import { ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';
import Animated, { FadeIn, FadeInDown, ZoomIn } from 'react-native-reanimated';

import { AppButton, AppText, SettleGate } from '@/components';
import { Layout } from '@/constants/dimensions';
import type { GameEngineView, PublicPlayer } from '@/features/gameplay/hooks/useGameEngine';
import { countVotes, getEligibleTargets } from '@/features/gameplay/logic/votingEngine';
import { useTheme } from '@/hooks/useTheme';
import { brandColors } from '@/theme';
import type { EntityId } from '@/types/common';

import { PlayerHandoverScreen } from './PlayerHandoverScreen';
import { RevealProgress } from './RevealProgress';
import { VoteConfirmation } from './VoteConfirmation';
import { VoterCard } from './VoterCard';
import { VotingPlayerCard } from './VotingPlayerCard';

interface VotingScreenProps {
  game: GameEngineView;
}

interface Confirmation {
  voterId: EntityId;
  targetId: EntityId;
}

/**
 * Sequential private voting: handover → ballot → confirmation, one voter at a
 * time in the phase's (independently shuffled) voting order.
 */
export function VotingScreen({ game }: VotingScreenProps) {
  const { spacing } = useTheme();
  const [confirmation, setConfirmation] = useState<Confirmation | null>(null);
  const phase = game.votingPhase;
  if (!phase) return null;

  const activeIds = game.activePlayers.map((player) => player.id);
  const counts = countVotes(phase.votes, activeIds);
  const tally = game.activePlayers.map((player) => ({ player, votes: counts[player.id] ?? 0 }));

  if (confirmation) {
    const voter = game.playerById(confirmation.voterId);
    const target = game.playerById(confirmation.targetId);
    if (voter && target) {
      return (
        <SettleGate key="confirmation">
          <VoteConfirmation voter={voter} target={target} tally={tally} onDone={() => setConfirmation(null)} />
        </SettleGate>
      );
    }
  }

  if (game.isVotingComplete) {
    return (
      <SettleGate key="all-votes-in">
        <AllVotesIn onShowResults={() => game.actions.resolveVoting()} />
      </SettleGate>
    );
  }

  const voter = game.currentVoter;
  if (!voter) return null;
  const index = phase.votes.length;
  const previousVoter = index > 0 ? game.playerById(phase.votingOrder[index - 1]) : null;

  /** Returns false if the store rejected the vote, so the ballot can unlock. */
  const submit = (targetId: EntityId): boolean => {
    const result = game.actions.submitVote(voter.id, targetId);
    if (result.ok) setConfirmation({ voterId: voter.id, targetId });
    return result.ok;
  };

  return (
    <View style={[styles.flex, { gap: spacing.md }]}>
      <RevealProgress label="VOTER" index={index} total={phase.votingOrder.length} />
      <VoterTurn
        key={`${phase.votingPhaseId}:${index}`}
        voter={voter}
        previousVoter={previousVoter}
        candidates={getEligibleTargets(activeIds, voter.id).map((id) => game.playerById(id) as PublicPlayer)}
        counts={counts}
        onSubmit={submit}
      />
    </View>
  );
}

function VoterTurn({
  voter,
  previousVoter,
  candidates,
  counts,
  onSubmit,
}: {
  voter: PublicPlayer;
  previousVoter: PublicPlayer | null;
  candidates: PublicPlayer[];
  counts: Record<EntityId, number>;
  onSubmit: (targetId: EntityId) => boolean;
}) {
  const [step, setStep] = useState<'handover' | 'ballot'>('handover');

  // Each step is gated so a double tap can't skip the pass-the-phone handover.
  if (step === 'handover') {
    return (
      <SettleGate key="handover" style={styles.centerFill}>
        <PlayerHandoverScreen
          player={voter}
          previousPlayer={previousVoter}
          onReady={() => setStep('ballot')}
          firstLabel="FIRST VOTER"
          nextLabel="NEXT VOTER"
          readyLabel="READY TO VOTE"
        />
      </SettleGate>
    );
  }
  return (
    <SettleGate key="ballot">
      <Ballot voter={voter} candidates={candidates} counts={counts} onSubmit={onSubmit} />
    </SettleGate>
  );
}

function Ballot({
  voter,
  candidates,
  counts,
  onSubmit,
}: {
  voter: PublicPlayer;
  candidates: PublicPlayer[];
  counts: Record<EntityId, number>;
  onSubmit: (targetId: EntityId) => boolean;
}) {
  const { spacing } = useTheme();
  const { width } = useWindowDimensions();
  const [selectedId, setSelectedId] = useState<EntityId | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const gap = spacing.md;
  const contentWidth = Math.min(width, Layout.maxContentWidth) - Layout.screenGutter * 2;
  const cardWidth = Math.floor((contentWidth - gap) / 2);
  const selectedName = candidates.find((player) => player.id === selectedId)?.name;

  return (
    <Animated.View entering={FadeIn.duration(250)} style={[styles.flex, { gap: spacing.md }]}>
      <VoterCard voter={voter} />
      <ScrollView style={styles.flex} showsVerticalScrollIndicator={false}>
        <View style={[styles.grid, { gap }]} accessibilityRole="radiogroup">
          {candidates.map((player) => (
            <VotingPlayerCard
              key={player.id}
              player={player}
              votes={counts[player.id] ?? 0}
              selected={player.id === selectedId}
              onSelect={() => setSelectedId(player.id)}
              width={cardWidth}
            />
          ))}
        </View>
      </ScrollView>
      <AppButton
        title={selectedName ? `VOTE FOR ${selectedName.toLocaleUpperCase()}` : 'SELECT A PLAYER'}
        icon={ArrowRight}
        iconPosition="end"
        disabled={selectedId === null || submitted}
        onPress={() => {
          if (selectedId === null || submitted) return;
          setSubmitted(true); // prevents duplicate submission
          if (!onSubmit(selectedId)) setSubmitted(false);
        }}
      />
    </Animated.View>
  );
}

function AllVotesIn({ onShowResults }: { onShowResults: () => void }) {
  const { colors, radius, spacing, scheme } = useTheme();
  return (
    <View style={[styles.flex, styles.centerFill, { gap: spacing.xl }]}>
      <Animated.View
        entering={ZoomIn.springify().damping(12)}
        style={[styles.bigIcon, { borderRadius: radius.pill, backgroundColor: colors.secondary }]}>
        <ChartColumn size={44} color={colors.accent} />
      </Animated.View>
      <Animated.View entering={FadeInDown.delay(120).duration(400)} style={[styles.center, { gap: spacing.sm }]}>
        <AppText variant="title" align="center" style={[styles.bold, scheme === 'dark' && styles.glow]}>
          ALL VOTES ARE IN!
        </AppText>
        <AppText color="textSecondary" align="center">
          Gather around — it&apos;s time to see who the group suspects.
        </AppText>
      </Animated.View>
      <Animated.View entering={FadeInDown.delay(240).duration(400)} style={styles.stretch}>
        <AppButton title="SHOW RESULTS" icon={ChartColumn} onPress={onShowResults} />
      </Animated.View>
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
  centerFill: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  stretch: {
    alignSelf: 'stretch',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
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
  bigIcon: {
    width: 96,
    height: 96,
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: `0 0 32px ${brandColors.violetGlow}`,
  },
});
