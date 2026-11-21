import { router } from 'expo-router';
import { useState } from 'react';

import { ScreenContainer } from '@/components';
import { DeleteHistoryDialog } from '@/features/history/components/DeleteHistoryDialog';
import { GameHistoryList } from '@/features/history/components/GameHistoryList';
import { sortNewestFirst } from '@/features/history/services/gameHistoryService';
import type { GameHistory } from '@/features/history/types/history.types';
import { useHistoryStore } from '@/store';

export default function GameHistoryScreen() {
  const records = useHistoryStore((s) => s.records);
  const deleteRecord = useHistoryStore((s) => s.deleteRecord);
  const [pendingDelete, setPendingDelete] = useState<GameHistory | null>(null);

  return (
    <ScreenContainer ambient edges={['bottom', 'left', 'right']}>
      <GameHistoryList
        records={sortNewestFirst(records)}
        onOpen={(record) => router.push({ pathname: '/history/[matchId]', params: { matchId: record.id } })}
        onDelete={setPendingDelete}
      />
      <DeleteHistoryDialog
        record={pendingDelete}
        onCancel={() => setPendingDelete(null)}
        onConfirm={(record) => {
          deleteRecord(record.id);
          setPendingDelete(null);
        }}
      />
    </ScreenContainer>
  );
}
