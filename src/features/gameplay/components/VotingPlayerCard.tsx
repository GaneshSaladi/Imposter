import { Check } from 'lucide-react-native';
import { StyleSheet, View } from 'react-native';
import Animated, { ZoomIn } from 'react-native-reanimated';

import { AppPressable, AppText } from '@/components';
import { PlayerAvatar } from '@/features/players/components/PlayerAvatar';
import type { Player } from '@/features/players/types';
import { useTheme } from '@/hooks/useTheme';

interface VotingPlayerCardProps {
  player: Player;
  /** Aggregate votes so far (never who cast them). */
  votes: number;
  selected: boolean;
  onSelect: () => void;
  width: number;
}

/** A selectable vote candidate. */
export function VotingPlayerCard({ player, votes, selected, onSelect, width }: VotingPlayerCardProps) {
  const { colors, radius, spacing } = useTheme();

  return (
    <AppPressable
      onPress={onSelect}
      feedback="selection"
      debounceMs={0}
      pressedScale={0.95}
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      accessibilityLabel={`${player.name}, ${votes} ${votes === 1 ? 'vote' : 'votes'} so far`}
      containerStyle={{ width }}
      style={[
        styles.card,
        {
          gap: spacing.sm,
          padding: spacing.md,
          borderRadius: radius.lg,
          borderColor: selected ? colors.primary : colors.border,
          backgroundColor: selected ? colors.secondary : colors.surface,
        },
        selected && styles.glow,
      ]}>
      <View style={[styles.colorBar, { backgroundColor: player.color, borderTopLeftRadius: radius.lg, borderTopRightRadius: radius.lg }]} />
      <View style={styles.topRow}>
        <PlayerAvatar name={player.name} color={player.color} size={44} />
        <View
          style={[
            styles.indicator,
            { borderColor: selected ? colors.primary : colors.border, backgroundColor: selected ? colors.primary : 'transparent' },
          ]}>
          {selected ? (
            <Animated.View entering={ZoomIn.duration(150)}>
              <Check size={14} color={colors.onPrimary} strokeWidth={3.2} />
            </Animated.View>
          ) : null}
        </View>
      </View>
      <AppText variant="bodyStrong" numberOfLines={1}>
        {player.name}
      </AppText>
      <View style={[styles.votes, { borderRadius: radius.pill, backgroundColor: colors.background, gap: 4 }]}>
        <Animated.View key={votes} entering={votes > 0 ? ZoomIn.duration(220) : undefined}>
          <AppText variant="caption" style={[styles.count, { color: votes > 0 ? colors.accent : colors.textMuted }]}>
            {votes}
          </AppText>
        </Animated.View>
        <AppText variant="caption" color="textMuted">
          {votes === 1 ? 'vote' : 'votes'}
        </AppText>
      </View>
    </AppPressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 2,
    overflow: 'hidden',
  },
  glow: {
    boxShadow: '0 6px 18px rgba(124, 92, 255, 0.35)',
  },
  colorBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 4,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  indicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  votes: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  count: {
    fontWeight: 800,
  },
});
