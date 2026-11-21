import { router } from 'expo-router';

import { ScreenContainer } from '@/components';
import { Routes } from '@/constants/routes';
import { PlayerConfiguration } from '@/features/game-setup/components/PlayerConfiguration';

export default function PlayerSetupScreen() {
  return (
    <ScreenContainer scrollable ambient edges={['bottom', 'left', 'right']}>
      {/* Counters write straight to the setup store, so Continue only navigates. */}
      <PlayerConfiguration onContinue={() => router.navigate(Routes.playerRegistration)} />
    </ScreenContainer>
  );
}
