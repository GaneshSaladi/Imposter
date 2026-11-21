import { UserPlus } from 'lucide-react-native';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { AppButton, AppModal, AppTextInput } from '@/components';
import { SetupLimits } from '@/features/game-setup/constants';
import { getDefaultPlayerColor, validatePlayerName } from '@/features/players/logic/playerValidation';
import { useTheme } from '@/hooks/useTheme';
import { feedbackService } from '@/services/feedback/feedbackService';
import { useGameSetupStore } from '@/store';

import { ColorPicker } from './ColorPicker';
import { PlayerAvatar } from './PlayerAvatar';

interface AddPlayerModalProps {
  visible: boolean;
  onClose: () => void;
  /** Change on every open so the form starts fresh (name, error, default color). */
  formKey: number;
}

export function AddPlayerModal({ visible, onClose, formKey }: AddPlayerModalProps) {
  return (
    <AppModal title="Add Player" visible={visible} onClose={onClose}>
      <AddPlayerForm key={formKey} onDone={onClose} />
    </AppModal>
  );
}

/** Form input is local component state — only the final player reaches the store. */
function AddPlayerForm({ onDone }: { onDone: () => void }) {
  const { spacing } = useTheme();
  const players = useGameSetupStore((s) => s.players);
  const addPlayer = useGameSetupStore((s) => s.addPlayer);

  const [name, setName] = useState('');
  const [color, setColor] = useState(() => getDefaultPlayerColor(players));
  const [error, setError] = useState<string | null>(null);

  const submit = () => {
    // Instant UI check first; the store re-validates as the final authority.
    const check = validatePlayerName(name, players);
    const result = check.valid ? addPlayer({ name, color }) : null;
    if (!result?.ok) {
      setError(result ? result.error : (check.message ?? 'Please check the name.'));
      feedbackService.error();
      return;
    }
    feedbackService.success();
    onDone();
  };

  return (
    <View style={{ gap: spacing.lg }}>
      <View style={[styles.nameRow, { gap: spacing.md }]}>
        <PlayerAvatar name={name || '?'} color={color} size={52} />
        <View style={styles.flex}>
          <AppTextInput
            label="NAME"
            placeholder="e.g. Sherlock"
            value={name}
            onChangeText={(text) => {
              setName(text);
              if (error) setError(null);
            }}
            error={error}
            autoFocus
            autoCapitalize="words"
            autoCorrect={false}
            maxLength={SetupLimits.maxPlayerNameLength}
            returnKeyType="done"
            onSubmitEditing={submit}
            accessibilityLabel="Player name"
          />
        </View>
      </View>

      <ColorPicker selectedColor={color} onSelect={setColor} players={players} />

      <View style={{ gap: spacing.sm }}>
        <AppButton title="Add Player" icon={UserPlus} feedback="none" onPress={submit} />
        <AppButton title="Cancel" variant="ghost" onPress={onDone} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  nameRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  flex: {
    flex: 1,
  },
});
