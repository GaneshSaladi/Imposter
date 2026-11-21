import { Calendar, Clock, Trash2, Trophy } from 'lucide-react-native';
import { StyleSheet, View } from 'react-native';

import { AppPressable, AppText } from '@/components';
import { HitSlop } from '@/constants/dimensions';
import type { GameHistory } from '@/features/history/types/history.types';
import { useTheme } from '@/hooks/useTheme';
import { formatDuration, formatLongDate, formatMatchNumber, formatTime } from '@/utils/format';
import { pluralize } from '@/utils/helpers';

interface GameHistoryCardProps {
  record: GameHistory;
  onOpen: () => void;
  onDelete: () => void;
}

const WINNER = {
  crew: { label: 'CREWMATES WON', color: '#26C48B', soft: 'rgba(38, 196, 139, 0.16)' },
  imposter: { label: 'IMPOSTERS WON', color: '#F25A6E', soft: 'rgba(242, 90, 110, 0.16)' },
} as const;

export function GameHistoryCard({ record, onOpen, onDelete }: GameHistoryCardProps) {
  const { colors, radius, spacing } = useTheme();
  const winner = WINNER[record.winner];

  return (
    <AppPressable
      onPress={onOpen}
      pressedScale={0.98}
      accessibilityRole="button"
      accessibilityLabel={`${formatMatchNumber(record.matchNumber)}, ${formatLongDate(record.completedAt)}, ${winner.label}`}
      accessibilityHint="Opens the match details"
      style={({ pressed }) => [
        styles.card,
        {
          gap: spacing.sm,
          padding: spacing.lg,
          borderRadius: radius.lg,
          borderColor: colors.border,
          borderLeftColor: winner.color,
          backgroundColor: pressed ? colors.surfaceElevated : colors.surface,
        },
      ]}>
      <View style={styles.row}>
        <AppText variant="subheading" style={styles.flex}>
          {formatMatchNumber(record.matchNumber)}
        </AppText>
        <AppPressable
          onPress={onDelete}
          hitSlop={HitSlop}
          pressedScale={0.85}
          accessibilityRole="button"
          accessibilityLabel={`Delete ${formatMatchNumber(record.matchNumber)}`}
          style={({ pressed }) => [
            styles.delete,
            { borderRadius: radius.pill, backgroundColor: pressed ? colors.secondaryPressed : colors.secondary },
          ]}>
          <Trash2 size={16} color={colors.textSecondary} />
        </AppPressable>
      </View>

      <View style={[styles.row, { gap: spacing.md }]}>
        <View style={[styles.row, { gap: 4 }]}>
          <Calendar size={13} color={colors.textMuted} />
          <AppText variant="caption" color="textSecondary">
            {formatLongDate(record.completedAt)}
          </AppText>
        </View>
        <View style={[styles.row, { gap: 4 }]}>
          <Clock size={13} color={colors.textMuted} />
          <AppText variant="caption" color="textSecondary">
            {formatTime(record.completedAt)} · {formatDuration(record.durationSeconds)}
          </AppText>
        </View>
      </View>

      <AppText variant="caption" color="textMuted">
        {pluralize(record.initialPlayerCount, 'Player')} · {pluralize(record.initialImposterCount, 'Imposter')} ·{' '}
        {pluralize(record.totalClueCycles, 'Cycle')}
      </AppText>

      <View style={[styles.badge, { borderRadius: radius.pill, backgroundColor: winner.soft, gap: 6 }]}>
        <Trophy size={13} color={winner.color} />
        <AppText variant="label" style={{ color: winner.color }}>
          {winner.label}
        </AppText>
      </View>
    </AppPressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderLeftWidth: 5,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  flex: {
    flex: 1,
  },
  delete: {
    width: 34,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
});
