import { Power } from 'lucide-react-native';
import { View } from 'react-native';

import { AppButton, AppModal, AppText } from '@/components';
import { useTheme } from '@/hooks/useTheme';

interface CloseGameDialogProps {
  visible: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export function CloseGameDialog({ visible, onCancel, onConfirm }: CloseGameDialogProps) {
  const { spacing } = useTheme();

  return (
    <AppModal title="Close Imposter?" visible={visible} onClose={onCancel}>
      <View style={{ gap: spacing.md }}>
        <AppText color="textSecondary">The mystery will be waiting for you next time.</AppText>
        <AppButton title="Close Game" icon={Power} variant="danger" onPress={onConfirm} />
        <AppButton title="Keep Playing" variant="ghost" onPress={onCancel} />
      </View>
    </AppModal>
  );
}
