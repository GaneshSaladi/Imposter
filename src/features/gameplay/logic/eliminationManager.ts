import type { Elimination, PlayerRole } from '@/features/gameplay/types/game.types';
import type { EntityId, Result } from '@/types/common';

export function getEliminatedIds(eliminations: readonly Elimination[]): Set<EntityId> {
  return new Set(eliminations.map((elimination) => elimination.playerId));
}

/**
 * Records one elimination, revealing the player's (unchanged) role.
 * Rejects unknown or already-eliminated players.
 */
export function eliminatePlayer(
  roles: readonly PlayerRole[],
  eliminations: readonly Elimination[],
  playerId: EntityId,
  context: { cycleNumber: number; votingPhaseId: string },
): Result<Elimination[], string> {
  const role = roles.find((entry) => entry.playerId === playerId);
  if (!role) return { ok: false, error: 'Unknown player.' };
  if (eliminations.some((elimination) => elimination.playerId === playerId)) {
    return { ok: false, error: 'Player is already eliminated.' };
  }
  return {
    ok: true,
    value: [...eliminations, { playerId, role: role.role, cycleNumber: context.cycleNumber, votingPhaseId: context.votingPhaseId }],
  };
}
