import { router } from 'expo-router';
import { ArrowRight, CircleCheck, Pencil } from 'lucide-react-native';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeInDown, ZoomIn } from 'react-native-reanimated';

import { AppButton, AppCard, AppText, ScreenContainer } from '@/components';
import { Routes } from '@/constants/routes';
import { getGameType } from '@/features/game-types/constants/gameTypes';
import { PlayerAvatar } from '@/features/players/components/PlayerAvatar';
import { useTheme } from '@/hooks/useTheme';
import { selectIsRegistrationComplete, useGameSetupStore } from '@/store';
import { pluralize } from '@/utils/helpers';

/** Lineup review after registration. Nothing here modifies the setup. */
export default function SetupCompleteScreen() {
  const { colors, radius, spacing } = useTheme();
  const gameType = useGameSetupStore((s) => s.gameType);
  const totalPlayers = useGameSetupStore((s) => s.totalPlayers);
  const imposters = useGameSetupStore((s) => s.imposters);
  const players = useGameSetupStore((s) => s.players);
  const isComplete = useGameSetupStore(selectIsRegistrationComplete);

  // Registration sits directly below this screen, so "back" keeps all its data.
  const editPlayers = () => (router.canGoBack() ? router.back() : router.replace(Routes.playerRegistration));

  if (!isComplete) {
    return (
      <ScreenContainer centered ambient edges={['bottom', 'left', 'right']}>
        <AppText variant="title" align="center">
          Setup isn&apos;t finished
        </AppText>
        <AppText color="textSecondary" align="center">
          Register every player before continuing.
        </AppText>
        <AppButton title="Edit Players" icon={Pencil} onPress={editPlayers} />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer scrollable centered ambient edges={['bottom', 'left', 'right']}>
      <Animated.View entering={ZoomIn.duration(350)} style={styles.center}>
        <CircleCheck size={64} color={colors.success} strokeWidth={2} />
      </Animated.View>
      <Animated.View entering={FadeInDown.delay(100).duration(350)} style={{ gap: spacing.xs }}>
        <AppText variant="title" align="center">
          Setup complete!
        </AppText>
        <AppText color="textSecondary" align="center">
          Here&apos;s your lineup.
        </AppText>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(200).duration(350)}>
        <AppCard style={{ gap: spacing.md }}>
          <AppText variant="label" color="textMuted">
            {gameType ? (getGameType(gameType)?.title ?? gameType) : 'GAME'} ·{' '}
            {pluralize(totalPlayers, 'PLAYER')} · {pluralize(imposters, 'IMPOSTER')}
          </AppText>
          <View style={[styles.chips, { gap: spacing.sm }]}>
            {players.map((player) => (
              <View
                key={player.id}
                style={[
                  styles.chip,
                  {
                    gap: spacing.xs,
                    paddingRight: spacing.md,
                    borderRadius: radius.pill,
                    backgroundColor: colors.secondary,
                  },
                ]}>
                <PlayerAvatar name={player.name} color={player.color} size={28} />
                <AppText variant="bodyStrong" numberOfLines={1}>
                  {player.name}
                </AppText>
              </View>
            ))}
          </View>
        </AppCard>
      </Animated.View>

      <View style={{ gap: spacing.sm }}>
        <AppButton
          title="Continue"
          icon={ArrowRight}
          iconPosition="end"
          onPress={() => router.navigate(Routes.categories)}
        />
        <AppButton title="Edit Players" icon={Pencil} variant="ghost" onPress={editPlayers} />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  center: {
    alignItems: 'center',
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 3,
    maxWidth: '100%',
  },
});
