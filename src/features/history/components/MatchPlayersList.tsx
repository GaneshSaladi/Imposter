import { StyleSheet, View } from 'react-native';

import { AppCard, AppText } from '@/components';
import type { GameHistoryPlayer } from '@/features/history/types/history.types';
import { PlayerAvatar } from '@/features/players/components/PlayerAvatar';
import { useTheme } from '@/hooks/useTheme';

import { RoleChip } from './RoleChip';

/** Every player with their role and fate. Used after a game and in history. */
export function MatchPlayersList({ players, title = 'PLAYERS & ROLES' }: { players: readonly GameHistoryPlayer[]; title?: string }) {
  const { spacing } = useTheme();

  return (
    <AppCard style={{ gap: spacing.md }}>
      <AppText variant="label" color="textMuted">
        {title}
      </AppText>
      {players.map((player) => (
        <View
          key={player.id}
          style={[styles.row, { gap: spacing.md }]}
          accessible
          accessibilityLabel={`${player.name}, ${player.role}, ${
            player.eliminated ? `eliminated in cycle ${player.eliminatedRound}` : 'survived'
          }`}>
          <PlayerAvatar name={player.name} color={player.color} size={36} />
          <View style={styles.flex}>
            <AppText variant="bodyStrong" numberOfLines={1} style={player.eliminated && styles.struck}>
              {player.name}
            </AppText>
            <AppText variant="caption" color={player.eliminated ? 'textMuted' : 'success'}>
              {player.eliminated ? `Voted out · cycle ${player.eliminatedRound}` : 'Survived'}
            </AppText>
          </View>
          <RoleChip role={player.role} />
        </View>
      ))}
    </AppCard>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  flex: {
    flex: 1,
  },
  struck: {
    textDecorationLine: 'line-through',
  },
});
