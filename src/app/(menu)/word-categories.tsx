import { router } from 'expo-router';

import { ScreenContainer } from '@/components';
import { Routes } from '@/constants/routes';
import { CategorySelection } from '@/features/game-setup/components/CategorySelection';

/** Category editor opened from Settings. Shares the saved selection with the new-game flow. */
export default function WordCategoriesScreen() {
  return (
    <ScreenContainer ambient edges={['bottom', 'left', 'right']}>
      <CategorySelection
        variant="settings"
        onContinue={() => (router.canGoBack() ? router.back() : router.replace(Routes.settings))}
      />
    </ScreenContainer>
  );
}
