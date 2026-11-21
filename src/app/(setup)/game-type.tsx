import { router } from 'expo-router';
import { Sparkles } from 'lucide-react-native';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { AppText, ScreenContainer } from '@/components';
import { Routes } from '@/constants/routes';
import { GameTypeCard } from '@/features/game-types/components/GameTypeCard';
import { GAME_TYPES } from '@/features/game-types/constants/gameTypes';
import { useTheme } from '@/hooks/useTheme';
import { useGameSetupStore } from '@/store';

export default function GameTypeScreen() {
  const { colors, spacing } = useTheme();
  const selectGameType = useGameSetupStore((s) => s.selectGameType);

  return (
    <ScreenContainer scrollable ambient edges={['bottom', 'left', 'right']}>
      <Animated.View entering={FadeInDown.duration(350)} style={{ gap: spacing.xs }}>
        <AppText variant="title">Choose a game</AppText>
        <AppText color="textSecondary">Pick how you want to hunt down the imposter.</AppText>
      </Animated.View>

      {GAME_TYPES.map((gameType, index) => (
        <Animated.View key={gameType.id} entering={FadeInDown.delay(100 + index * 80).duration(400)}>
          <GameTypeCard
            gameType={gameType}
            onPress={() => {
              selectGameType(gameType.id);
              router.navigate(Routes.playerSetup);
            }}
          />
        </Animated.View>
      ))}

      <View style={[styles.comingSoon, { gap: spacing.xs }]}>
        <Sparkles size={16} color={colors.textMuted} />
        <AppText variant="caption" color="textMuted">
          More game modes coming soon
        </AppText>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  comingSoon: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
