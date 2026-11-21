import { StyleSheet, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { AppText } from '@/components';
import { PlayerAvatar } from '@/features/players/components/PlayerAvatar';
import type { Player } from '@/features/players/types';
import { useTheme } from '@/hooks/useTheme';

/** "IT'S YOUR TURN TO VOTE — NAME" header for the active voter. */
export function VoterCard({ voter }: { voter: Player }) {
  const { spacing } = useTheme();

  return (
    <Animated.View entering={FadeInDown.duration(300)} style={[styles.row, { gap: spacing.md }]}>
      <PlayerAvatar name={voter.name} color={voter.color} size={52} />
      <View style={styles.flex}>
        <AppText variant="label" color="accent">
          IT&apos;S YOUR TURN TO VOTE
        </AppText>
        <AppText variant="title" numberOfLines={1} adjustsFontSizeToFit style={styles.name}>
          {voter.name.toLocaleUpperCase()}
        </AppText>
        <AppText variant="caption" color="textSecondary">
          Who do you think is the Imposter?
        </AppText>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  flex: {
    flex: 1,
  },
  name: {
    fontWeight: 900,
  },
});
