import { ArrowRight } from 'lucide-react-native';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeIn, FadeInUp } from 'react-native-reanimated';

import { AppButton, AppText } from '@/components';
import { useTheme } from '@/hooks/useTheme';
import { selectIsRegistrationComplete, selectRemainingSlots, useGameSetupStore } from '@/store';
import { pluralize } from '@/utils/helpers';

import { AddPlayerBar } from './AddPlayerBar';
import { AddPlayerModal } from './AddPlayerModal';
import { PlayerList } from './PlayerList';
import { RegistrationHeader } from './RegistrationHeader';

interface PlayerRegistrationProps {
  onContinue: () => void;
}

export function PlayerRegistration({ onContinue }: PlayerRegistrationProps) {
  const { spacing } = useTheme();
  const players = useGameSetupStore((s) => s.players);
  const removePlayer = useGameSetupStore((s) => s.removePlayer);
  const remainingSlots = useGameSetupStore(selectRemainingSlots);
  const isComplete = useGameSetupStore(selectIsRegistrationComplete);

  const [modalVisible, setModalVisible] = useState(false);
  const [formKey, setFormKey] = useState(0);

  const openModal = () => {
    setFormKey((key) => key + 1);
    setModalVisible(true);
  };

  return (
    <View style={[styles.root, { gap: spacing.lg }]}>
      <RegistrationHeader />
      <AddPlayerBar remainingSlots={remainingSlots} onPress={openModal} />
      <PlayerList players={players} onRemove={(player) => removePlayer(player.id)} />

      {isComplete ? (
        <Animated.View entering={FadeInUp.duration(300)}>
          <AppButton title="Continue" icon={ArrowRight} iconPosition="end" onPress={onContinue} />
        </Animated.View>
      ) : (
        <Animated.View entering={FadeIn.duration(200)} style={styles.hint}>
          <AppText variant="caption" color="textMuted" align="center">
            Add {pluralize(remainingSlots, 'more player')} to continue
          </AppText>
        </Animated.View>
      )}

      <AddPlayerModal visible={modalVisible} formKey={formKey} onClose={() => setModalVisible(false)} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  hint: {
    minHeight: 56,
    justifyContent: 'center',
  },
});
