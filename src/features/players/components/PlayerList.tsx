import { Search } from 'lucide-react-native';
import { ScrollView, StyleSheet, View } from 'react-native';
import Animated, { FadeInDown, FadeOut, LinearTransition } from 'react-native-reanimated';

import { AppText } from '@/components';
import type { Player } from '@/features/players/types';
import { useTheme } from '@/hooks/useTheme';

import { PlayerCard } from './PlayerCard';

interface PlayerListProps {
  players: readonly Player[];
  onRemove: (player: Player) => void;
}

export function PlayerList({ players, onRemove }: PlayerListProps) {
  const { colors, spacing } = useTheme();

  if (players.length === 0) {
    return (
      <View style={[styles.empty, { gap: spacing.sm }]}>
        <Search size={32} color={colors.textMuted} />
        <AppText color="textMuted" align="center">
          No suspects yet.{'\n'}Tap Add Player to register everyone.
        </AppText>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.flex}
      contentContainerStyle={{ gap: spacing.sm, paddingBottom: spacing.sm }}
      showsVerticalScrollIndicator={false}>
      {players.map((player, index) => (
        <Animated.View
          key={player.id}
          entering={FadeInDown.duration(250)}
          exiting={FadeOut.duration(180)}
          layout={LinearTransition.duration(220)}>
          <PlayerCard player={player} position={index + 1} onRemove={onRemove} />
        </Animated.View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
