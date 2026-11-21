import { BookOpen, Gamepad2, Trophy } from 'lucide-react-native';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { AppButton, AppCard, AppText } from '@/components';
import {
  CLOSING,
  INTRO,
  OBJECTIVE,
  STEPS,
  WIN_CONDITIONS,
} from '@/features/how-to-play/constants/howToPlayContent';
import { useTheme } from '@/hooks/useTheme';
import { brandColors } from '@/theme';

import { InstructionCard } from './InstructionCard';
import { QuickRules } from './QuickRules';
import { RoleCards } from './RoleCards';
import { WinConditionCard } from './WinConditionCard';

/** Staggered entrance for the first few sections; later ones just appear. */
const enter = (index: number) => FadeInDown.delay(Math.min(index, 5) * 70).duration(350);

interface HowToPlayGuideProps {
  onDone: () => void;
}

/** The full How to Play guide. Purely informational — touches no game state. */
export function HowToPlayGuide({ onDone }: HowToPlayGuideProps) {
  const { colors, radius, spacing, scheme } = useTheme();

  return (
    <View style={{ gap: spacing.lg }}>
      <Animated.View entering={enter(0)} style={[styles.center, { gap: spacing.sm }]}>
        <View style={[styles.iconBubble, { borderRadius: radius.pill, backgroundColor: colors.secondary }]}>
          <BookOpen size={30} color={colors.accent} />
        </View>
        <AppText variant="title" align="center" style={[styles.heading, scheme === 'dark' && styles.glow]}>
          {INTRO.title}
        </AppText>
        <AppText color="textSecondary" align="center">
          {INTRO.subtitle}
        </AppText>
      </Animated.View>

      <Animated.View entering={enter(1)}>
        <AppCard style={{ gap: spacing.md }}>
          <AppText variant="heading" accessibilityRole="header">
            {OBJECTIVE.title}
          </AppText>
          <AppText color="textSecondary">{OBJECTIVE.text}</AppText>
          <RoleCards variant="compact" />
        </AppCard>
      </Animated.View>

      {STEPS.map((step, index) => (
        <Animated.View key={step.id} entering={enter(index + 2)}>
          <InstructionCard step={step} />
        </Animated.View>
      ))}

      {/* The most important part — visually set apart from the steps. */}
      <View style={[styles.center, { gap: spacing.xs, marginTop: spacing.md }]}>
        <View style={[styles.row, { gap: spacing.sm }]}>
          <Trophy size={26} color={colors.warning} />
          <AppText variant="title" style={[styles.heading, scheme === 'dark' && styles.glow]} accessibilityRole="header">
            HOW TO WIN
          </AppText>
        </View>
        <AppText color="accent" align="center">
          The most important rules — read these twice!
        </AppText>
      </View>
      {WIN_CONDITIONS.map((condition) => (
        <WinConditionCard key={condition.side} condition={condition} />
      ))}

      <QuickRules />

      <View style={[styles.center, { gap: spacing.sm, marginTop: spacing.sm }]}>
        <AppButton title={CLOSING.button} icon={Gamepad2} onPress={onDone} />
        <AppText variant="caption" color="textMuted" align="center">
          {CLOSING.note}
        </AppText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    alignItems: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconBubble: {
    width: 64,
    height: 64,
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: `0 0 24px ${brandColors.violetGlow}`,
  },
  heading: {
    fontWeight: 900,
    letterSpacing: 2,
  },
  glow: {
    textShadowColor: brandColors.violetGlow,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 16,
  },
});
