import { isClueRoundsPerCycle } from '@/features/gameplay/constants';
import type {
  ClueCycle,
  ClueRoundsPerCycle,
  GameSession,
  GameStatus,
  VotingPhase,
} from '@/features/gameplay/types/game.types';
import type { EntityId, Result } from '@/types/common';
import { generateId } from '@/utils/helpers';
import { defaultRandom, type RandomSource } from '@/utils/random';

import { eliminatePlayer, getEliminatedIds } from './eliminationManager';
import { advanceTurn, createClueCycle, getActivePlayerIds, isCycleComplete } from './turnManager';
import { createVotingOrder, isVotingComplete, resolveVotes, validateVote } from './votingEngine';
import { checkWinCondition, getRemainingCounts, type RemainingCounts } from './winConditionEngine';

/**
 * The game engine: pure, explicit state transitions over a GameSession.
 * Every transition checks the current status and returns a new session
 * (never mutating the input) or an error. Randomness and time are injected.
 */

export type EngineResult = Result<GameSession, string>;

const ok = (session: GameSession): EngineResult => ({ ok: true, value: session });
const fail = (error: string): EngineResult => ({ ok: false, error });

function requireStatus(session: GameSession, ...allowed: GameStatus[]): string | null {
  return allowed.includes(session.status) ? null : `Not allowed while the game is in "${session.status}".`;
}

// ---------------------------------------------------------------- selectors

export function getActiveIds(session: GameSession): EntityId[] {
  return getActivePlayerIds(session.players, getEliminatedIds(session.eliminations));
}

export function getCurrentCycle(session: GameSession): ClueCycle | null {
  return session.cycles[session.cycles.length - 1] ?? null;
}

export function getCurrentVotingPhase(session: GameSession): VotingPhase | null {
  return session.votingPhases[session.votingPhases.length - 1] ?? null;
}

export function getRemaining(session: GameSession): RemainingCounts {
  return getRemainingCounts(session.roles, getEliminatedIds(session.eliminations));
}

export function isClueCycleComplete(session: GameSession): boolean {
  const cycle = getCurrentCycle(session);
  return cycle !== null && session.clueRoundsPerCycle !== null && isCycleComplete(cycle, session.clueRoundsPerCycle);
}

function replaceLast<T>(items: readonly T[], item: T): T[] {
  return [...items.slice(0, -1), item];
}

// -------------------------------------------------------------- role reveal

export function beginRoleReveal(session: GameSession): EngineResult {
  if (session.status === 'role-reveal') return ok(session);
  const error = requireStatus(session, 'preparing');
  return error ? fail(error) : ok({ ...session, status: 'role-reveal' });
}

/** Ignored (error) unless `fromIndex` is the current index — a double tap can't skip a player. */
export function advanceReveal(session: GameSession, fromIndex: number): EngineResult {
  const error = requireStatus(session, 'role-reveal');
  if (error) return fail(error);
  if (session.isRevealComplete || fromIndex !== session.currentRevealIndex) return fail('Stale reveal action.');
  const nextIndex = fromIndex + 1;
  const isRevealComplete = nextIndex >= session.revealOrder.length;
  return ok({ ...session, currentRevealIndex: nextIndex, isRevealComplete, status: isRevealComplete ? 'ready' : 'role-reveal' });
}

// --------------------------------------------------------------- clue phase

/** START GAME: fixes the clue rounds and creates cycle 1 with a fresh speaking order. */
export function startGame(
  session: GameSession,
  clueRoundsPerCycle: ClueRoundsPerCycle,
  random: RandomSource = defaultRandom,
  now: number = Date.now(),
): EngineResult {
  const error = requireStatus(session, 'ready');
  if (error) return fail(error);
  if (!session.isRevealComplete) return fail('Every player must see their role first.');
  if (!isClueRoundsPerCycle(clueRoundsPerCycle)) return fail('Choose 2 or 3 clue rounds.');
  if (checkWinCondition(getRemaining(session)) !== null) return fail('Not enough crewmates to play.');

  const cycle = createClueCycle({ cycleNumber: 1, reason: 'start', activeIds: getActiveIds(session) }, random);
  return ok({ ...session, clueRoundsPerCycle, startedAt: now, cycles: [cycle], status: 'speaking-order' });
}

export function beginClueRounds(session: GameSession): EngineResult {
  const error = requireStatus(session, 'speaking-order');
  return error ? fail(error) : ok({ ...session, status: 'clue-round' });
}

/**
 * NEXT PLAYER. `expected` must match the current turn, so a double tap or a
 * stale screen can never skip a speaker.
 */
export function advanceSpeakingTurn(
  session: GameSession,
  expected: { cycleNumber: number; round: number; spokenCount: number },
): EngineResult {
  const error = requireStatus(session, 'clue-round');
  if (error) return fail(error);
  const cycle = getCurrentCycle(session);
  const rounds = session.clueRoundsPerCycle;
  if (!cycle || rounds === null) return fail('No clue cycle in progress.');
  if (isCycleComplete(cycle, rounds)) return fail('All clue rounds are already complete.');
  if (
    cycle.cycleNumber !== expected.cycleNumber ||
    cycle.currentRound !== expected.round ||
    cycle.spokenCount !== expected.spokenCount
  ) {
    return fail('Stale turn action.');
  }
  return ok({ ...session, cycles: replaceLast(session.cycles, advanceTurn(cycle, rounds)) });
}

// ------------------------------------------------------------------ voting

/** START VOTING: only after every clue round of the cycle is complete. */
export function startVoting(session: GameSession, random: RandomSource = defaultRandom): EngineResult {
  const error = requireStatus(session, 'clue-round');
  if (error) return fail(error);
  const cycle = getCurrentCycle(session);
  if (!cycle || !isClueCycleComplete(session)) return fail('Finish all clue rounds before voting.');

  const phase: VotingPhase = {
    votingPhaseId: generateId(),
    phaseNumber: session.votingPhases.length + 1,
    cycleNumber: cycle.cycleNumber,
    votingOrder: createVotingOrder(getActiveIds(session), random),
    votes: [],
    result: null,
  };
  return ok({ ...session, votingPhases: [...session.votingPhases, phase], status: 'voting' });
}

export function submitVote(session: GameSession, voterId: EntityId, targetId: EntityId): EngineResult {
  const error = requireStatus(session, 'voting');
  if (error) return fail(error);
  const phase = getCurrentVotingPhase(session);
  if (!phase) return fail('No voting in progress.');
  const voteError = validateVote(phase, getActiveIds(session), voterId, targetId);
  if (voteError) return fail(voteError);

  const updated: VotingPhase = { ...phase, votes: [...phase.votes, { voterId, votedForId: targetId }] };
  return ok({ ...session, votingPhases: replaceLast(session.votingPhases, updated) });
}

/**
 * SHOW RESULTS: tallies the votes (only once everyone voted). A unique top
 * vote eliminates that player and the win condition is checked immediately;
 * a tie eliminates nobody and reveals nothing.
 */
export function resolveVoting(session: GameSession, now: number = Date.now()): EngineResult {
  const error = requireStatus(session, 'voting');
  if (error) return fail(error);
  const phase = getCurrentVotingPhase(session);
  if (!phase || phase.result !== null) return fail('No open voting phase.');
  if (!isVotingComplete(phase)) return fail('Every player must vote first.');

  const result = resolveVotes(phase.votes, getActiveIds(session));
  const resolvedPhase: VotingPhase = { ...phase, result };
  let next: GameSession = {
    ...session,
    votingPhases: replaceLast(session.votingPhases, resolvedPhase),
    status: 'vote-results',
  };

  if (result.eliminatedPlayerId !== null) {
    const eliminated = eliminatePlayer(session.roles, session.eliminations, result.eliminatedPlayerId, {
      cycleNumber: phase.cycleNumber,
      votingPhaseId: phase.votingPhaseId,
    });
    if (!eliminated.ok) return fail(eliminated.error);
    next = { ...next, eliminations: eliminated.value };
    const winner = checkWinCondition(getRemaining(next));
    if (winner !== null) next = { ...next, winner, completedAt: now };
  }
  return ok(next);
}

/** Leaves the vote results: tie → next cycle, elimination → elimination reveal. */
export function continueFromVoteResults(session: GameSession): EngineResult {
  const error = requireStatus(session, 'vote-results');
  if (error) return fail(error);
  const result = getCurrentVotingPhase(session)?.result;
  if (!result) return fail('Voting has not been resolved.');
  return ok({ ...session, status: result.isTie ? 'next-cycle' : 'elimination' });
}

/** After the elimination reveal: winner → completed, otherwise → next cycle. */
export function continueFromElimination(session: GameSession): EngineResult {
  const error = requireStatus(session, 'elimination');
  if (error) return fail(error);
  return ok({ ...session, status: session.winner !== null ? 'completed' : 'next-cycle' });
}

/** Fresh speaking order for the remaining players; roles and word unchanged. */
export function startNextCycle(session: GameSession, random: RandomSource = defaultRandom): EngineResult {
  const error = requireStatus(session, 'next-cycle');
  if (error) return fail(error);
  if (session.winner !== null) return fail('The game is already over.');
  const previous = getCurrentCycle(session);
  const lastResult = getCurrentVotingPhase(session)?.result;

  const cycle = createClueCycle(
    {
      cycleNumber: (previous?.cycleNumber ?? 0) + 1,
      reason: lastResult?.isTie ? 'tie' : 'elimination',
      activeIds: getActiveIds(session),
      previousOrder: previous?.speakingOrder,
    },
    random,
  );
  return ok({ ...session, cycles: [...session.cycles, cycle], status: 'speaking-order' });
}
