import { LogOut } from 'lucide-react-native';
import { View } from 'react-native';

import { AppButton, AppModal, AppText } from '@/components';
import { useTheme } from '@/hooks/useTheme';

interface LeaveGameDialogProps {
  visible: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  title?: string;
  message?: string;
  confirmLabel?: string;
}

export function LeaveGameDialog({
  visible,
  onCancel,
  onConfirm,
  title = 'Leave this game?',
  message = 'Roles and the secret word will be discarded. Your players and categories are kept.',
  confirmLabel = 'Leave Game',
}: LeaveGameDialogProps) {
  const { spacing } = useTheme();

  return (
    <AppModal title={title} visible={visible} onClose={onCancel}>
      <View style={{ gap: spacing.md }}>
        <AppText color="textSecondary">{message}</AppText>
        <AppButton title={confirmLabel} icon={LogOut} variant="danger" onPress={onConfirm} />
        <AppButton title="Keep Playing" variant="ghost" onPress={onCancel} />
      </View>
    </AppModal>
  );
}
