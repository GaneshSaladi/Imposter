import { Eye, Smartphone } from 'lucide-react-native';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

import { AppButton, AppCard, AppText } from '@/components';
import { PlayerAvatar } from '@/features/players/components/PlayerAvatar';
import type { Player } from '@/features/players/types';
import { useTheme } from '@/hooks/useTheme';
import { brandColors } from '@/theme';

interface PlayerHandoverScreenProps {
  player: Player;
  /** The player who just finished, or null for the first turn. */
  previousPlayer: Player | null;
  onReady: () => void;
  /** Labels, so the same handover works for role reveal and voting. */
  firstLabel?: string;
  nextLabel?: string;
  readyLabel?: string;
}

/** "Pass the phone" step between turns. Shows names only — never roles or votes. */
export function PlayerHandoverScreen({
  player,
  previousPlayer,
  onReady,
  firstLabel = 'FIRST PLAYER',
  nextLabel = 'NEXT PLAYER',
  readyLabel = 'READY TO REVEAL',
}: PlayerHandoverScreenProps) {
  const { colors, radius, spacing } = useTheme();

  return (
    <Animated.View entering={FadeIn.duration(300)} style={[styles.root, { gap: spacing.xl }]}>
      <View style={[styles.center, { gap: spacing.md }]}>
        <View style={[styles.iconBubble, { borderRadius: radius.pill, backgroundColor: colors.secondary }]}>
          <Smartphone size={36} color={colors.accent} strokeWidth={2.2} />
        </View>
        <AppText variant="title" align="center" style={styles.heading}>
          PASS THE PHONE
        </AppText>
      </View>

      <AppCard elevated style={[styles.center, { gap: spacing.sm }]}>
        <AppText variant="label" color="textMuted">
          {previousPlayer ? nextLabel : firstLabel}
        </AppText>
        <PlayerAvatar name={player.name} color={player.color} size={64} />
        <AppText variant="title" align="center" numberOfLines={1} adjustsFontSizeToFit>
          {player.name.toLocaleUpperCase()}
        </AppText>
      </AppCard>

      <AppText color="textSecondary" align="center">
        {previousPlayer
          ? `Make sure ${previousPlayer.name} cannot see your screen.`
          : 'Hand the phone over and make sure nobody else is looking.'}
      </AppText>

      <AppButton title={readyLabel} icon={Eye} onPress={onReady} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: {
    alignSelf: 'stretch',
  },
  center: {
    alignItems: 'center',
  },
  iconBubble: {
    width: 76,
    height: 76,
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: `0 0 28px ${brandColors.violetGlow}`,
  },
  heading: {
    letterSpacing: 2,
    fontWeight: 900,
  },
});
