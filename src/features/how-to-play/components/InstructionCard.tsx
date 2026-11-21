import { StyleSheet, View } from 'react-native';

import { AppCard, AppText } from '@/components';
import type { InstructionStep } from '@/features/how-to-play/constants/howToPlayContent';
import { useTheme } from '@/hooks/useTheme';

import { HighlightCallout } from './HighlightCallout';
import { RoleCards } from './RoleCards';
import { useToneColors } from './tones';

/** One numbered step of the game, rendered from the content data. */
export function InstructionCard({ step }: { step: InstructionStep }) {
  const { colors, radius, spacing } = useTheme();
  const tones = useToneColors();
  const Icon = step.icon;

  return (
    <AppCard style={{ gap: spacing.md }}>
      <View style={[styles.row, { gap: spacing.md }]}>
        <View style={[styles.badge, { borderRadius: radius.pill, backgroundColor: colors.primary }]}>
          <AppText variant="bodyStrong" style={{ color: colors.onPrimary }}>
            {step.step}
          </AppText>
        </View>
        <AppText variant="heading" style={styles.flex} accessibilityRole="header">
          {step.title}
        </AppText>
        <Icon size={22} color={colors.accent} />
      </View>

      {step.intro ? <AppText color="textSecondary">{step.intro}</AppText> : null}

      {step.bullets ? (
        <View style={{ gap: spacing.sm }}>
          {step.bullets.map((bullet) => (
            <View key={bullet} style={[styles.row, styles.top, { gap: spacing.sm }]}>
              <View style={[styles.dot, { backgroundColor: colors.accent }]} />
              <AppText style={styles.flex}>{bullet}</AppText>
            </View>
          ))}
        </View>
      ) : null}

      {step.showRoleCards ? <RoleCards variant="detailed" /> : null}

      {step.outcomes ? (
        <View style={{ gap: spacing.sm }}>
          {step.outcomes.map((outcome) => {
            const tone = tones[outcome.tone];
            const OutcomeIcon = outcome.icon;
            return (
              <View
                key={outcome.title}
                style={[styles.row, styles.top, { gap: spacing.md, padding: spacing.md, borderRadius: radius.md, backgroundColor: tone.soft }]}>
                <OutcomeIcon size={20} color={tone.accent} />
                <View style={styles.flex}>
                  <AppText variant="bodyStrong" style={{ color: tone.accent }}>
                    {outcome.title}
                  </AppText>
                  <AppText variant="caption" color="textSecondary">
                    {outcome.text}
                  </AppText>
                </View>
              </View>
            );
          })}
        </View>
      ) : null}

      {step.highlight ? <HighlightCallout highlight={step.highlight} /> : null}
    </AppCard>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  top: {
    alignItems: 'flex-start',
  },
  flex: {
    flex: 1,
  },
  badge: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    marginTop: 8,
  },
});
