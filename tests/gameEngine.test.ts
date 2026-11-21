import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import * as engine from '@/features/gameplay/logic/gameEngine';
import { getCurrentVoterId } from '@/features/gameplay/logic/votingEngine';
import type { GameSession } from '@/features/gameplay/types/game.types';
import { createSeededRandom } from '@/utils/random';

import {
  continueToNextCycle,
  crewIds,
  expectError,
  expectOk,
  finishClueCycle,
  imposterIds,
  readySession,
  voteOut,
  voteTie,
} from './helpers/gameFixtures';

const start = (session: GameSession, rounds: 2 | 3 = 3) =>
  expectOk(engine.startGame(session, rounds, createSeededRandom(11)));

describe('game engine: state transitions', () => {
  it('rejects out-of-order transitions', () => {
    const ready = readySession(4, 1);
    expectError(engine.beginClueRounds(ready), 'ready');
    expectError(engine.startVoting(ready));
    expectError(engine.resolveVoting(ready));
    expectError(engine.startNextCycle(ready));
    expectError(engine.startGame(ready, 4 as 3), 'Choose 2 or 3');

    const speaking = start(ready);
    assert.equal(speaking.status, 'speaking-order');
    assert.equal(speaking.clueRoundsPerCycle, 3);
    expectError(engine.startGame(speaking, 3), 'speaking-order');

    const clue = expectOk(engine.beginClueRounds(speaking));
    expectError(engine.startVoting(clue), 'Finish all clue rounds');
  });

  it('starting the game does not change roles or the word', () => {
    const ready = readySession(5, 2, 4);
    const started = start(ready);
    assert.deepEqual(started.roles, ready.roles);
    assert.equal(started.secretWord, ready.secretWord);
    assert.equal(started.cycles.length, 1);
    assert.deepEqual([...started.cycles[0].speakingOrder].sort(), ready.players.map((p) => p.id).sort());
  });

  it('stale NEXT PLAYER taps cannot skip a speaker', () => {
    const clue = expectOk(engine.beginClueRounds(start(readySession(4, 1))));
    const expected = { cycleNumber: 1, round: 1, spokenCount: 0 };
    const once = expectOk(engine.advanceSpeakingTurn(clue, expected));
    expectError(engine.advanceSpeakingTurn(once, expected), 'Stale');
    assert.equal(engine.getCurrentCycle(once)?.spokenCount, 1);
  });

  it('voting: every active player votes exactly once; results only after all votes', () => {
    const clue = finishClueCycle(start(readySession(5, 2)));
    let voting = expectOk(engine.startVoting(clue, createSeededRandom(3)));
    const phase = engine.getCurrentVotingPhase(voting);
    assert.ok(phase);
    assert.deepEqual([...phase.votingOrder].sort(), voting.players.map((p) => p.id).sort());

    const first = getCurrentVoterId(phase) as string;
    const target = phase.votingOrder.find((id) => id !== first) as string;
    expectError(engine.submitVote(voting, first, first), 'yourself');
    voting = expectOk(engine.submitVote(voting, first, target));
    expectError(engine.submitVote(voting, first, target), 'already voted');
    expectError(engine.resolveVoting(voting), 'Every player must vote');
  });

  it('a completed game cannot continue into another cycle', () => {
    const clue = finishClueCycle(start(readySession(4, 1, 2)));
    let results = voteOut(clue, imposterIds(clue)[0]);
    assert.equal(results.winner, 'crew');
    results = expectOk(engine.continueFromVoteResults(results));
    assert.equal(results.status, 'elimination');
    const done = expectOk(engine.continueFromElimination(results));
    assert.equal(done.status, 'completed');
    expectError(engine.startNextCycle(done));
    expectError(engine.startVoting(done));
  });
});

describe('game engine: full scenarios', () => {
  it('A: 4 players / 1 imposter — vote out the imposter, crew wins', () => {
    const ready = readySession(4, 1, 21);
    let s = finishClueCycle(start(ready, 3));
    assert.equal(engine.getCurrentCycle(s)?.completedRounds, 3);
    const imposter = imposterIds(s)[0];
    s = voteOut(s, imposter);
    const result = engine.getCurrentVotingPhase(s)?.result;
    assert.equal(result?.eliminatedPlayerId, imposter);
    assert.equal(s.winner, 'crew');
    assert.ok(s.completedAt !== null);
    assert.deepEqual(s.eliminations.map((e) => [e.playerId, e.role, e.cycleNumber]), [[imposter, 'imposter', 1]]);
  });

  it('B (as written, 5/2): eliminating a crewmate first leaves 2 vs 2 → imposters win immediately (V1 rule)', () => {
    let s = finishClueCycle(start(readySession(5, 2, 33)));
    s = voteOut(s, crewIds(s)[0]);
    assert.deepEqual(engine.getRemaining(s), { imposters: 2, crewmates: 2 });
    assert.equal(s.winner, 'imposter');
  });

  it('B (same sequence with 6/2): crewmate out → continue, imposter out → continue, imposter out → crew wins', () => {
    let s = finishClueCycle(start(readySession(6, 2, 34)));
    const [imp1, imp2] = imposterIds(s);

    s = voteOut(s, crewIds(s)[0]);
    assert.equal(s.winner, null);
    assert.deepEqual(engine.getRemaining(s), { imposters: 2, crewmates: 3 });
    s = finishClueCycle(continueToNextCycle(s));
    assert.equal(engine.getCurrentCycle(s)?.cycleNumber, 2);
    assert.equal(engine.getCurrentCycle(s)?.speakingOrder.length, 5, 'eliminated player excluded');

    s = voteOut(s, imp1);
    assert.equal(s.winner, null);
    assert.deepEqual(engine.getRemaining(s), { imposters: 1, crewmates: 3 });
    s = finishClueCycle(continueToNextCycle(s));

    s = voteOut(s, imp2);
    assert.equal(s.winner, 'crew');
    assert.equal(s.eliminations.length, 3);
    assert.deepEqual(
      s.eliminations.map((e) => e.cycleNumber),
      [1, 2, 3],
    );
  });

  it('B (5/2, reachable order): imposter out → crewmate out → imposter out → crew wins', () => {
    let s = finishClueCycle(start(readySession(5, 2, 35)));
    const [imp1, imp2] = imposterIds(s);
    s = finishClueCycle(continueToNextCycle(voteOut(s, imp1)));
    assert.deepEqual(engine.getRemaining(s), { imposters: 1, crewmates: 3 });
    s = voteOut(s, crewIds(s).find((id) => !s.eliminations.some((e) => e.playerId === id)) as string);
    assert.equal(s.winner, null);
    assert.deepEqual(engine.getRemaining(s), { imposters: 1, crewmates: 2 });
    s = finishClueCycle(continueToNextCycle(s));
    s = voteOut(s, imp2);
    assert.equal(s.winner, 'crew');
  });

  it('C: 6 players / 2 imposters — tie → nobody eliminated, nothing revealed, fresh cycle, roles unchanged', () => {
    let s = finishClueCycle(start(readySession(6, 2, 44)));
    const rolesBefore = JSON.stringify(s.roles);
    const wordBefore = s.secretWord;
    const firstOrder = [...(engine.getCurrentCycle(s)?.speakingOrder ?? [])];
    const [a, b] = engine.getActiveIds(s);

    s = voteTie(s, a, b);
    const result = engine.getCurrentVotingPhase(s)?.result;
    assert.equal(result?.isTie, true);
    assert.equal(result?.eliminatedPlayerId, null);
    assert.equal(s.eliminations.length, 0, 'no elimination, no role revealed');
    assert.equal(s.winner, null);

    s = expectOk(engine.continueFromVoteResults(s));
    assert.equal(s.status, 'next-cycle', 'a tie skips the elimination screen');
    s = expectOk(engine.startNextCycle(s, createSeededRandom(8)));
    const cycle2 = engine.getCurrentCycle(s);
    assert.equal(cycle2?.cycleNumber, 2);
    assert.equal(cycle2?.reason, 'tie');
    assert.equal(cycle2?.speakingOrder.length, 6);
    assert.notDeepEqual([...(cycle2?.speakingOrder ?? [])], firstOrder, 'fresh speaking order');
    assert.equal(JSON.stringify(s.roles), rolesBefore);
    assert.equal(s.secretWord, wordBefore);

    // The game keeps going after a tie: next vote can still eliminate.
    s = voteOut(finishClueCycle(s), imposterIds(s)[0]);
    assert.equal(s.votingPhases.length, 2);
    assert.equal(s.eliminations.length, 1);
  });

  it('D: 5 players / 2 imposters — crewmates eliminated until 2 vs 2 → imposters win, both imposters known', () => {
    let s = finishClueCycle(start(readySession(5, 2, 55)));
    s = voteOut(s, crewIds(s)[0]);
    assert.equal(s.winner, 'imposter');
    assert.deepEqual(engine.getRemaining(s), { imposters: 2, crewmates: 2 });
    assert.equal(imposterIds(s).length, 2);
    s = expectOk(engine.continueFromElimination(expectOk(engine.continueFromVoteResults(s))));
    assert.equal(s.status, 'completed');
  });

  it('every session in a long random game keeps invariants (fuzz)', () => {
    for (let seed = 1; seed <= 60; seed++) {
      const random = createSeededRandom(seed * 7);
      let s = finishClueCycle(start(readySession(8, 3, seed)));
      for (let guard = 0; guard < 30 && s.winner === null; guard++) {
        const active = engine.getActiveIds(s);
        const target = active[Math.floor(random() * active.length)];
        s = random() < 0.25 ? voteTie(s, active[0], active[1]) : voteOut(s, target);
        const eliminated = new Set(s.eliminations.map((e) => e.playerId));
        assert.equal(eliminated.size, s.eliminations.length, 'nobody eliminated twice');
        if (s.winner === null) s = finishClueCycle(continueToNextCycle(s));
      }
      assert.ok(s.winner !== null, 'game always terminates');
      const remaining = engine.getRemaining(s);
      if (s.winner === 'crew') assert.equal(remaining.imposters, 0);
      else assert.ok(remaining.imposters >= remaining.crewmates);
    }
  });
});
