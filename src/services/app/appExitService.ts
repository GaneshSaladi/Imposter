import { BackHandler, Platform } from 'react-native';

import { audioService } from '@/services/audio/audioService';

/**
 * Closing the app is only appropriate on Android. iOS apps must not quit
 * themselves (App Store guidelines), and web pages can't close their tab.
 */
export const appExitService = {
  canExit: Platform.OS === 'android',

  /** Releases resources and closes the app (Android only; no-op elsewhere). */
  exit(): void {
    if (!appExitService.canExit) return;
    audioService.releaseAll();
    BackHandler.exitApp();
  },
};
