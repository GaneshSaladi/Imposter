import { getCounterAvailability, getMinTotalPlayers } from '@/features/game-setup/logic/configurationRules';
import { selectRegisteredCount, useGameSetupStore } from '@/store';

/**
 * Counter state + actions for any screen showing the player/imposter
 * counters. Button availability comes from the same rules the store enforces.
 */
export function usePlayerCounters() {
  const totalPlayers = useGameSetupStore((s) => s.totalPlayers);
  const imposters = useGameSetupStore((s) => s.imposters);
  const registeredPlayers = useGameSetupStore(selectRegisteredCount);
  const incrementPlayers = useGameSetupStore((s) => s.incrementPlayers);
  const decrementPlayers = useGameSetupStore((s) => s.decrementPlayers);
  const incrementImposters = useGameSetupStore((s) => s.incrementImposters);
  const decrementImposters = useGameSetupStore((s) => s.decrementImposters);

  const counts = { totalPlayers, imposters };

  return {
    ...counts,
    crewmates: totalPlayers - imposters,
    registeredPlayers,
    minTotalPlayers: getMinTotalPlayers(imposters, registeredPlayers),
    ...getCounterAvailability(counts, registeredPlayers),
    incrementPlayers,
    decrementPlayers,
    incrementImposters,
    decrementImposters,
  };
}
