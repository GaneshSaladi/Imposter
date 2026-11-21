import { Check, ChevronRight, Mic } from 'lucide-react-native';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components';
import { PlayerAvatar } from '@/features/players/components/PlayerAvatar';
import type { Player } from '@/features/players/types';
import { useTheme } from '@/hooks/useTheme';

export type PlayerOrderState = 'first' | 'current' | 'done' | 'upcoming' | 'eliminated';

interface PlayerOrderRowProps {
  player: Player;
  /**
   * 1-based speaking position, shown as a badge. Omit for plain player lists
   * (e.g. "still in the game") so they can't be mistaken for an order.
   */
  position?: number;
  state: PlayerOrderState;
  /** Optional right-side caption (e.g. "Crewmate" for eliminated players). */
  note?: string;
}

export const PLAYER_ROW_HEIGHT = 56;

/** One line of a speaking order / player list. Shows names only. */
export function PlayerOrderRow({ player, position, state, note }: PlayerOrderRowProps) {
  const { colors, radius, spacing } = useTheme();
  const highlighted = state === 'first' || state === 'current';
  const muted = state === 'done' || state === 'eliminated';

  return (
    <View
      style={[
        styles.row,
        {
          gap: spacing.md,
          paddingHorizontal: spacing.md,
          borderRadius: radius.lg,
          borderColor: highlighted ? colors.primary : colors.border,
          backgroundColor: highlighted ? colors.secondary : colors.surface,
          opacity: muted ? 0.6 : 1,
        },
        highlighted && styles.glow,
      ]}
      accessible
      accessibilityLabel={`${position !== undefined ? `${position}. ` : ''}${player.name}${
        state === 'current' ? ', speaking now' : ''
      }${state === 'done' ? ', done' : ''}${state === 'eliminated' ? ', eliminated' : ''}`}>
      {position !== undefined || state === 'done' ? (
        <View
          style={[
            styles.badge,
            { borderRadius: radius.pill, backgroundColor: highlighted ? colors.primary : colors.secondary },
          ]}>
          {state === 'done' ? (
            <Check size={14} color={colors.success} strokeWidth={3} />
          ) : (
            <AppText variant="caption" style={[styles.badgeText, { color: highlighted ? colors.onPrimary : colors.textSecondary }]}>
              {position}
            </AppText>
          )}
        </View>
      ) : null}
      <PlayerAvatar name={player.name} color={player.color} size={34} />
      <AppText
        variant="bodyStrong"
        numberOfLines={1}
        style={[styles.name, state === 'eliminated' && styles.struck, muted && { color: colors.textMuted }]}>
        {player.name}
      </AppText>
      {note ? (
        <AppText variant="caption" color="textMuted">
          {note}
        </AppText>
      ) : null}
      {state === 'first' ? (
        <View style={[styles.tag, { borderRadius: radius.pill, backgroundColor: colors.primary, gap: 4 }]}>
          <Mic size={12} color={colors.onPrimary} />
          <AppText variant="label" style={{ color: colors.onPrimary }}>
            FIRST
          </AppText>
        </View>
      ) : null}
      {state === 'current' ? (
        <View style={[styles.tag, { borderRadius: radius.pill, backgroundColor: colors.primary, gap: 2 }]}>
          <ChevronRight size={12} color={colors.onPrimary} strokeWidth={3} />
          <AppText variant="label" style={{ color: colors.onPrimary }}>
            CURRENT
          </AppText>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    height: PLAYER_ROW_HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
  },
  glow: {
    boxShadow: '0 4px 16px rgba(124, 92, 255, 0.35)',
  },
  badge: {
    width: 26,
    height: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    fontWeight: 800,
  },
  name: {
    flex: 1,
  },
  struck: {
    textDecorationLine: 'line-through',
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
});
