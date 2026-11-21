import { StyleSheet } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

import { SettleGate } from '@/components';
import { useGameEngine, type GameEngineView } from '@/features/gameplay/hooks/useGameEngine';

import { ClueRoundScreen } from './ClueRoundScreen';
import { EliminationScreen } from './EliminationScreen';
import { NextCycleScreen } from './NextCycleScreen';
import { SpeakingOrderScreen } from './SpeakingOrderScreen';
import { VotingResultsScreen } from './VotingResultsScreen';
import { VotingScreen } from './VotingScreen';

function PhaseView({ game }: { game: GameEngineView }) {
  switch (game.status) {
    case 'speaking-order':
      return <SpeakingOrderScreen game={game} />;
    case 'clue-round':
      return <ClueRoundScreen game={game} />;
    case 'voting':
      return <VotingScreen game={game} />;
    case 'vote-results':
      return <VotingResultsScreen game={game} />;
    case 'elimination':
      return <EliminationScreen game={game} />;
    case 'next-cycle':
      return <NextCycleScreen game={game} />;
    default:
      // preparing / role-reveal / ready / completed are handled by other routes.
      return null;
  }
}

/**
 * Renders the screen for the current game status. Phases switch in place
 * (no navigation), so the back stack can never lead into an earlier phase.
 */
export function GameFlowScreen() {
  const game = useGameEngine();
  if (!game) return null;

  return (
    <Animated.View key={game.status} entering={FadeIn.duration(250)} style={styles.flex}>
      {/* A double tap must not hit the next phase's button. */}
      <SettleGate>
        <PhaseView game={game} />
      </SettleGate>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
});
