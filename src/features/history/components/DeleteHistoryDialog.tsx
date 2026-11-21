import { Trash2 } from 'lucide-react-native';
import { View } from 'react-native';

import { AppButton, AppModal, AppText } from '@/components';
import type { GameHistory } from '@/features/history/types/history.types';
import { useTheme } from '@/hooks/useTheme';
import { formatMatchNumber } from '@/utils/format';

interface DeleteHistoryDialogProps {
  /** The match to delete, or null when the dialog is closed. */
  record: GameHistory | null;
  onCancel: () => void;
  onConfirm: (record: GameHistory) => void;
}

export function DeleteHistoryDialog({ record, onCancel, onConfirm }: DeleteHistoryDialogProps) {
  const { spacing } = useTheme();

  return (
    <AppModal title="Delete this match?" visible={record !== null} onClose={onCancel}>
      <View style={{ gap: spacing.md }}>
        <AppText color="textSecondary">
          {record ? `${formatMatchNumber(record.matchNumber)} will be removed from this device. ` : ''}
          This can&apos;t be undone. Other matches are not affected.
        </AppText>
        <AppButton title="Delete Match" icon={Trash2} variant="danger" onPress={() => record && onConfirm(record)} />
        <AppButton title="Cancel" variant="ghost" onPress={onCancel} />
      </View>
    </AppModal>
  );
}
