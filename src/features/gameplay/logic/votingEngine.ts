import type { Vote, VotingPhase, VotingResult } from '@/features/gameplay/types/game.types';
import type { EntityId } from '@/types/common';
import { defaultRandom, shuffle, type RandomSource } from '@/utils/random';

/**
 * Voting rules and result calculation. Pure functions.
 *
 * V1 tie rule: if two or more players share the highest vote count,
 * nobody is eliminated.
 */

/** Independent random voting order of the active players. */
export function createVotingOrder(activeIds: readonly EntityId[], random: RandomSource = defaultRandom): EntityId[] {
  return shuffle(activeIds, random);
}

export function isVotingComplete(phase: VotingPhase): boolean {
  return phase.votes.length >= phase.votingOrder.length;
}

/** Whose turn it is to vote, or null when everyone has voted. */
export function getCurrentVoterId(phase: VotingPhase): EntityId | null {
  return phase.votingOrder[phase.votes.length] ?? null;
}

/** Everyone the voter may vote for: all other active players. */
export function getEligibleTargets(activeIds: readonly EntityId[], voterId: EntityId): EntityId[] {
  return activeIds.filter((id) => id !== voterId);
}

/** Returns an error message, or null if the vote is allowed. */
export function validateVote(
  phase: VotingPhase,
  activeIds: readonly EntityId[],
  voterId: EntityId,
  targetId: EntityId,
): string | null {
  const active = new Set(activeIds);
  if (phase.result !== null) return 'Voting is already closed.';
  if (isVotingComplete(phase)) return 'Everyone has already voted.';
  if (!active.has(voterId)) return 'Eliminated players cannot vote.';
  if (phase.votes.some((vote) => vote.voterId === voterId)) return 'This player has already voted.';
  if (getCurrentVoterId(phase) !== voterId) return "It is not this player's turn to vote.";
  if (!active.has(targetId)) return 'That player is no longer in the game.';
  if (voterId === targetId) return 'You cannot vote for yourself.';
  return null;
}

/** Vote totals for every candidate (players with no votes get 0). */
export function countVotes(votes: readonly Vote[], candidateIds: readonly EntityId[]): Record<EntityId, number> {
  const counts: Record<EntityId, number> = {};
  candidateIds.forEach((id) => {
    counts[id] = 0;
  });
  votes.forEach((vote) => {
    if (vote.votedForId in counts) counts[vote.votedForId] += 1;
  });
  return counts;
}

/** Unique highest count → that player is eliminated; shared highest → tie, nobody is. */
export function resolveVotes(votes: readonly Vote[], candidateIds: readonly EntityId[]): VotingResult {
  const voteCounts = countVotes(votes, candidateIds);
  const maxVotes = Math.max(0, ...Object.values(voteCounts));
  const topPlayerIds = maxVotes > 0 ? candidateIds.filter((id) => voteCounts[id] === maxVotes) : [];
  const isTie = topPlayerIds.length !== 1;
  return {
    voteCounts,
    maxVotes,
    topPlayerIds,
    isTie,
    eliminatedPlayerId: isTie ? null : topPlayerIds[0],
  };
}
