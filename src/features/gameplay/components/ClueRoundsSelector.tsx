import { Check } from 'lucide-react-native';
import { StyleSheet, View } from 'react-native';

import { AppPressable, AppText } from '@/components';
import { CLUE_ROUND_OPTIONS } from '@/features/gameplay/constants';
import type { ClueRoundsPerCycle } from '@/features/gameplay/types/game.types';
import { useTheme } from '@/hooks/useTheme';

interface ClueRoundsSelectorProps {
  value: ClueRoundsPerCycle;
  onChange: (rounds: ClueRoundsPerCycle) => void;
}

const DESCRIPTIONS: Record<ClueRoundsPerCycle, string> = {
  2: 'Quick & tense',
  3: 'Classic · more clues',
};

/** Choose 2 or 3 clue rounds per cycle (applies to the whole game). */
export function ClueRoundsSelector({ value, onChange }: ClueRoundsSelectorProps) {
  const { colors, radius, spacing } = useTheme();

  return (
    <View style={{ gap: spacing.sm }}>
      <AppText variant="label" color="textMuted">
        CLUE ROUNDS PER CYCLE
      </AppText>
      <View style={[styles.row, { gap: spacing.md }]} accessibilityRole="radiogroup">
        {CLUE_ROUND_OPTIONS.map((option) => {
          const selected = option === value;
          return (
            <AppPressable
              key={option}
              onPress={() => onChange(option)}
              feedback="selection"
              debounceMs={0}
              accessibilityRole="radio"
              accessibilityState={{ selected }}
              accessibilityLabel={`${option} clue rounds. ${DESCRIPTIONS[option]}`}
              containerStyle={styles.flex}
              style={[
                styles.option,
                {
                  gap: spacing.xs,
                  padding: spacing.md,
                  borderRadius: radius.lg,
                  borderColor: selected ? colors.primary : colors.border,
                  backgroundColor: selected ? colors.secondary : colors.surface,
                },
              ]}>
              <View style={styles.headerRow}>
                <AppText variant="title" style={{ color: selected ? colors.text : colors.textSecondary }}>
                  {option}
                </AppText>
                <View
                  style={[
                    styles.check,
                    {
                      borderColor: selected ? colors.primary : colors.border,
                      backgroundColor: selected ? colors.primary : 'transparent',
                    },
                  ]}>
                  {selected ? <Check size={14} color={colors.onPrimary} strokeWidth={3} /> : null}
                </View>
              </View>
              <AppText variant="bodyStrong">Rounds</AppText>
              <AppText variant="caption" color={selected ? 'accent' : 'textMuted'}>
                {DESCRIPTIONS[option]}
              </AppText>
            </AppPressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  row: {
    flexDirection: 'row',
  },
  option: {
    borderWidth: 2,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  check: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
