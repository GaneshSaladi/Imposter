import { useEffect, useEffectEvent, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

import { SettleGate } from '@/components';
import { useRevealProgress } from '@/features/gameplay/hooks/useGameSession';
import type { Player } from '@/features/players/types';
import { useTheme } from '@/hooks/useTheme';

import { GameTopBar } from './GameTopBar';
import { PlayerHandoverScreen } from './PlayerHandoverScreen';
import { RevealProgress } from './RevealProgress';
import { RoleRevealCard } from './RoleRevealCard';

interface PlayerRevealScreenProps {
  /** Called once, after the last player pressed Got It. */
  onComplete: () => void;
  onLeave: () => void;
}

/**
 * Walks the shuffled reveal order. Each player's turn is a separate keyed
 * component, so finishing a turn unmounts everything secret it showed and
 * the next turn starts fresh (handover → name card → flip).
 */
export function PlayerRevealScreen({ onComplete, onLeave }: PlayerRevealScreenProps) {
  const { spacing } = useTheme();
  const progress = useRevealProgress();
  const isComplete = progress?.isComplete ?? false;

  const notifyComplete = useEffectEvent(onComplete);
  useEffect(() => {
    if (isComplete) notifyComplete();
  }, [isComplete]);

  if (!progress || !progress.currentPlayer) return <View style={styles.flex} />;

  return (
    <View style={[styles.flex, { gap: spacing.lg }]}>
      <GameTopBar onLeave={onLeave}>
        <RevealProgress index={progress.index} total={progress.total} />
      </GameTopBar>
      <View style={styles.stage}>
        <PlayerTurn
          key={`${progress.sessionId}:${progress.index}`}
          player={progress.currentPlayer}
          previousPlayer={progress.previousPlayer}
          onDone={progress.finishTurn}
        />
      </View>
    </View>
  );
}

function PlayerTurn({
  player,
  previousPlayer,
  onDone,
}: {
  player: Player;
  previousPlayer: Player | null;
  onDone: () => void;
}) {
  const [step, setStep] = useState<'handover' | 'card'>('handover');

  // Gated so a double tap on Got It / Ready can't run the next step's action.
  if (step === 'handover') {
    return (
      <SettleGate key="handover" style={styles.gate}>
        <PlayerHandoverScreen player={player} previousPlayer={previousPlayer} onReady={() => setStep('card')} />
      </SettleGate>
    );
  }
  return (
    <SettleGate key="card" style={styles.gate}>
      <Animated.View entering={FadeIn.duration(250)}>
        <RoleRevealCard player={player} onGotIt={onDone} />
      </Animated.View>
    </SettleGate>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  stage: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gate: {
    alignSelf: 'stretch',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
