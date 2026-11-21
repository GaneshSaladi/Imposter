import { ShieldCheck, Trophy, VenetianMask, X } from 'lucide-react-native';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components';
import { RoleIllustration } from '@/features/gameplay/components/RoleIllustration';
import type { TeamCount, WinCondition, WinExample } from '@/features/how-to-play/constants/howToPlayContent';
import { useTheme } from '@/hooks/useTheme';
import { roleColors } from '@/theme';

const IMPOSTER_RED = '#FF9AA8';
const CREW_LAVENDER = '#E6DDFF';

/** Icons for a head count: masks = Imposters, shields = Crewmates. */
function TeamIcons({ count }: { count: TeamCount }) {
  const caught = count.caughtImposters ?? 0;
  return (
    <View style={styles.icons}>
      {Array.from({ length: caught }, (_, i) => (
        <View key={`caught-${i}`} style={styles.caught}>
          <VenetianMask size={20} color={IMPOSTER_RED} />
          <View style={styles.cross}>
            <X size={22} color="#FFFFFF" strokeWidth={3} />
          </View>
        </View>
      ))}
      {Array.from({ length: count.imposters }, (_, i) => (
        <VenetianMask key={`imp-${i}`} size={20} color={IMPOSTER_RED} />
      ))}
      <AppText variant="caption" style={styles.vs}>
        vs
      </AppText>
      {Array.from({ length: count.crewmates }, (_, i) => (
        <ShieldCheck key={`crew-${i}`} size={20} color={CREW_LAVENDER} />
      ))}
    </View>
  );
}

function ExampleRow({ example, accent }: { example: WinExample; accent: string }) {
  const { radius, spacing } = useTheme();
  return (
    <View
      style={[styles.example, { gap: spacing.xs, padding: spacing.md, borderRadius: radius.md }]}
      accessible
      accessibilityLabel={`${example.label}: ${example.result}`}>
      <AppText variant="caption" style={styles.soft}>
        {example.label}
      </AppText>
      <View style={styles.exampleRow}>
        <TeamIcons count={example.count} />
        <View
          style={[
            styles.result,
            { borderRadius: radius.pill, backgroundColor: example.isWin ? '#FFFFFF' : 'rgba(255, 255, 255, 0.18)' },
          ]}>
          <AppText variant="label" style={{ color: example.isWin ? accent : '#FFFFFF' }}>
            {example.result}
          </AppText>
        </View>
      </View>
    </View>
  );
}

/** Big, high-emphasis card explaining one side's win condition. */
export function WinConditionCard({ condition }: { condition: WinCondition }) {
  const { radius, spacing } = useTheme();
  const role = condition.side === 'crew' ? 'crewmate' : 'imposter';
  const palette = roleColors[role];
  const accent = condition.side === 'crew' ? '#5233C7' : '#B81F3B';

  return (
    <View
      style={[
        styles.card,
        {
          gap: spacing.md,
          padding: spacing.xl,
          borderRadius: radius.xl,
          backgroundImage: palette.gradient,
          borderColor: palette.border,
          boxShadow: `0 12px 32px ${palette.glow}`,
        },
      ]}>
      <View style={[styles.header, { gap: spacing.md }]}>
        <RoleIllustration role={role} size={72} />
        <View style={styles.flex}>
          <View style={[styles.titleRow, { gap: spacing.xs }]}>
            <Trophy size={18} color="#FFFFFF" />
            <AppText variant="title" style={styles.title} accessibilityRole="header">
              {condition.title}
            </AppText>
          </View>
          <AppText variant="bodyStrong" style={{ color: palette.soft }}>
            {condition.subtitle}
          </AppText>
        </View>
      </View>

      <View style={[styles.rule, { padding: spacing.md, borderRadius: radius.md, backgroundColor: palette.panel }]}>
        <AppText variant="subheading" style={styles.white}>
          {condition.rule}
        </AppText>
      </View>

      <AppText variant="label" style={{ color: palette.soft }}>
        {condition.examples.length === 1 ? 'EXAMPLE' : 'EXAMPLES'}
      </AppText>
      <View style={{ gap: spacing.sm }}>
        {condition.examples.map((example) => (
          <ExampleRow key={example.label} example={example} accent={accent} />
        ))}
      </View>

      {condition.highlight ? (
        <AppText variant="bodyStrong" style={styles.white}>
          {condition.highlight}
        </AppText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  flex: {
    flex: 1,
  },
  title: {
    color: '#FFFFFF',
    fontWeight: 900,
    letterSpacing: 1,
  },
  white: {
    color: '#FFFFFF',
  },
  soft: {
    color: 'rgba(255, 255, 255, 0.85)',
  },
  rule: {
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
  },
  example: {
    backgroundColor: 'rgba(0, 0, 0, 0.22)',
  },
  exampleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 8,
  },
  icons: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 4,
  },
  vs: {
    color: '#FFFFFF',
    fontWeight: 800,
    marginHorizontal: 4,
  },
  caught: {
    opacity: 0.6,
  },
  cross: {
    position: 'absolute',
    top: -1,
    left: -1,
  },
  result: {
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
});
