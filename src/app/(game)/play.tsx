import { Redirect, router } from 'expo-router';
import { useEffect } from 'react';

import { AppText, ScreenContainer } from '@/components';
import { Routes } from '@/constants/routes';
import { GameFlowScreen } from '@/features/gameplay/components/GameFlowScreen';
import { GameTopBar } from '@/features/gameplay/components/GameTopBar';
import { LeaveGameDialog } from '@/features/gameplay/components/LeaveGameDialog';
import { NoActiveGame } from '@/features/gameplay/components/NoActiveGame';
import { useLeaveGameGuard } from '@/features/gameplay/hooks/useLeaveGameGuard';
import { useGameStore } from '@/store';

/** The running game (speaking order → clues → voting → results → next cycle). */
export default function PlayScreen() {
  const status = useGameStore((s) => s.session?.status ?? null);
  const cycleNumber = useGameStore((s) => s.session?.cycles.at(-1)?.cycleNumber ?? null);
  const winnerDecided = useGameStore((s) => (s.session?.winner ?? null) !== null);
  const leave = useLeaveGameGuard(Routes.home);

  useEffect(() => {
    if (status === 'completed') router.replace(Routes.results);
  }, [status]);

  if (status === null) return <NoActiveGame />;
  // Opened at the wrong stage (e.g. a deep link): send to the right screen.
  if (status === 'preparing') return <Redirect href={Routes.getReady} />;
  if (status === 'role-reveal') return <Redirect href={Routes.reveal} />;
  if (status === 'ready') return <Redirect href={Routes.gameReady} />;

  return (
    <ScreenContainer ambient contentStyle={{ paddingTop: 8 }}>
      <GameTopBar onLeave={leave.requestLeave}>
        {cycleNumber !== null ? (
          <AppText variant="label" color="textMuted">
            CYCLE {cycleNumber}
          </AppText>
        ) : null}
      </GameTopBar>
      <GameFlowScreen />
      <LeaveGameDialog
        visible={leave.confirmVisible}
        onCancel={leave.cancelLeave}
        onConfirm={leave.confirmLeave}
        title="Leave this game?"
        message={
          winnerDecided
            ? 'This game is already decided and has been saved to your history.'
            : "The game will end and won't be saved to history. Your players and settings are kept."
        }
        confirmLabel={winnerDecided ? 'Leave' : 'Leave Game'}
      />
    </ScreenContainer>
  );
}
