import type { PlayerRole, Winner } from '@/features/gameplay/types/game.types';
import type { EntityId } from '@/types/common';

/**
 * V1 win rules:
 * - Crew wins when no imposters remain.
 * - Imposters win when they are at least as many as the remaining crewmates.
 * - Otherwise the game continues.
 */

export interface RemainingCounts {
  imposters: number;
  crewmates: number;
}

export function getRemainingCounts(roles: readonly PlayerRole[], eliminatedIds: ReadonlySet<EntityId>): RemainingCounts {
  let imposters = 0;
  let crewmates = 0;
  roles.forEach((role) => {
    if (eliminatedIds.has(role.playerId)) return;
    if (role.role === 'imposter') imposters += 1;
    else crewmates += 1;
  });
  return { imposters, crewmates };
}

export function checkWinCondition({ imposters, crewmates }: RemainingCounts): Winner | null {
  if (imposters === 0) return 'crew';
  if (imposters >= crewmates) return 'imposter';
  return null;
}
