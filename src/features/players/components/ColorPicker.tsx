import { Check } from 'lucide-react-native';
import { StyleSheet, View } from 'react-native';

import { AppPressable, AppText } from '@/components';
import { ON_PLAYER_COLOR, PLAYER_COLORS } from '@/features/players/constants/playerColors';
import { areAllColorsUsed } from '@/features/players/logic/playerValidation';
import type { Player } from '@/features/players/types';
import { useTheme } from '@/hooks/useTheme';

interface ColorPickerProps {
  selectedColor: string;
  onSelect: (color: string) => void;
  /** Already-registered players; their colors are shown as taken. */
  players: readonly Player[];
}

const SWATCH = 38;
const RING = 3;

export function ColorPicker({ selectedColor, onSelect, players }: ColorPickerProps) {
  const { colors, spacing } = useTheme();
  // If every color is in use, allow sharing rather than blocking registration.
  const sharingAllowed = areAllColorsUsed(players);

  return (
    <View style={{ gap: spacing.sm }}>
      <AppText variant="label" color="textMuted">
        COLOR
      </AppText>
      <View style={[styles.grid, { gap: spacing.md }]} accessibilityRole="radiogroup">
        {PLAYER_COLORS.map((option) => {
          const takenBy = players.find((player) => player.color === option.value);
          const unavailable = Boolean(takenBy) && !sharingAllowed;
          const selected = option.value === selectedColor;

          return (
            <AppPressable
              key={option.value}
              onPress={() => onSelect(option.value)}
              disabled={unavailable}
              feedback="selection"
              debounceMs={0}
              pressedScale={0.88}
              accessibilityRole="radio"
              accessibilityLabel={takenBy ? `${option.name}, taken by ${takenBy.name}` : option.name}
              accessibilityState={{ selected, disabled: unavailable }}
              style={[
                styles.ring,
                { borderColor: selected ? colors.text : 'transparent', opacity: unavailable ? 0.22 : 1 },
              ]}>
              <View style={[styles.swatch, { backgroundColor: option.value }]}>
                {selected ? <Check size={20} color={ON_PLAYER_COLOR} strokeWidth={3.2} /> : null}
              </View>
            </AppPressable>
          );
        })}
      </View>
      {sharingAllowed ? (
        <AppText variant="caption" color="textMuted">
          Every color is taken — players can share colors now.
        </AppText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  ring: {
    padding: RING,
    borderWidth: RING,
    borderRadius: SWATCH,
  },
  swatch: {
    width: SWATCH,
    height: SWATCH,
    borderRadius: SWATCH / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
