import { useState } from 'react';

import { appExitService } from '@/services/app/appExitService';
import { useGameSetupStore, useGameStore } from '@/store';

/**
 * Close-game flow with confirmation. On Android the app exits after
 * resetting session state (the JS context can survive an exit, so a
 * relaunch must not see a half-finished setup). Unsupported elsewhere.
 */
export function useCloseGame() {
  const [confirmVisible, setConfirmVisible] = useState(false);

  return {
    canClose: appExitService.canExit,
    confirmVisible,
    requestClose: () => setConfirmVisible(true),
    cancelClose: () => setConfirmVisible(false),
    confirmClose: () => {
      setConfirmVisible(false);
      useGameSetupStore.getState().resetSetup();
      useGameStore.getState().resetGame();
      appExitService.exit();
    },
  };
}
