import { Check, EyeOff } from 'lucide-react-native';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components';
import type { RoleType } from '@/features/gameplay/types/game.types';
import { useTheme } from '@/hooks/useTheme';
import { roleColors } from '@/theme';

import { CardActionButton } from './CardActionButton';
import { RoleIllustration } from './RoleIllustration';

export interface RoleCardLayoutProps {
  role: RoleType;
  eyebrow: string;
  title: string;
  panelLabel: string;
  panelText: string;
  reminder: string;
  illustrationSize: number;
  onGotIt: () => void;
  gotItEnabled: boolean;
}

const BUTTON_TEXT: Record<RoleType, string> = {
  crewmate: '#5233C7',
  imposter: '#B81F3B',
};

/** Shared visual structure of the revealed (back) side of a role card. */
export function RoleCardLayout({
  role,
  eyebrow,
  title,
  panelLabel,
  panelText,
  reminder,
  illustrationSize,
  onGotIt,
  gotItEnabled,
}: RoleCardLayoutProps) {
  const { radius, spacing } = useTheme();
  const palette = roleColors[role];

  return (
    <View
      style={[
        styles.card,
        {
          borderRadius: radius.xl,
          padding: spacing.xl,
          gap: spacing.md,
          backgroundImage: palette.gradient,
          borderColor: palette.border,
          boxShadow: `0 12px 36px ${palette.glow}`,
        },
      ]}>
      {/* Soft decorative bubbles */}
      <View style={[styles.bubble, styles.bubbleTop]} pointerEvents="none" />
      <View style={[styles.bubble, styles.bubbleBottom]} pointerEvents="none" />

      <View style={styles.center}>
        <AppText variant="label" style={[styles.eyebrow, { color: palette.soft }]}>
          {eyebrow}
        </AppText>
        <AppText
          variant="display"
          align="center"
          numberOfLines={1}
          adjustsFontSizeToFit
          style={[styles.title, { textShadowColor: palette.glow }]}>
          {title}
        </AppText>
      </View>

      <View style={styles.center}>
        <View
          style={[
            styles.halo,
            { width: illustrationSize * 1.1, height: illustrationSize * 1.1, borderRadius: illustrationSize },
          ]}>
          <RoleIllustration role={role} size={illustrationSize} />
        </View>
      </View>

      <View
        style={[
          styles.panel,
          { backgroundColor: palette.panel, borderRadius: radius.lg, padding: spacing.lg, gap: spacing.xs },
        ]}>
        <AppText variant="caption" align="center" style={{ color: palette.soft }}>
          {panelLabel}
        </AppText>
        <AppText
          variant="title"
          align="center"
          numberOfLines={2}
          adjustsFontSizeToFit
          minimumFontScale={0.5}
          style={styles.panelText}>
          {panelText}
        </AppText>
      </View>

      <View style={styles.flex} />

      <View style={[styles.reminder, { gap: spacing.sm }]}>
        <EyeOff size={16} color={palette.soft} />
        <AppText variant="caption" style={[styles.flexShrink, { color: palette.soft }]}>
          {reminder}
        </AppText>
      </View>

      <CardActionButton
        title="GOT IT"
        icon={Check}
        color={BUTTON_TEXT[role]}
        onPress={onGotIt}
        disabled={!gotItEnabled}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    overflow: 'hidden',
    borderWidth: 2,
  },
  flex: {
    flex: 1,
  },
  flexShrink: {
    flexShrink: 1,
  },
  center: {
    alignItems: 'center',
  },
  eyebrow: {
    letterSpacing: 3,
  },
  title: {
    color: '#FFFFFF',
    fontWeight: 900,
    letterSpacing: 2,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 16,
  },
  halo: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  panel: {
    alignSelf: 'stretch',
  },
  panelText: {
    color: '#FFFFFF',
    fontWeight: 900,
    letterSpacing: 1,
  },
  reminder: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bubble: {
    position: 'absolute',
    borderRadius: 999,
    backgroundColor: 'rgba(255, 255, 255, 0.07)',
  },
  bubbleTop: {
    width: 180,
    height: 180,
    top: -60,
    right: -50,
  },
  bubbleBottom: {
    width: 140,
    height: 140,
    bottom: 40,
    left: -60,
  },
});
