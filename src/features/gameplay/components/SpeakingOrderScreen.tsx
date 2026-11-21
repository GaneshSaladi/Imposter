import { Megaphone, Mic } from 'lucide-react-native';
import { ScrollView, StyleSheet, View } from 'react-native';
import Animated, { FadeInDown, FadeInRight, ZoomIn } from 'react-native-reanimated';

import { AppButton, AppText } from '@/components';
import type { GameEngineView } from '@/features/gameplay/hooks/useGameEngine';
import { useTheme } from '@/hooks/useTheme';
import { brandColors } from '@/theme';

import { PlayerOrderRow } from './PlayerOrderRow';

interface SpeakingOrderScreenProps {
  game: GameEngineView;
}

const SUBTITLES = {
  start: 'Your speaking order is ready!',
  elimination: 'A fresh order for the players still standing.',
  tie: 'No one left — so here is a brand-new order.',
} as const;

function Chip({ label }: { label: string }) {
  const { colors, radius, spacing } = useTheme();
  return (
    <View style={[styles.chip, { borderRadius: radius.pill, backgroundColor: colors.secondary, paddingHorizontal: spacing.md }]}>
      <AppText variant="label" style={{ color: colors.onSecondary }}>
        {label}
      </AppText>
    </View>
  );
}

/** Reveals the cycle's freshly shuffled speaking order. */
export function SpeakingOrderScreen({ game }: SpeakingOrderScreenProps) {
  const { colors, radius, spacing, scheme } = useTheme();
  const { cycle } = game;
  if (!cycle) return null;

  return (
    <View style={[styles.flex, { gap: spacing.lg }]}>
      <Animated.View entering={ZoomIn.springify().damping(14)} style={[styles.center, { gap: spacing.sm }]}>
        <View style={[styles.iconBubble, { borderRadius: radius.pill, backgroundColor: colors.secondary }]}>
          <Megaphone size={30} color={colors.accent} />
        </View>
        <AppText variant="title" align="center" style={[styles.title, scheme === 'dark' && styles.glow]}>
          WHO STARTS FIRST?
        </AppText>
        <AppText color="textSecondary" align="center">
          {SUBTITLES[cycle.reason]}
        </AppText>
        <View style={[styles.chips, { gap: spacing.sm }]}>
          <Chip label={`CYCLE ${cycle.cycleNumber}`} />
          <Chip label={`${game.clueRoundsPerCycle} CLUE ROUNDS`} />
          <Chip label={`${cycle.speakingOrder.length} PLAYERS`} />
        </View>
      </Animated.View>

      <ScrollView style={styles.flex} contentContainerStyle={{ gap: spacing.sm }} showsVerticalScrollIndicator={false}>
        {cycle.speakingOrder.map((id, index) => {
          const player = game.playerById(id);
          if (!player) return null;
          return (
            <Animated.View key={id} entering={FadeInRight.delay(150 + index * 90).springify().damping(16)}>
              <PlayerOrderRow player={player} position={index + 1} state={index === 0 ? 'first' : 'upcoming'} />
            </Animated.View>
          );
        })}
        {game.eliminatedPlayers.length > 0 ? (
          <Animated.View entering={FadeInDown.delay(300)} style={{ gap: spacing.sm, marginTop: spacing.sm }}>
            <AppText variant="label" color="textMuted">
              OUT OF THE GAME
            </AppText>
            {game.eliminatedPlayers.map((player) => (
              <PlayerOrderRow key={player.id} player={player} state="eliminated" />
            ))}
          </Animated.View>
        ) : null}
      </ScrollView>

      <AppButton title="START ROUND 1" icon={Mic} onPress={() => game.actions.beginClueRounds()} />
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
  iconBubble: {
    width: 64,
    height: 64,
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: `0 0 24px ${brandColors.violetGlow}`,
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
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  chip: {
    paddingVertical: 4,
  },
});
