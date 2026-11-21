import type { ClueRoundsPerCycle } from '@/features/gameplay/types/game.types';

/** Clue-round options offered on the Game Ready screen. */
export const CLUE_ROUND_OPTIONS: readonly ClueRoundsPerCycle[] = [2, 3];

export const DEFAULT_CLUE_ROUNDS: ClueRoundsPerCycle = 3;

export function isClueRoundsPerCycle(value: unknown): value is ClueRoundsPerCycle {
  return value === 2 || value === 3;
}
