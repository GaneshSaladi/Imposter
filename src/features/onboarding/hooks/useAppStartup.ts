import { useEffect } from 'react';

import { feedbackService } from '@/services/feedback/feedbackService';
import { useStoresHydrated } from '@/store';

/**
 * Aggregates everything that must finish before the app can leave the
 * loading screen. Add future startup work here (custom fonts, sound
 * preloading, remote config) and include it in `isReady`.
 */
export function useAppStartup(): { isReady: boolean } {
  const storesHydrated = useStoresHydrated();

  // Non-blocking: warm up the UI click so the first tap has no delay.
  useEffect(() => {
    feedbackService.prepare();
  }, []);

  return { isReady: storesHydrated };
}
