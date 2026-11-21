import { router } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { AppButton, AppModal, AppText, ScreenContainer } from '@/components';
import { Routes } from '@/constants/routes';
import { GameReadyScreen } from '@/features/gameplay/components/GameReadyScreen';
import { LeaveGameDialog } from '@/features/gameplay/components/LeaveGameDialog';
import { NoActiveGame } from '@/features/gameplay/components/NoActiveGame';
import { useLeaveGameGuard } from '@/features/gameplay/hooks/useLeaveGameGuard';
import { useTheme } from '@/hooks/useTheme';
import { useGameStore } from '@/store';

export default function GameReadyRoute() {
  const { spacing } = useTheme();
  const hasSession = useGameStore((s) => s.session !== null);
  const startGame = useGameStore((s) => s.startGame);
  const leave = useLeaveGameGuard(Routes.categories);
  const [error, setError] = useState<string | null>(null);

  if (!hasSession) return <NoActiveGame />;

  return (
    <ScreenContainer ambient contentStyle={{ paddingTop: 8 }}>
      <GameReadyScreen
        onLeave={leave.requestLeave}
        onStart={(clueRounds) => {
          const result = startGame(clueRounds);
          if (result.ok) router.replace(Routes.play);
          else setError(result.error); // never fail silently
        }}
      />
      <LeaveGameDialog visible={leave.confirmVisible} onCancel={leave.cancelLeave} onConfirm={leave.confirmLeave} />
      <AppModal title="Can't start the game" visible={error !== null} onClose={() => setError(null)}>
        <View style={{ gap: spacing.md }}>
          <AppText color="textSecondary">{error}</AppText>
          <AppButton title="OK" onPress={() => setError(null)} />
        </View>
      </AppModal>
    </ScreenContainer>
  );
}
