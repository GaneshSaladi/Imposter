import { Redirect, router, useFocusEffect } from 'expo-router';
import { useCallback, useRef, useState } from 'react';
import { BackHandler, View } from 'react-native';

import { AppButton, AppModal, AppText, ScreenContainer } from '@/components';
import { Routes } from '@/constants/routes';
import { GameResultsScreen } from '@/features/gameplay/components/GameResultsScreen';
import { NoActiveGame } from '@/features/gameplay/components/NoActiveGame';
import { toGameHistory } from '@/features/gameplay/logic/gameHistoryMapper';
import { startNewGameSession } from '@/features/gameplay/logic/gameSession';
import type { GameHistory } from '@/features/history/types/history.types';
import { useTheme } from '@/hooks/useTheme';
import { selectHistoryRecord, useGameStore, useHistoryStore } from '@/store';

const CLEANUP_DELAY_MS = 450;

export default function ResultsScreen() {
  const { spacing } = useTheme();
  const session = useGameStore((s) => s.session);
  const [error, setError] = useState<string | null>(null);
  // Keeps showing the finished match while Play Again navigates away
  // (the store already holds the new session by then).
  const [leavingSnapshot, setLeavingSnapshot] = useState<GameHistory | null>(null);
  const startingNewGame = useRef(false);

  const goHome = useCallback(() => {
    const sessionId = useGameStore.getState().session?.sessionId;
    router.dismissTo(Routes.home);
    // The finished game is already in history; drop it once we've left.
    if (sessionId) setTimeout(() => useGameStore.getState().endSession(sessionId), CLEANUP_DELAY_MS);
  }, []);

  // Android back from the results simply goes home (nothing left to lose).
  useFocusEffect(
    useCallback(() => {
      const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
        goHome();
        return true;
      });
      return () => subscription.remove();
    }, [goHome]),
  );

  // Prefer the saved record (it carries the match number); fall back to mapping the session.
  const saved = useHistoryStore(selectHistoryRecord(session?.sessionId));

  if (leavingSnapshot === null && session && session.status !== 'completed') {
    // Never show results (word + every role) before the game has fully finished.
    return <Redirect href={Routes.play} />;
  }
  const record = leavingSnapshot ?? saved ?? (session ? toGameHistory(session) : null);
  if (!record) return <NoActiveGame />;

  // Same players, counts, categories and round preference; fresh word, roles and orders.
  const playAgain = () => {
    if (startingNewGame.current) return; // a second tap must not create a second session
    startingNewGame.current = true;
    setLeavingSnapshot(record);
    const result = startNewGameSession();
    if (result.ok) {
      router.replace(Routes.getReady);
    } else {
      startingNewGame.current = false;
      setLeavingSnapshot(null);
      setError(result.error);
    }
  };

  return (
    <ScreenContainer ambient>
      <GameResultsScreen record={record} onPlayAgain={playAgain} onHome={goHome} />
      <AppModal title="Can't start a new game" visible={error !== null} onClose={() => setError(null)}>
        <View style={{ gap: spacing.md }}>
          <AppText color="textSecondary">{error}</AppText>
          <AppButton title="OK" onPress={() => setError(null)} />
        </View>
      </AppModal>
    </ScreenContainer>
  );
}
