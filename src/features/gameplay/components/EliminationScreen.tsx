import { ArrowRight, Trophy, UserX } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { StyleSheet, useWindowDimensions, View } from 'react-native';
import Animated, {
  cancelAnimation,
  Easing,
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  ZoomIn,
} from 'react-native-reanimated';

import { AppButton, AppText } from '@/components';
import type { GameEngineView } from '@/features/gameplay/hooks/useGameEngine';
import { LoadingDots } from '@/features/onboarding/components/LoadingDots';
import { PlayerAvatar } from '@/features/players/components/PlayerAvatar';
import { useTheme } from '@/hooks/useTheme';
import { feedbackService } from '@/services/feedback/feedbackService';
import { roleColors } from '@/theme';
import { pluralize } from '@/utils/helpers';

import { RoleIllustration } from './RoleIllustration';

/** Intentional suspense before the eliminated player's role is shown. */
const SUSPENSE_MS = 1800;

interface EliminationScreenProps {
  game: GameEngineView;
}

export function EliminationScreen({ game }: EliminationScreenProps) {
  const { colors, radius, spacing } = useTheme();
  const { width, height } = useWindowDimensions();
  const [revealed, setRevealed] = useState(false);
  const pulse = useSharedValue(0);

  const player = game.playerById(game.votingPhase?.result?.eliminatedPlayerId);
  const role = player?.revealedRole ?? null;

  useEffect(() => {
    pulse.set(withRepeat(withTiming(1, { duration: 700, easing: Easing.inOut(Easing.sin) }), -1, true));
    const timer = setTimeout(() => {
      setRevealed(true);
      feedbackService.tap(); // once, at the reveal moment
    }, SUSPENSE_MS);
    return () => {
      clearTimeout(timer);
      cancelAnimation(pulse);
    };
  }, [pulse]);

  const mysteryStyle = useAnimatedStyle(() => ({ transform: [{ scale: 1 + 0.06 * pulse.get() }] }));

  if (!player || !role) return null;
  const palette = roleColors[role];
  const illustrationSize = Math.min(width * 0.38, height * 0.2, 170);
  const name = player.name.toLocaleUpperCase();

  return (
    <View style={[styles.flex, { gap: spacing.lg }]}>
      <Animated.View entering={ZoomIn.springify().damping(13)} style={[styles.center, { gap: spacing.sm }]}>
        <AppText variant="label" color="textMuted">
          VOTING COMPLETE
        </AppText>
        <View>
          <PlayerAvatar name={player.name} color={player.color} size={72} />
          <View style={[styles.badge, { backgroundColor: colors.danger, borderRadius: radius.pill, borderColor: colors.background }]}>
            <UserX size={14} color={colors.onDanger} strokeWidth={2.6} />
          </View>
        </View>
        <AppText variant="title" align="center" numberOfLines={2} adjustsFontSizeToFit style={styles.bold}>
          {name} HAS BEEN ELIMINATED!
        </AppText>
      </Animated.View>

      <View style={[styles.flex, styles.centerFill]}>
        {revealed ? (
          <Animated.View
            entering={ZoomIn.springify().damping(12)}
            style={[
              styles.roleCard,
              {
                gap: spacing.md,
                padding: spacing.xl,
                borderRadius: radius.xl,
                backgroundImage: palette.gradient,
                borderColor: palette.border,
                boxShadow: `0 12px 36px ${palette.glow}`,
              },
            ]}>
            <RoleIllustration role={role} size={illustrationSize} />
            <AppText variant="title" align="center" numberOfLines={2} adjustsFontSizeToFit style={[styles.bold, styles.white]}>
              {name} WAS {role === 'imposter' ? 'AN IMPOSTER!' : 'A CREWMATE!'}
            </AppText>
            <AppText variant="caption" align="center" style={{ color: palette.soft }}>
              {role === 'imposter' ? 'Nice detective work!' : 'Oh no — an innocent crewmate!'}
            </AppText>
          </Animated.View>
        ) : (
          <View style={[styles.center, { gap: spacing.md }]}>
            <Animated.View
              style={[
                styles.mystery,
                { borderRadius: radius.xl, backgroundColor: colors.secondary, borderColor: colors.primary },
                mysteryStyle,
              ]}>
              <AppText variant="display" style={{ color: colors.accent }}>
                ?
              </AppText>
            </Animated.View>
            <AppText color="textSecondary">Revealing their role…</AppText>
            <LoadingDots />
          </View>
        )}
      </View>

      {revealed ? (
        <Animated.View entering={FadeInDown.delay(400).duration(350)} style={{ gap: spacing.sm }}>
          {!game.isGameOver ? (
            <AppText variant="caption" color="textMuted" align="center">
              {pluralize(game.activePlayers.length, 'player')} left · {pluralize(game.remainingImposters, 'imposter')} still
              hiding
            </AppText>
          ) : null}
          <AppButton
            title={game.isGameOver ? 'SEE FINAL RESULTS' : 'CONTINUE TO NEXT ROUND'}
            icon={game.isGameOver ? Trophy : ArrowRight}
            iconPosition={game.isGameOver ? 'start' : 'end'}
            onPress={() => game.actions.continueFromElimination()}
          />
        </Animated.View>
      ) : null}
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
  bold: {
    fontWeight: 900,
    letterSpacing: 1,
  },
  white: {
    color: '#FFFFFF',
  },
  badge: {
    position: 'absolute',
    right: -4,
    bottom: -4,
    width: 26,
    height: 26,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  roleCard: {
    alignSelf: 'stretch',
    alignItems: 'center',
    borderWidth: 2,
  },
  mystery: {
    width: 140,
    height: 180,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
