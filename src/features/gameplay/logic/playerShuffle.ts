import type { Player } from '@/features/players/types';
import type { EntityId } from '@/types/common';
import { defaultRandom, shuffle, type RandomSource } from '@/utils/random';

/** Re-roll attempts when a shuffle lands on the exact registration order. */
const MAX_RESHUFFLES = 5;

function isSameOrder(a: readonly EntityId[], b: readonly EntityId[]): boolean {
  return a.every((id, index) => id === b[index]);
}

/**
 * Random order in which players receive the phone. Returns player ids and
 * never mutates `players`. Contains every player exactly once.
 *
 * A uniform shuffle sometimes returns the registration order (1 in 24 for
 * four players), which looks "not shuffled" — so with 3+ players that
 * outcome is re-rolled a few times.
 */
export function createRevealOrder(players: readonly Player[], random: RandomSource = defaultRandom): EntityId[] {
  const registrationOrder = players.map((player) => player.id);
  let order = shuffle(registrationOrder, random);
  for (let attempt = 0; registrationOrder.length >= 3 && attempt < MAX_RESHUFFLES; attempt++) {
    if (!isSameOrder(order, registrationOrder)) break;
    order = shuffle(registrationOrder, random);
  }
  return order;
}

/** True if `order` contains each player exactly once and nothing else. */
export function isValidRevealOrder(order: readonly EntityId[], players: readonly Player[]): boolean {
  if (order.length !== players.length || new Set(order).size !== order.length) return false;
  const ids = new Set(players.map((player) => player.id));
  return order.every((id) => ids.has(id));
}
