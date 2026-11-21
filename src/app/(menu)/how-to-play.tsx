import { router } from 'expo-router';

import { ScreenContainer } from '@/components';
import { Routes } from '@/constants/routes';
import { HowToPlayGuide } from '@/features/how-to-play/components/HowToPlayGuide';

/** Read-only guide. The header back button and the final button both return home; no state changes. */
export default function HowToPlayScreen() {
  return (
    <ScreenContainer scrollable ambient edges={['bottom', 'left', 'right']}>
      <HowToPlayGuide onDone={() => (router.canGoBack() ? router.dismissTo(Routes.home) : router.replace(Routes.home))} />
    </ScreenContainer>
  );
}
