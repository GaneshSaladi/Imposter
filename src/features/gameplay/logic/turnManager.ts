import type { ClueCycle, CycleReason } from '@/features/gameplay/types/game.types';
import type { Player } from '@/features/players/types';
import type { EntityId } from '@/types/common';
import { defaultRandom, shuffle, type RandomSource } from '@/utils/random';

/**
 * Speaking-order and clue-round progression. Pure functions — the order is
 * created once per cycle and stored, so re-renders never reshuffle it.
 */

const MAX_RESHUFFLES = 5;

/** Players still in the game, in registration order. */
export function getActivePlayerIds(players: readonly Player[], eliminatedIds: ReadonlySet<EntityId>): EntityId[] {
  return players.filter((player) => !eliminatedIds.has(player.id)).map((player) => player.id);
}

function sameOrder(a: readonly EntityId[], b: readonly EntityId[]): boolean {
  return a.length === b.length && a.every((id, index) => id === b[index]);
}

/**
 * Uniform shuffle of the active players. With 3+ players, an order identical
 * to `avoidOrder` (e.g. the previous cycle's) is re-rolled so every cycle
 * feels fresh.
 */
export function createSpeakingOrder(
  activeIds: readonly EntityId[],
  random: RandomSource = defaultRandom,
  avoidOrder: readonly EntityId[] = [],
): EntityId[] {
  let order = shuffle(activeIds, random);
  for (let attempt = 0; activeIds.length >= 3 && attempt < MAX_RESHUFFLES; attempt++) {
    if (!sameOrder(order, avoidOrder)) break;
    order = shuffle(activeIds, random);
  }
  return order;
}

export function createClueCycle(
  params: { cycleNumber: number; reason: CycleReason; activeIds: readonly EntityId[]; previousOrder?: readonly EntityId[] },
  random: RandomSource = defaultRandom,
): ClueCycle {
  return {
    cycleNumber: params.cycleNumber,
    reason: params.reason,
    speakingOrder: createSpeakingOrder(params.activeIds, random, params.previousOrder),
    currentRound: 1,
    spokenCount: 0,
    completedRounds: 0,
  };
}

export function isCycleComplete(cycle: ClueCycle, roundsPerCycle: number): boolean {
  return cycle.completedRounds >= roundsPerCycle;
}

/** The player who should be speaking now, or null once the cycle is complete. */
export function getCurrentSpeakerId(cycle: ClueCycle, roundsPerCycle: number): EntityId | null {
  if (isCycleComplete(cycle, roundsPerCycle)) return null;
  return cycle.speakingOrder[cycle.spokenCount] ?? null;
}

/**
 * Marks the current speaker as done. Finishing the last speaker completes
 * the round; the next round reuses the same order. Returns the cycle
 * unchanged if it is already complete.
 */
export function advanceTurn(cycle: ClueCycle, roundsPerCycle: number): ClueCycle {
  if (isCycleComplete(cycle, roundsPerCycle)) return cycle;

  const spokenCount = cycle.spokenCount + 1;
  if (spokenCount < cycle.speakingOrder.length) return { ...cycle, spokenCount };

  const completedRounds = cycle.completedRounds + 1;
  if (completedRounds >= roundsPerCycle) {
    return { ...cycle, spokenCount: cycle.speakingOrder.length, completedRounds };
  }
  return { ...cycle, currentRound: cycle.currentRound + 1, spokenCount: 0, completedRounds };
}
