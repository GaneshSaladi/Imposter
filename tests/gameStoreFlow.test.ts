import './setup/nativeStubs';

import assert from 'node:assert/strict';
import { beforeEach, describe, it } from 'node:test';

import * as engine from '@/features/gameplay/logic/gameEngine';
import { getCurrentVoterId } from '@/features/gameplay/logic/votingEngine';
import { useGameStore } from '@/store/gameStore';
import type { EntityId } from '@/types/common';
import { createSeededRandom } from '@/utils/random';

import { crewIds, imposterIds, readySession } from './helpers/gameFixtures';

const game = () => useGameStore.getState();
const session = () => {
  const current = game().session;
  assert.ok(current);
  return current;
};

/** Drives the store exactly like the screens do. */
function playCluesViaStore() {
  assert.ok(game().beginClueRounds().ok);
  while (!engine.isClueCycleComplete(session())) {
    const cycle = engine.getCurrentCycle(session());
    assert.ok(cycle);
    assert.ok(game().advanceSpeakingTurn({ cycleNumber: cycle.cycleNumber, round: cycle.currentRound, spokenCount: cycle.spokenCount }).ok);
  }
}

function voteViaStore(choose: (voterId: EntityId, active: EntityId[]) => EntityId) {
  assert.ok(game().startVoting(createSeededRandom(5)).ok);
  const order = [...(engine.getCurrentVotingPhase(session())?.votingOrder ?? [])];
  for (let i = 0; i < order.length; i++) {
    const phase = engine.getCurrentVotingPhase(session());
    assert.ok(phase);
    assert.deepEqual([...phase.votingOrder], order, 'voting order never reshuffles mid-phase');
    const voter = getCurrentVoterId(phase) as EntityId;
    const active = engine.getActiveIds(session());
    if (i === 0) assert.equal(game().resolveVoting().ok, false, 'no results before everyone voted');
    assert.equal(game().submitVote(voter, voter).ok, false, 'self vote rejected');
    const target = choose(voter, active);
    assert.ok(game().submitVote(voter, target).ok);
    assert.equal(game().submitVote(voter, target).ok, false, 'duplicate vote rejected');
  }
  assert.ok(game().resolveVoting().ok);
}

beforeEach(() => game().resetGame());

describe('game store: clue rounds → voting → elimination', () => {
  it('runs a full cycle with stable orders, and excludes the eliminated player afterwards', () => {
    game().initializeSession(readySession(6, 2, 3));
    assert.equal(game().startGame(2, createSeededRandom(1)).ok, true);
    assert.equal(session().clueRoundsPerCycle, 2);
    assert.equal(game().startVoting().ok, false, 'cannot vote before clue rounds');
    playCluesViaStore();
    assert.equal(engine.getCurrentCycle(session())?.completedRounds, 2);

    const victim = crewIds(session())[0];
    voteViaStore((voter, active) => (voter === victim ? (active.find((id) => id !== voter) as EntityId) : victim));
    assert.equal(session().status, 'vote-results');
    assert.equal(session().eliminations[0]?.playerId, victim);

    assert.ok(game().continueFromVoteResults().ok);
    assert.equal(session().status, 'elimination');
    assert.ok(game().continueFromElimination().ok);
    assert.equal(session().status, 'next-cycle');
    assert.ok(game().startNextCycle(createSeededRandom(2)).ok);

    const cycle2 = engine.getCurrentCycle(session());
    assert.ok(cycle2 && !cycle2.speakingOrder.includes(victim), 'eliminated player cannot speak');
    playCluesViaStore();
    assert.ok(game().startVoting().ok);
    const phase2 = engine.getCurrentVotingPhase(session());
    assert.ok(phase2 && !phase2.votingOrder.includes(victim), 'eliminated player cannot vote');
    const voter = getCurrentVoterId(phase2) as EntityId;
    assert.equal(game().submitVote(voter, victim).ok, false, 'eliminated player cannot be voted for');
  });

  it('a tie eliminates nobody, reveals nothing, and goes straight to a fresh cycle', () => {
    game().initializeSession(readySession(5, 1, 8));
    game().startGame(3, createSeededRandom(4));
    playCluesViaStore();
    const [a, b] = engine.getActiveIds(session());
    const others = engine.getActiveIds(session()).filter((id) => id !== a && id !== b);
    const plan = new Map<EntityId, EntityId>([[a, b], [b, a], [others[0], a], [others[1], b], [others[2], others[0]]]);
    voteViaStore((voterId) => plan.get(voterId) as EntityId);
    const result = engine.getCurrentVotingPhase(session())?.result;
    assert.equal(result?.isTie, true);
    assert.equal(session().eliminations.length, 0);
    assert.ok(game().continueFromVoteResults().ok);
    assert.equal(session().status, 'next-cycle');
    assert.equal(game().continueFromElimination().ok, false, 'no elimination screen after a tie');
    assert.ok(game().startNextCycle().ok);
    assert.equal(engine.getCurrentCycle(session())?.reason, 'tie');
  });

  it('notifies completion exactly once when a winner is decided', async () => {
    const { onGameCompleted } = await import('@/store/gameStore');
    let calls = 0;
    const unsubscribe = onGameCompleted(() => {
      calls += 1;
    });
    game().initializeSession(readySession(4, 1, 12));
    game().startGame(3);
    playCluesViaStore();
    const imposter = imposterIds(session())[0];
    voteViaStore((voter, active) => (voter === imposter ? (active.find((id) => id !== voter) as EntityId) : imposter));
    assert.equal(session().winner, 'crew');
    game().continueFromVoteResults();
    game().continueFromElimination();
    assert.equal(session().status, 'completed');
    assert.equal(game().startNextCycle().ok, false);
    assert.equal(calls, 1);
    unsubscribe();
  });
});
