import {
  Clock,
  Layers,
  Repeat,
  Scale,
  UserX,
  Users,
  VenetianMask,
  Vote,
  type LucideIcon,
} from 'lucide-react-native';
import { StyleSheet, View } from 'react-native';

import { AppCard, AppText } from '@/components';
import type { GameHistory } from '@/features/history/types/history.types';
import { useTheme } from '@/hooks/useTheme';
import { formatDuration } from '@/utils/format';

function StatTile({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: string }) {
  const { colors, radius, spacing } = useTheme();
  return (
    <View style={[styles.tile, { gap: 2, padding: spacing.md, borderRadius: radius.md, backgroundColor: colors.background }]}>
      <Icon size={16} color={colors.accent} />
      <AppText variant="heading">{value}</AppText>
      <AppText variant="caption" color="textMuted" numberOfLines={1}>
        {label}
      </AppText>
    </View>
  );
}

/** Match statistics, computed from the saved record. */
export function MatchStatsGrid({ record }: { record: GameHistory }) {
  const { spacing } = useTheme();
  const stats: { icon: LucideIcon; label: string; value: string }[] = [
    { icon: Users, label: 'Players', value: String(record.initialPlayerCount) },
    { icon: VenetianMask, label: 'Imposters', value: String(record.initialImposterCount) },
    { icon: Repeat, label: 'Clue cycles', value: String(record.totalClueCycles) },
    { icon: Layers, label: 'Rounds / cycle', value: String(record.clueRoundsPerCycle) },
    { icon: Vote, label: 'Voting phases', value: String(record.totalVotingPhases) },
    { icon: UserX, label: 'Eliminations', value: String(record.totalEliminations) },
    { icon: Scale, label: 'Tied votes', value: String(record.totalTiedVotes) },
    { icon: Clock, label: 'Duration', value: formatDuration(record.durationSeconds) },
  ];

  return (
    <AppCard style={{ gap: spacing.md }}>
      <AppText variant="label" color="textMuted">
        MATCH STATS
      </AppText>
      <View style={[styles.grid, { gap: spacing.sm }]}>
        {stats.map((stat) => (
          <StatTile key={stat.label} {...stat} />
        ))}
      </View>
    </AppCard>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tile: {
    flexGrow: 1,
    flexBasis: '45%',
  },
});
