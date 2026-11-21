import type { GameTypeId } from '@/features/game-types/types';

export interface PlayerCounts {
  totalPlayers: number;
  imposters: number;
}

export interface GameConfiguration extends PlayerCounts {
  gameType: GameTypeId;
}

/** Which counter buttons are currently allowed. */
export interface CounterAvailability {
  canIncrementPlayers: boolean;
  canDecrementPlayers: boolean;
  canIncrementImposters: boolean;
  canDecrementImposters: boolean;
}
