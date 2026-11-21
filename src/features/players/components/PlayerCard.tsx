import { X } from 'lucide-react-native';
import { StyleSheet, View } from 'react-native';

import { AppPressable, AppText } from '@/components';
import { HitSlop } from '@/constants/dimensions';
import type { Player } from '@/features/players/types';
import { useTheme } from '@/hooks/useTheme';

import { PlayerAvatar } from './PlayerAvatar';

interface PlayerCardProps {
  player: Player;
  position: number;
  onRemove: (player: Player) => void;
}

export function PlayerCard({ player, position, onRemove }: PlayerCardProps) {
  const { colors, radius, spacing } = useTheme();

  return (
    <View
      style={[
        styles.card,
        {
          gap: spacing.md,
          padding: spacing.md,
          borderRadius: radius.lg,
          backgroundColor: colors.surface,
          borderColor: colors.border,
          borderLeftColor: player.color,
        },
      ]}>
      <PlayerAvatar name={player.name} color={player.color} />
      <View style={styles.flex}>
        <AppText variant="subheading" numberOfLines={1}>
          {player.name}
        </AppText>
        <AppText variant="caption" color="textMuted">
          Player {position}
        </AppText>
      </View>
      <AppPressable
        onPress={() => onRemove(player)}
        hitSlop={HitSlop}
        pressedScale={0.85}
        accessibilityRole="button"
        accessibilityLabel={`Remove ${player.name}`}
        style={({ pressed }) => [
          styles.remove,
          { borderRadius: radius.pill, backgroundColor: pressed ? colors.secondaryPressed : colors.secondary },
        ]}>
        <X size={18} color={colors.textSecondary} strokeWidth={2.6} />
      </AppPressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderLeftWidth: 5,
  },
  flex: {
    flex: 1,
  },
  remove: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
