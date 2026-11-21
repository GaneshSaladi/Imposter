import { History } from 'lucide-react-native';
import { FlatList, StyleSheet, View } from 'react-native';
import Animated, { FadeOut, LinearTransition } from 'react-native-reanimated';

import { AppText } from '@/components';
import type { GameHistory } from '@/features/history/types/history.types';
import { useTheme } from '@/hooks/useTheme';

import { GameHistoryCard } from './GameHistoryCard';

interface GameHistoryListProps {
  /** Already sorted newest first. */
  records: readonly GameHistory[];
  onOpen: (record: GameHistory) => void;
  onDelete: (record: GameHistory) => void;
}

export function GameHistoryList({ records, onOpen, onDelete }: GameHistoryListProps) {
  const { colors, spacing } = useTheme();

  if (records.length === 0) {
    return (
      <View style={[styles.empty, { gap: spacing.md }]}>
        <History size={40} color={colors.textMuted} />
        <AppText variant="subheading" align="center">
          No games yet
        </AppText>
        <AppText color="textMuted" align="center">
          Finished matches will appear here, newest first.
        </AppText>
      </View>
    );
  }

  return (
    <FlatList
      style={styles.list}
      data={records}
      keyExtractor={(record) => record.id}
      contentContainerStyle={{ gap: spacing.md, paddingBottom: spacing.xl }}
      showsVerticalScrollIndicator={false}
      renderItem={({ item }) => (
        <Animated.View exiting={FadeOut.duration(200)} layout={LinearTransition.duration(220)}>
          <GameHistoryCard record={item} onOpen={() => onOpen(item)} onDelete={() => onDelete(item)} />
        </Animated.View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  list: {
    flex: 1,
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
