import { Repeat, Users, VenetianMask, type LucideIcon } from 'lucide-react-native';
import { ScrollView, StyleSheet, View } from 'react-native';
import Animated, { FadeInDown, ZoomIn } from 'react-native-reanimated';

import { AppButton, AppCard, AppText } from '@/components';
import type { GameEngineView } from '@/features/gameplay/hooks/useGameEngine';
import { useTheme } from '@/hooks/useTheme';
import { brandColors } from '@/theme';

import { PlayerOrderRow } from './PlayerOrderRow';

interface NextCycleScreenProps {
  game: GameEngineView;
}

function Stat({ icon: Icon, value, label }: { icon: LucideIcon; value: number; label: string }) {
  const { colors, spacing } = useTheme();
  return (
    <AppCard padding="md" style={[styles.flex, styles.center, { gap: 2 }]}>
      <Icon size={20} color={colors.accent} />
      <AppText variant="title">{value}</AppText>
      <AppText variant="label" color="textMuted" style={{ marginTop: spacing.xxs }}>
        {label}
      </AppText>
    </AppCard>
  );
}

/** Between cycles: who's still in, who's out (with their revealed role). */
export function NextCycleScreen({ game }: NextCycleScreenProps) {
  const { spacing, scheme } = useTheme();
  const wasTie = game.votingPhase?.result?.isTie ?? false;
  const nextCycle = (game.cycle?.cycleNumber ?? 0) + 1;

  return (
    <View style={[styles.flex, { gap: spacing.lg }]}>
      <Animated.View entering={ZoomIn.springify().damping(13)} style={[styles.center, { gap: spacing.xs }]}>
        <AppText variant="title" align="center" style={[styles.bold, scheme === 'dark' && styles.glow]}>
          {wasTie ? 'NO ONE WAS ELIMINATED!' : 'THE GAME CONTINUES!'}
        </AppText>
        <AppText color="accent" align="center">
          {wasTie ? "Let's try another round." : "Who's hiding the secret now?"}
        </AppText>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(100).duration(350)} style={[styles.row, { gap: spacing.md }]}>
        <Stat icon={Users} value={game.activePlayers.length} label="PLAYERS LEFT" />
        <Stat
          icon={VenetianMask}
          value={game.remainingImposters}
          label={game.remainingImposters === 1 ? 'IMPOSTER HIDING' : 'IMPOSTERS HIDING'}
        />
      </Animated.View>

      <ScrollView style={styles.flex} contentContainerStyle={{ gap: spacing.sm }} showsVerticalScrollIndicator={false}>
        <AppText variant="label" color="textMuted">
          STILL IN THE GAME · NEW SPEAKING ORDER ON THE NEXT SCREEN
        </AppText>
        {/* Plain list (no position numbers) so it isn't mistaken for the speaking order. */}
        {game.activePlayers.map((player, index) => (
          <Animated.View key={player.id} entering={FadeInDown.delay(150 + index * 50).duration(300)}>
            <PlayerOrderRow player={player} state="upcoming" />
          </Animated.View>
        ))}
        {game.eliminatedPlayers.length > 0 ? (
          <>
            <AppText variant="label" color="textMuted" style={{ marginTop: spacing.sm }}>
              ELIMINATED
            </AppText>
            {game.eliminatedPlayers.map((player) => (
              <PlayerOrderRow
                key={player.id}
                player={player}
                state="eliminated"
                note={player.revealedRole === 'imposter' ? 'Imposter' : 'Crewmate'}
              />
            ))}
          </>
        ) : null}
      </ScrollView>

      <AppButton title={`START CYCLE ${nextCycle}`} icon={Repeat} onPress={() => game.actions.startNextCycle()} />
    </View>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  center: {
    alignItems: 'center',
  },
  row: {
    flexDirection: 'row',
  },
  bold: {
    fontWeight: 900,
    letterSpacing: 1.5,
  },
  glow: {
    textShadowColor: brandColors.violetGlow,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 16,
  },
});
