import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components';
import { RoleIllustration } from '@/features/gameplay/components/RoleIllustration';
import type { RoleType } from '@/features/gameplay/types/game.types';
import { ROLE_CARDS } from '@/features/how-to-play/constants/howToPlayContent';
import { useTheme } from '@/hooks/useTheme';
import { roleColors } from '@/theme';

interface RoleCardsProps {
  /** compact = side by side summary; detailed = stacked with full explanation. */
  variant: 'compact' | 'detailed';
}

const ROLES: readonly { role: RoleType; content: (typeof ROLE_CARDS)[keyof typeof ROLE_CARDS] }[] = [
  { role: 'crewmate', content: ROLE_CARDS.crew },
  { role: 'imposter', content: ROLE_CARDS.imposter },
];

/** Crewmate (purple) vs Imposter (red), using the same artwork as the game. */
export function RoleCards({ variant }: RoleCardsProps) {
  const { radius, spacing } = useTheme();
  const compact = variant === 'compact';

  return (
    <View style={[compact ? styles.row : styles.column, { gap: spacing.md }]}>
      {ROLES.map(({ role, content }) => {
        const palette = roleColors[role];
        return (
          <View
            key={role}
            style={[
              compact ? styles.compactCard : styles.detailedCard,
              {
                gap: spacing.sm,
                padding: spacing.md,
                borderRadius: radius.lg,
                backgroundImage: palette.gradient,
                borderColor: palette.border,
              },
            ]}
            accessible
            accessibilityLabel={`${content.title}. ${content.tagline}. ${compact ? content.goal : content.detail}`}>
            <RoleIllustration role={role} size={compact ? 64 : 72} />
            <View style={[styles.flex, compact && styles.center]}>
              <AppText variant="subheading" style={styles.title}>
                {content.title}
              </AppText>
              <AppText variant="caption" style={{ color: palette.soft }} align={compact ? 'center' : 'left'}>
                {content.tagline}
              </AppText>
              <AppText variant="caption" style={[styles.white, { marginTop: spacing.xs }]} align={compact ? 'center' : 'left'}>
                {compact ? content.goal : content.detail}
              </AppText>
            </View>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
  },
  column: {
    flexDirection: 'column',
  },
  flex: {
    flexShrink: 1,
  },
  center: {
    alignItems: 'center',
  },
  compactCard: {
    flex: 1,
    alignItems: 'center',
    borderWidth: 1,
  },
  detailedCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
  },
  title: {
    color: '#FFFFFF',
    fontWeight: 900,
    letterSpacing: 1.5,
  },
  white: {
    color: '#FFFFFF',
  },
});
