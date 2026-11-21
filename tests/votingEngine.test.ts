import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  countVotes,
  createVotingOrder,
  getCurrentVoterId,
  getEligibleTargets,
  resolveVotes,
  validateVote,
} from '@/features/gameplay/logic/votingEngine';
import type { VotingPhase } from '@/features/gameplay/types/game.types';
import { createSeededRandom } from '@/utils/random';

const active = ['ganesh', 'rahul', 'priya', 'akash', 'sneha'];

function phase(votingOrder: string[], votes: VotingPhase['votes'] = []): VotingPhase {
  return { votingPhaseId: 'v1', phaseNumber: 1, cycleNumber: 1, votingOrder, votes, result: null };
}

describe('voting engine', () => {
  it('voting order contains every active player exactly once', () => {
    for (let seed = 1; seed <= 100; seed++) {
      const order = createVotingOrder(active, createSeededRandom(seed));
      assert.deepEqual([...order].sort(), [...active].sort());
    }
  });

  it('every active player can vote, in order', () => {
    let p = phase(['priya', 'ganesh', 'sneha', 'rahul', 'akash']);
    for (const voter of p.votingOrder) {
      assert.equal(getCurrentVoterId(p), voter);
      const target = getEligibleTargets(active, voter)[0];
      assert.equal(validateVote(p, active, voter, target), null);
      p = { ...p, votes: [...p.votes, { voterId: voter, votedForId: target }] };
    }
    assert.equal(getCurrentVoterId(p), null);
    assert.match(validateVote(p, active, 'ganesh', 'rahul') ?? '', /already voted/);
  });

  it('rejects self votes, duplicates, out-of-turn, eliminated voters and targets', () => {
    const p = phase(['ganesh', 'rahul', 'priya', 'akash']);
    const stillActive = ['ganesh', 'rahul', 'priya', 'akash']; // sneha eliminated
    assert.match(validateVote(p, stillActive, 'ganesh', 'ganesh') ?? '', /yourself/);
    assert.match(validateVote(p, stillActive, 'rahul', 'ganesh') ?? '', /not this player's turn/);
    assert.match(validateVote(p, stillActive, 'sneha', 'ganesh') ?? '', /Eliminated players cannot vote/);
    assert.match(validateVote(p, stillActive, 'ganesh', 'sneha') ?? '', /no longer in the game/);
    const voted = phase(p.votingOrder as string[], [{ voterId: 'ganesh', votedForId: 'rahul' }]);
    assert.match(validateVote(voted, stillActive, 'ganesh', 'priya') ?? '', /already voted/);
    assert.ok(!getEligibleTargets(stillActive, 'ganesh').includes('ganesh'));
  });

  it('counts votes (zero for unvoted players)', () => {
    const counts = countVotes(
      [
        { voterId: 'ganesh', votedForId: 'rahul' },
        { voterId: 'priya', votedForId: 'rahul' },
        { voterId: 'akash', votedForId: 'sneha' },
      ],
      active,
    );
    assert.deepEqual(counts, { ganesh: 0, rahul: 2, priya: 0, akash: 0, sneha: 1 });
  });

  it('unique highest vote eliminates exactly that player (spec example)', () => {
    const result = resolveVotes(
      [
        { voterId: 'ganesh', votedForId: 'rahul' },
        { voterId: 'priya', votedForId: 'rahul' },
        { voterId: 'akash', votedForId: 'sneha' },
        { voterId: 'rahul', votedForId: 'sneha' },
        { voterId: 'sneha', votedForId: 'rahul' },
      ],
      active,
    );
    assert.equal(result.voteCounts.rahul, 3);
    assert.equal(result.voteCounts.sneha, 2);
    assert.equal(result.isTie, false);
    assert.equal(result.eliminatedPlayerId, 'rahul');
  });

  it('tied highest vote eliminates nobody (spec example)', () => {
    const result = resolveVotes(
      [
        { voterId: 'ganesh', votedForId: 'rahul' },
        { voterId: 'sneha', votedForId: 'rahul' },
        { voterId: 'rahul', votedForId: 'priya' },
        { voterId: 'akash', votedForId: 'priya' },
        { voterId: 'priya', votedForId: 'akash' },
      ],
      active,
    );
    assert.equal(result.isTie, true);
    assert.deepEqual([...result.topPlayerIds].sort(), ['priya', 'rahul']);
    assert.equal(result.eliminatedPlayerId, null);
  });
});
