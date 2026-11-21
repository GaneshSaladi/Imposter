import { House, PartyPopper, RotateCcw } from 'lucide-react-native';
import { useEffect } from 'react';
import { ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';
import Animated, { FadeInDown, ZoomIn } from 'react-native-reanimated';

import { AppButton, AppCard, AppText } from '@/components';
import { MatchPlayersList } from '@/features/history/components/MatchPlayersList';
import { MatchStatsGrid } from '@/features/history/components/MatchStatsGrid';
import type { GameHistory } from '@/features/history/types/history.types';
import { useTheme } from '@/hooks/useTheme';
import { feedbackService } from '@/services/feedback/feedbackService';
import { roleColors } from '@/theme';
import { formatMatchNumber } from '@/utils/format';

import { RoleIllustration } from './RoleIllustration';

interface GameResultsScreenProps {
  record: GameHistory;
  onPlayAgain: () => void;
  onHome: () => void;
}

const COPY = {
  crew: { title: 'CREWMATES WIN!', subtitle: 'All imposters have been caught!' },
  imposter: { title: 'IMPOSTERS WIN!', subtitle: 'The imposters successfully fooled everyone!' },
} as const;

/** Final reveal: winner, secret word, every role, and the match stats. */
export function GameResultsScreen({ record, onPlayAgain, onHome }: GameResultsScreenProps) {
  const { colors, radius, spacing } = useTheme();
  const { width, height } = useWindowDimensions();
  const palette = record.winner === 'crew' ? roleColors.crewmate : roleColors.imposter;
  const imposters = record.players.filter((player) => player.role === 'imposter');
  const illustrationSize = Math.min(width * 0.36, height * 0.18, 160);

  // One celebratory cue per finished game.
  useEffect(() => {
    feedbackService.success();
  }, [record.id]);

  return (
    <View style={[styles.flex, { gap: spacing.md }]}>
      <ScrollView style={styles.flex} contentContainerStyle={{ gap: spacing.lg }} showsVerticalScrollIndicator={false}>
        <Animated.View
          entering={ZoomIn.springify().damping(12)}
          style={[
            styles.banner,
            {
              gap: spacing.sm,
              padding: spacing.xl,
              borderRadius: radius.xl,
              backgroundImage: palette.gradient,
              borderColor: palette.border,
              boxShadow: `0 14px 40px ${palette.glow}`,
            },
          ]}>
          <View style={[styles.row, { gap: spacing.xs }]}>
            <PartyPopper size={16} color={palette.soft} />
            <AppText variant="label" style={{ color: palette.soft }}>
              {record.matchNumber > 0 ? formatMatchNumber(record.matchNumber) : 'GAME OVER'}
            </AppText>
          </View>
          <RoleIllustration role={record.winner === 'crew' ? 'crewmate' : 'imposter'} size={illustrationSize} />
          <AppText variant="display" align="center" numberOfLines={1} adjustsFontSizeToFit style={styles.bannerTitle}>
            {COPY[record.winner].title}
          </AppText>
          <AppText align="center" style={{ color: palette.soft }}>
            {COPY[record.winner].subtitle}
          </AppText>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(200).duration(400)}>
          <AppCard style={[styles.center, { gap: spacing.sm }]}>
            <AppText variant="label" color="textMuted">
              THE SECRET WORD WAS
            </AppText>
            <AppText variant="display" align="center" numberOfLines={2} adjustsFontSizeToFit style={styles.word}>
              {record.secretWord.toLocaleUpperCase()}
            </AppText>
            <AppText variant="caption" color="textSecondary" align="center">
              {imposters.length === 1 ? 'The imposter was ' : 'The imposters were '}
              <AppText variant="caption" style={{ color: colors.danger, fontWeight: 800 }}>
                {imposters.map((player) => player.name).join(' & ')}
              </AppText>
            </AppText>
            <View style={[styles.chips, { gap: spacing.xs }]}>
              {record.categories.map((category) => (
                <View
                  key={category.id}
                  style={[styles.chip, { borderRadius: radius.pill, backgroundColor: colors.secondary }]}>
                  <AppText variant="caption" style={{ color: colors.onSecondary }}>
                    {category.name}
                  </AppText>
                </View>
              ))}
            </View>
          </AppCard>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(300).duration(400)}>
          <MatchPlayersList players={record.players} />
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(400).duration(400)}>
          <MatchStatsGrid record={record} />
        </Animated.View>
      </ScrollView>

      <View style={{ gap: spacing.sm }}>
        <AppButton title="PLAY AGAIN" icon={RotateCcw} onPress={onPlayAgain} />
        <AppButton title="BACK TO HOME" icon={House} variant="ghost" onPress={onHome} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  center: {
    alignItems: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  banner: {
    alignItems: 'center',
    borderWidth: 2,
  },
  bannerTitle: {
    color: '#FFFFFF',
    fontWeight: 900,
    letterSpacing: 2,
  },
  word: {
    fontWeight: 900,
    letterSpacing: 2,
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
});
