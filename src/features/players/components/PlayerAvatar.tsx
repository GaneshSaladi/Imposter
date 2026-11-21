import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components';
import { ON_PLAYER_COLOR } from '@/features/players/constants/playerColors';

interface PlayerAvatarProps {
  name: string;
  color: string;
  size?: number;
}

/** Colored circle with the player's initial. */
export function PlayerAvatar({ name, color, size = 44 }: PlayerAvatarProps) {
  const initial = Array.from(name.trim())[0]?.toLocaleUpperCase() ?? '?';

  return (
    <View
      style={[styles.circle, { width: size, height: size, borderRadius: size / 2, backgroundColor: color }]}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants">
      <AppText
        variant="heading"
        style={{ color: ON_PLAYER_COLOR, fontSize: size * 0.45, lineHeight: size * 0.55 }}>
        {initial}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  circle: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
