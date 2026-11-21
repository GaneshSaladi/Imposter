import type { PlayerRole } from '@/features/gameplay/types/game.types';
import type { EntityId } from '@/types/common';
import { defaultRandom, sampleWithoutReplacement, type RandomSource } from '@/utils/random';

/**
 * Picks exactly `imposterCount` imposters at random. Every other player is a
 * crewmate and receives the same `secretWord`; imposters get no word.
 * Returns one role per player, in the same order as `playerIds`.
 */
export function assignRoles(
  playerIds: readonly EntityId[],
  imposterCount: number,
  secretWord: string,
  random: RandomSource = defaultRandom,
): PlayerRole[] {
  if (new Set(playerIds).size !== playerIds.length) {
    throw new Error('assignRoles: player ids must be unique');
  }
  if (!Number.isInteger(imposterCount) || imposterCount < 1 || imposterCount >= playerIds.length) {
    throw new RangeError(`assignRoles: invalid imposter count ${imposterCount} for ${playerIds.length} players`);
  }
  if (secretWord.trim().length === 0) throw new Error('assignRoles: secret word is empty');

  const imposters = new Set(sampleWithoutReplacement(playerIds, imposterCount, random));
  return playerIds.map((playerId): PlayerRole =>
    imposters.has(playerId) ? { playerId, role: 'imposter' } : { playerId, role: 'crewmate', secretWord },
  );
}

/** Checks the core invariants of a role assignment. */
export function isValidRoleAssignment(
  roles: readonly PlayerRole[],
  playerIds: readonly EntityId[],
  imposterCount: number,
  secretWord: string,
): boolean {
  const ids = new Set(playerIds);
  const assigned = new Set(roles.map((role) => role.playerId));
  return (
    roles.length === playerIds.length &&
    assigned.size === roles.length &&
    roles.every((role) => ids.has(role.playerId)) &&
    roles.filter((role) => role.role === 'imposter').length === imposterCount &&
    roles.every((role) => (role.role === 'crewmate' ? role.secretWord === secretWord : !('secretWord' in role)))
  );
}
