import { router } from 'expo-router';
import { House } from 'lucide-react-native';

import { AppButton, AppText, ScreenContainer } from '@/components';
import { Routes } from '@/constants/routes';

/** Shown if a game screen is opened without an active session (e.g. via a deep link). */
export function NoActiveGame() {
  return (
    <ScreenContainer centered ambient>
      <AppText variant="title" align="center">
        No game in progress
      </AppText>
      <AppText color="textSecondary" align="center">
        Start a new game from the main menu.
      </AppText>
      <AppButton title="Back to Menu" icon={House} onPress={() => router.replace(Routes.home)} />
    </ScreenContainer>
  );
}
