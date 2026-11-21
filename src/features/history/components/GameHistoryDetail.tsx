import { ArrowRight, Calendar, Clock, Scale, Trophy, UserX } from 'lucide-react-native';
import { ScrollView, StyleSheet, View } from 'react-native';

import { AppCard, AppText } from '@/components';
import type { GameHistory, GameHistoryPlayer } from '@/features/history/types/history.types';
import { PlayerAvatar } from '@/features/players/components/PlayerAvatar';
import { useTheme } from '@/hooks/useTheme';
import { roleColors } from '@/theme';
import { formatDuration, formatLongDate, formatMatchNumber, formatTime } from '@/utils/format';

import { MatchPlayersList } from './MatchPlayersList';
import { MatchStatsGrid } from './MatchStatsGrid';
import { RoleChip } from './RoleChip';

/** Read-only summary of a saved match. */
export function GameHistoryDetail({ record }: { record: GameHistory }) {
  const { colors, radius, spacing } = useTheme();
  const palette = record.winner === 'crew' ? roleColors.crewmate : roleColors.imposter;
  const byId = new Map(record.players.map((player) => [player.id, player]));
  const nameOf = (id: string | null) => (id ? (byId.get(id)?.name ?? 'Unknown') : '—');
  const eliminated = record.players
    .filter((player): player is GameHistoryPlayer & { eliminatedRound: number } => player.eliminatedRound !== undefined)
    .sort((a, b) => a.eliminatedRound - b.eliminatedRound);

  return (
    <ScrollView
      style={styles.flex}
      contentContainerStyle={{ gap: spacing.lg, paddingBottom: spacing.xl }}
      showsVerticalScrollIndicator={false}>
      {/* 1-3, 12: header — when, how long, winner, word */}
      <View style={[styles.banner, { gap: spacing.sm, padding: spacing.xl, borderRadius: radius.xl, backgroundImage: palette.gradient, borderColor: palette.border }]}>
        <AppText variant="label" style={{ color: palette.soft }}>
          {formatMatchNumber(record.matchNumber)}
        </AppText>
        <View style={[styles.row, { gap: spacing.xs }]}>
          <Trophy size={18} color="#FFFFFF" />
          <AppText variant="title" style={styles.white}>
            {record.winner === 'crew' ? 'CREWMATES WON' : 'IMPOSTERS WON'}
          </AppText>
        </View>
        <View style={[styles.row, { gap: spacing.md }]}>
          <View style={[styles.row, { gap: 4 }]}>
            <Calendar size={13} color={palette.soft} />
            <AppText variant="caption" style={{ color: palette.soft }}>
              {formatLongDate(record.completedAt)} · {formatTime(record.completedAt)}
            </AppText>
          </View>
          <View style={[styles.row, { gap: 4 }]}>
            <Clock size={13} color={palette.soft} />
            <AppText variant="caption" style={{ color: palette.soft }}>
              {formatDuration(record.durationSeconds)}
            </AppText>
          </View>
        </View>
      </View>

      {/* 3-4: secret word + categories */}
      <AppCard style={[styles.center, { gap: spacing.sm }]}>
        <AppText variant="label" color="textMuted">
          SECRET WORD
        </AppText>
        <AppText variant="title" align="center" style={styles.bold}>
          {record.secretWord.toLocaleUpperCase()}
        </AppText>
        <View style={[styles.chips, { gap: spacing.xs }]}>
          {record.categories.map((category) => (
            <View key={category.id} style={[styles.chip, { borderRadius: radius.pill, backgroundColor: colors.secondary }]}>
              <AppText variant="caption" style={{ color: colors.onSecondary }}>
                {category.name}
              </AppText>
            </View>
          ))}
        </View>
      </AppCard>

      {/* 5-6: players and roles */}
      <MatchPlayersList players={record.players} />

      {/* 7-8: eliminations */}
      <AppCard style={{ gap: spacing.md }}>
        <AppText variant="label" color="textMuted">
          ELIMINATIONS
        </AppText>
        {eliminated.length === 0 ? (
          <AppText color="textMuted">Nobody was eliminated.</AppText>
        ) : (
          eliminated.map((player) => (
            <View key={player.id} style={[styles.row, { gap: spacing.md }]}>
              <UserX size={16} color={colors.danger} />
              <AppText variant="caption" color="textMuted" style={styles.cycleCol}>
                Cycle {player.eliminatedRound}
              </AppText>
              <PlayerAvatar name={player.name} color={player.color} size={26} />
              <AppText variant="bodyStrong" style={styles.flex} numberOfLines={1}>
                {player.name}
              </AppText>
              <RoleChip role={player.role} />
            </View>
          ))
        )}
      </AppCard>

      {/* 9-11: every voting phase with individual votes */}
      {record.votingHistory.map((phase) => {
        const sortedCounts = Object.entries(phase.voteCounts)
          .filter(([, count]) => count > 0)
          .sort((a, b) => b[1] - a[1]);
        return (
          <AppCard key={phase.votingPhaseId} style={{ gap: spacing.sm }}>
            <View style={[styles.row, styles.between]}>
              <AppText variant="subheading">
                Vote {phase.phaseNumber} · Cycle {phase.cycleNumber}
              </AppText>
              {phase.isTie ? (
                <View style={[styles.row, styles.tag, { gap: 4, borderRadius: radius.pill, backgroundColor: colors.secondary }]}>
                  <Scale size={12} color={colors.warning} />
                  <AppText variant="label" style={{ color: colors.warning }}>
                    TIE
                  </AppText>
                </View>
              ) : (
                <AppText variant="caption" color="danger">
                  {nameOf(phase.eliminatedPlayerId)} out
                </AppText>
              )}
            </View>
            {phase.votes.map((vote) => (
              <View key={vote.voterId} style={[styles.row, { gap: spacing.sm }]}>
                <AppText variant="caption" style={styles.voteName} numberOfLines={1}>
                  {nameOf(vote.voterId)}
                </AppText>
                <ArrowRight size={12} color={colors.textMuted} />
                <AppText variant="caption" color="textSecondary" style={styles.voteName} numberOfLines={1}>
                  {nameOf(vote.votedForId)}
                </AppText>
              </View>
            ))}
            <AppText variant="caption" color="textMuted">
              Totals: {sortedCounts.map(([id, count]) => `${nameOf(id)} ${count}`).join(' · ')}
            </AppText>
          </AppCard>
        );
      })}

      <MatchStatsGrid record={record} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  between: {
    justifyContent: 'space-between',
  },
  center: {
    alignItems: 'center',
  },
  banner: {
    borderWidth: 2,
  },
  white: {
    color: '#FFFFFF',
    fontWeight: 900,
  },
  bold: {
    fontWeight: 900,
    letterSpacing: 1.5,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  tag: {
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  cycleCol: {
    width: 56,
  },
  voteName: {
    flexShrink: 1,
    maxWidth: '42%',
  },
});
