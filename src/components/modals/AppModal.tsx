import { X } from 'lucide-react-native';
import type { ReactNode } from 'react';
import { KeyboardAvoidingView, Modal, Platform, Pressable, StyleSheet, View } from 'react-native';

import { AppPressable } from '@/components/buttons/AppPressable';
import { AppCard } from '@/components/cards/AppCard';
import { AppText } from '@/components/common/AppText';
import { HitSlop, Layout } from '@/constants/dimensions';
import { useTheme } from '@/hooks/useTheme';

export interface AppModalProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  /** Close when tapping the dimmed backdrop. Disable for required decisions. */
  dismissible?: boolean;
  showCloseButton?: boolean;
}

export function AppModal({
  visible,
  onClose,
  title,
  children,
  dismissible = true,
  showCloseButton = true,
}: AppModalProps) {
  const { colors, spacing } = useTheme();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={dismissible ? onClose : undefined}>
      {/* Lifts the dialog above the keyboard when it contains inputs. */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={[styles.root, { padding: spacing.xl }]}>
        <Pressable
          style={[StyleSheet.absoluteFill, { backgroundColor: colors.overlay }]}
          onPress={dismissible ? onClose : undefined}
          accessibilityRole={dismissible ? 'button' : undefined}
          accessibilityLabel={dismissible ? 'Close dialog' : undefined}
        />
        <AppCard elevated padding="xl" style={styles.card} accessibilityViewIsModal>
          {title || showCloseButton ? (
            <View style={[styles.header, { marginBottom: spacing.lg, gap: spacing.md }]}>
              {title ? (
                <AppText variant="heading" style={styles.title} accessibilityRole="header">
                  {title}
                </AppText>
              ) : null}
              {showCloseButton ? (
                <AppPressable
                  onPress={onClose}
                  hitSlop={HitSlop}
                  pressedScale={0.85}
                  accessibilityRole="button"
                  accessibilityLabel="Close">
                  <X size={24} color={colors.textMuted} />
                </AppPressable>
              ) : null}
            </View>
          ) : null}
          {children}
        </AppCard>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    width: '100%',
    maxWidth: Layout.modalMaxWidth,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    flex: 1,
  },
});
