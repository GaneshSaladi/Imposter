import { router } from 'expo-router';

import { ScreenContainer } from '@/components';
import { Routes } from '@/constants/routes';
import { LeaveGameDialog } from '@/features/gameplay/components/LeaveGameDialog';
import { NoActiveGame } from '@/features/gameplay/components/NoActiveGame';
import { PlayerRevealScreen } from '@/features/gameplay/components/PlayerRevealScreen';
import { useLeaveGameGuard } from '@/features/gameplay/hooks/useLeaveGameGuard';
import { useGameStore } from '@/store';

export default function RevealScreen() {
  const hasSession = useGameStore((s) => s.session !== null);
  const leave = useLeaveGameGuard(Routes.categories);

  if (!hasSession) return <NoActiveGame />;

  return (
    <ScreenContainer ambient contentStyle={{ paddingTop: 8 }}>
      <PlayerRevealScreen onLeave={leave.requestLeave} onComplete={() => router.replace(Routes.gameReady)} />
      <LeaveGameDialog visible={leave.confirmVisible} onCancel={leave.cancelLeave} onConfirm={leave.confirmLeave} />
    </ScreenContainer>
  );
}
