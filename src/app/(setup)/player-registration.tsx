import { router } from 'expo-router';

import { ScreenContainer } from '@/components';
import { Routes } from '@/constants/routes';
import { PlayerRegistration } from '@/features/players/components/PlayerRegistration';

export default function PlayerRegistrationScreen() {
  return (
    <ScreenContainer edges={['bottom', 'left', 'right']}>
      <PlayerRegistration onContinue={() => router.navigate(Routes.setupComplete)} />
    </ScreenContainer>
  );
}
