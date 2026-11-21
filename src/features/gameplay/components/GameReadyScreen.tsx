import { Lock, Play, Users, VenetianMask, type LucideIcon } from 'lucide-react-native';
import { ScrollView, StyleSheet, View } from 'react-native';
import Animated, { FadeInDown, ZoomIn } from 'react-native-reanimated';

import { AppButton, AppCard, AppText } from '@/components';
import { SelectedCategoriesSummary } from '@/features/game-setup/components/SelectedCategoriesSummary';
import { useGameSummary } from '@/features/gameplay/hooks/useGameSession';
import type { ClueRoundsPerCycle } from '@/features/gameplay/types/game.types';
import { useTheme } from '@/hooks/useTheme';
import { useGameSetupStore } from '@/store';
import { brandColors } from '@/theme';

import { ClueRoundsSelector } from './ClueRoundsSelector';
import { GameTopBar } from './GameTopBar';

interface GameReadyScreenProps {
  onStart: (clueRounds: ClueRoundsPerCycle) => void;
  onLeave: () => void;
}

function StatTile({ icon: Icon, value, label }: { icon: LucideIcon; value: number; label: string }) {
  const { colors, spacing } = useTheme();
  return (
    <AppCard padding="md" style={[styles.flex, styles.center, { gap: spacing.xs }]}>
      <Icon size={22} color={colors.accent} strokeWidth={2.4} />
      <AppText variant="title">{value}</AppText>
      <AppText variant="label" color="textMuted">
        {label}
      </AppText>
    </AppCard>
  );
}

/**
 * Shown after every player has seen their role. Public summary only:
 * never the word, imposter identities or individual roles.
 */
export function GameReadyScreen({ onStart, onLeave }: GameReadyScreenProps) {
  const { colors, spacing, scheme } = useTheme();
  const summary = useGameSummary();
  const clueRounds = useGameSetupStore((s) => s.clueRoundsPerCycle);
  const setClueRounds = useGameSetupStore((s) => s.setClueRoundsPerCycle);
  if (!summary) return null;

  return (
    <ScrollView
      style={styles.flex}
      contentContainerStyle={[styles.scroll, { gap: spacing.lg }]}
      showsVerticalScrollIndicator={false}>
      <GameTopBar onLeave={onLeave} />

      <Animated.View entering={ZoomIn.springify().damping(14)} style={[styles.center, { gap: spacing.sm }]}>
        <AppText
          variant="display"
          align="center"
          numberOfLines={2}
          adjustsFontSizeToFit
          style={[styles.title, scheme === 'dark' && styles.titleGlow]}>
          EVERYONE IS READY!
        </AppText>
        <AppText color="accent" align="center">
          Keep your secrets. The game is about to begin.
        </AppText>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(120).duration(350)} style={[styles.row, { gap: spacing.md }]}>
        <StatTile icon={Users} value={summary.playerCount} label="PLAYERS" />
        <StatTile
          icon={VenetianMask}
          value={summary.imposterCount}
          label={summary.imposterCount === 1 ? 'IMPOSTER' : 'IMPOSTERS'}
        />
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(200).duration(350)}>
        <SelectedCategoriesSummary categories={summary.categories} wordCount={summary.wordCount} />
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(280).duration(350)} style={[styles.row, { gap: spacing.sm }]}>
        <Lock size={16} color={colors.textMuted} />
        <AppText variant="caption" color="textMuted" style={styles.flexShrink}>
          Roles are hidden. Nobody should say their word out loud!
        </AppText>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(340).duration(350)}>
        <ClueRoundsSelector value={clueRounds} onChange={setClueRounds} />
      </Animated.View>

      <View style={styles.flex} />
      <AppButton title="START GAME" icon={Play} onPress={() => onStart(clueRounds)} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  scroll: {
    flexGrow: 1,
  },
  flexShrink: {
    flexShrink: 1,
  },
  center: {
    alignItems: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontWeight: 900,
    letterSpacing: 2,
  },
  titleGlow: {
    textShadowColor: brandColors.violetGlow,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 18,
  },
});
