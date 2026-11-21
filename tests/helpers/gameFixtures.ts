import '../setup/nativeStubs';

import assert from 'node:assert/strict';

import { getSelectedCategories } from '@/features/game-setup/services/categoryService';
import * as engine from '@/features/gameplay/logic/gameEngine';
import { getCurrentVoterId } from '@/features/gameplay/logic/votingEngine';
import { createGameSession } from '@/features/gameplay/logic/gameSession';
import type { GameSession } from '@/features/gameplay/types/game.types';
import { PLAYER_COLORS } from '@/features/players/constants/playerColors';
import type { Player } from '@/features/players/types';
import type { EntityId, Result } from '@/types/common';
import { createSeededRandom, type RandomSource } from '@/utils/random';

export const NAMES = ['Ganesh', 'Rahul', 'Priya', 'Akash', 'Sneha', 'Maya', 'Leo', 'Zoe'];

export function makePlayers(count: number): Player[] {
  return NAMES.slice(0, count).map((name, index) => ({
    id: name.toLowerCase(),
    name,
    color: PLAYER_COLORS[index].value,
  }));
}

export function expectOk<T>(result: Result<T, string>): T {
  if (!result.ok) assert.fail(`Expected ok, got error: ${result.error}`);
  return result.value;
}

export function expectError<T>(result: Result<T, string>, fragment?: string): string {
  if (result.ok) assert.fail('Expected an error, got ok');
  if (fragment) assert.ok(result.error.includes(fragment), `"${result.error}" should include "${fragment}"`);
  return result.error;
}

export const defaultCategories = () => getSelectedCategories(['animals', 'fruits', 'food', 'objects']);

/** A session that has finished the private reveal (status "ready"). */
export function readySession(playerCount: number, imposters: number, seed = 1): GameSession {
  const random = createSeededRandom(seed);
  let session = expectOk(
    createGameSession(
      { players: makePlayers(playerCount), imposterCount: imposters, totalPlayers: playerCount, categories: defaultCategories() },
      random,
    ),
  );
  session = expectOk(engine.beginRoleReveal(session));
  for (let index = 0; index < playerCount; index++) session = expectOk(engine.advanceReveal(session, index));
  assert.equal(session.status, 'ready');
  return session;
}

export function imposterIds(session: GameSession): EntityId[] {
  return session.roles.filter((role) => role.role === 'imposter').map((role) => role.playerId);
}

export function crewIds(session: GameSession): EntityId[] {
  return session.roles.filter((role) => role.role === 'crewmate').map((role) => role.playerId);
}

/** Taps NEXT PLAYER until every clue round of the current cycle is done. */
export function finishClueCycle(session: GameSession): GameSession {
  let current = session;
  if (current.status === 'speaking-order') current = expectOk(engine.beginClueRounds(current));
  for (let guard = 0; guard < 200 && !engine.isClueCycleComplete(current); guard++) {
    const cycle = engine.getCurrentCycle(current);
    assert.ok(cycle);
    current = expectOk(
      engine.advanceSpeakingTurn(current, {
        cycleNumber: cycle.cycleNumber,
        round: cycle.currentRound,
        spokenCount: cycle.spokenCount,
      }),
    );
  }
  assert.ok(engine.isClueCycleComplete(current));
  return current;
}

/** Runs a full voting phase where `chooseTarget` decides each vote. */
export function runVoting(
  session: GameSession,
  chooseTarget: (voterId: EntityId, activeIds: EntityId[]) => EntityId,
  random: RandomSource = createSeededRandom(99),
): GameSession {
  let current = expectOk(engine.startVoting(session, random));
  const active = engine.getActiveIds(current);
  for (let guard = 0; guard < active.length; guard++) {
    const phase = engine.getCurrentVotingPhase(current);
    assert.ok(phase);
    const voterId = getCurrentVoterId(phase);
    assert.ok(voterId);
    current = expectOk(engine.submitVote(current, voterId, chooseTarget(voterId, active)));
  }
  return expectOk(engine.resolveVoting(current));
}

/** Everyone votes for `targetId` (the target votes for someone else). */
export function voteOut(session: GameSession, targetId: EntityId): GameSession {
  return runVoting(session, (voterId, active) =>
    voterId === targetId ? (active.find((id) => id !== targetId) as EntityId) : targetId,
  );
}

/** Splits votes so `a` and `b` tie for the most votes. */
export function voteTie(session: GameSession, a: EntityId, b: EntityId): GameSession {
  const active = engine.getActiveIds(session);
  const others = active.filter((id) => id !== a && id !== b);
  const plan = new Map<EntityId, EntityId>([
    [a, b],
    [b, a],
  ]);
  const evenCount = others.length - (others.length % 2);
  others.forEach((id, index) => {
    if (index < evenCount) plan.set(id, index % 2 === 0 ? a : b);
    else plan.set(id, others.find((other) => other !== id) ?? a); // odd one out votes elsewhere
  });
  return runVoting(session, (voterId) => plan.get(voterId) as EntityId);
}

/** Plays from vote results through the next screens into the next cycle (if any). */
export function continueToNextCycle(session: GameSession): GameSession {
  let current = expectOk(engine.continueFromVoteResults(session));
  if (current.status === 'elimination') current = expectOk(engine.continueFromElimination(current));
  if (current.status === 'next-cycle') current = expectOk(engine.startNextCycle(current, createSeededRandom(7)));
  return current;
}
