import { router, useFocusEffect, type Href } from 'expo-router';
import { useCallback, useState } from 'react';
import { BackHandler } from 'react-native';

import { useGameStore } from '@/store/gameStore';

/** Time for the leave transition to finish before secrets are discarded. */
const CLEANUP_DELAY_MS = 450;

/**
 * Leaving an active game always goes through a confirmation, including the
 * Android back button — so nobody can back into a previous player's card.
 * (iOS swipe-back is disabled for the game stack in its layout.)
 */
export function useLeaveGameGuard(destination: Href) {
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  useFocusEffect(
    useCallback(() => {
      const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
        setConfirmVisible(true);
        return true; // handled: block the default back navigation
      });
      return () => subscription.remove();
    }, []),
  );

  return {
    confirmVisible,
    /** True once leaving was confirmed (the screen is on its way out). */
    isLeaving,
    requestLeave: () => setConfirmVisible(true),
    cancelLeave: () => setConfirmVisible(false),
    confirmLeave: () => {
      setConfirmVisible(false);
      setIsLeaving(true);
      const sessionId = useGameStore.getState().session?.sessionId;
      router.dismissTo(destination);
      // Clear after the screen is gone; skipped if a new game started meanwhile.
      if (sessionId) setTimeout(() => useGameStore.getState().endSession(sessionId), CLEANUP_DELAY_MS);
    },
  };
}
