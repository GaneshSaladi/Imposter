import { router } from 'expo-router';

import { Routes } from '@/constants/routes';
import { GamePreparationScreen } from '@/features/gameplay/components/GamePreparationScreen';
import { LeaveGameDialog } from '@/features/gameplay/components/LeaveGameDialog';
import { NoActiveGame } from '@/features/gameplay/components/NoActiveGame';
import { useLeaveGameGuard } from '@/features/gameplay/hooks/useLeaveGameGuard';
import { useGameStore } from '@/store';

export default function GetReadyScreen() {
  // The session was already created by the categories Continue button.
  const hasSession = useGameStore((s) => s.session !== null);
  const beginRoleReveal = useGameStore((s) => s.beginRoleReveal);
  const leave = useLeaveGameGuard(Routes.categories);

  if (!hasSession) return <NoActiveGame />;

  return (
    <>
      <GamePreparationScreen
        paused={leave.confirmVisible || leave.isLeaving}
        onLeave={leave.requestLeave}
        onFinished={() => {
          if (beginRoleReveal().ok) router.replace(Routes.reveal);
        }}
      />
      <LeaveGameDialog visible={leave.confirmVisible} onCancel={leave.cancelLeave} onConfirm={leave.confirmLeave} />
    </>
  );
}
