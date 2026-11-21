import { router, useFocusEffect } from 'expo-router';
import { useCallback, useRef, useState } from 'react';
import { View } from 'react-native';

import { AppButton, AppModal, AppText, ScreenContainer } from '@/components';
import { Routes } from '@/constants/routes';
import { CategorySelection } from '@/features/game-setup/components/CategorySelection';
import { startNewGameSession } from '@/features/gameplay/logic/gameSession';
import { useTheme } from '@/hooks/useTheme';
import { feedbackService } from '@/services/feedback/feedbackService';

export default function CategoriesScreen() {
  const { spacing } = useTheme();
  const [startError, setStartError] = useState<string | null>(null);
  const starting = useRef(false);

  // Coming back here (e.g. after leaving a game) allows starting again.
  useFocusEffect(
    useCallback(() => {
      starting.current = false;
    }, []),
  );

  // A new game starts here, on the button press — never on render or mount —
  // so roles are generated exactly once per game. A second tap is ignored.
  const startGame = () => {
    if (starting.current) return;
    starting.current = true;
    const result = startNewGameSession();
    if (!result.ok) {
      starting.current = false;
      setStartError(result.error);
      feedbackService.error();
      return;
    }
    router.navigate(Routes.getReady);
  };

  return (
    <ScreenContainer ambient edges={['bottom', 'left', 'right']}>
      <CategorySelection onContinue={startGame} />
      <AppModal title="Can't start yet" visible={startError !== null} onClose={() => setStartError(null)}>
        <View style={{ gap: spacing.md }}>
          <AppText color="textSecondary">{startError}</AppText>
          <AppButton title="OK" onPress={() => setStartError(null)} />
        </View>
      </AppModal>
    </ScreenContainer>
  );
}
