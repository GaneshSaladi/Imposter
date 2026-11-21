import { create } from 'zustand';

import * as engine from '@/features/gameplay/logic/gameEngine';
import type { ClueRoundsPerCycle, GameSession } from '@/features/gameplay/types/game.types';
import type { EntityId } from '@/types/common';
import { logError } from '@/utils/errors';
import { deepFreeze } from '@/utils/freeze';
import { defaultRandom, type RandomSource } from '@/utils/random';

/**
 * The active match. Memory only — secret roles and words are never persisted
 * here (completed matches are copied to the history store).
 *
 * Every action delegates to the pure game engine, which validates the current
 * status; invalid or stale actions are rejected and leave state untouched.
 * Components never modify the session directly.
 */
interface GameState {
  session: GameSession | null;
}

type ActionResult = engine.EngineResult;

interface GameActions {
  /** Stores a freshly created session (replacing any previous one). */
  initializeSession: (session: GameSession) => void;
  beginRoleReveal: () => ActionResult;
  /** Moves past the reveal at `fromIndex` (ignored if stale — no skipping). */
  advanceReveal: (fromIndex: number) => ActionResult;
  startGame: (clueRoundsPerCycle: ClueRoundsPerCycle, random?: RandomSource) => ActionResult;
  beginClueRounds: () => ActionResult;
  advanceSpeakingTurn: (expected: { cycleNumber: number; round: number; spokenCount: number }) => ActionResult;
  startVoting: (random?: RandomSource) => ActionResult;
  submitVote: (voterId: EntityId, targetId: EntityId) => ActionResult;
  resolveVoting: () => ActionResult;
  continueFromVoteResults: () => ActionResult;
  continueFromElimination: () => ActionResult;
  startNextCycle: (random?: RandomSource) => ActionResult;
  /** Discards the session (secrets included). */
  resetGame: () => void;
  /** Discards the session only if it is still `sessionId` (safe for delayed cleanup). */
  endSession: (sessionId: string) => void;
}

export type GameStore = GameState & GameActions;

/** Called once when a session first gets a winner (wired to history in the store setup). */
type CompletionListener = (session: GameSession) => void;
const completionListeners = new Set<CompletionListener>();

export function onGameCompleted(listener: CompletionListener): () => void {
  completionListeners.add(listener);
  return () => completionListeners.delete(listener);
}

export const useGameStore = create<GameStore>()((set, get) => {
  /** Runs one engine transition against the current session. */
  const run = (label: string, transition: (session: GameSession) => ActionResult): ActionResult => {
    const { session } = get();
    if (!session) return { ok: false, error: 'No active game.' };
    const result = transition(session);
    if (!result.ok) {
      logError(new Error(result.error), `game.${label}`);
      return result;
    }
    const next = deepFreeze(result.value);
    set({ session: next });
    if (session.winner === null && next.winner !== null) {
      completionListeners.forEach((listener) => listener(next));
    }
    return { ok: true, value: next };
  };

  return {
    session: null,

    initializeSession: (session) => set({ session: deepFreeze({ ...session }) }),
    beginRoleReveal: () => run('beginRoleReveal', engine.beginRoleReveal),
    advanceReveal: (fromIndex) => run('advanceReveal', (s) => engine.advanceReveal(s, fromIndex)),
    startGame: (rounds, random = defaultRandom) => run('startGame', (s) => engine.startGame(s, rounds, random)),
    beginClueRounds: () => run('beginClueRounds', engine.beginClueRounds),
    advanceSpeakingTurn: (expected) => run('advanceSpeakingTurn', (s) => engine.advanceSpeakingTurn(s, expected)),
    startVoting: (random = defaultRandom) => run('startVoting', (s) => engine.startVoting(s, random)),
    submitVote: (voterId, targetId) => run('submitVote', (s) => engine.submitVote(s, voterId, targetId)),
    resolveVoting: () => run('resolveVoting', (s) => engine.resolveVoting(s)),
    continueFromVoteResults: () => run('continueFromVoteResults', engine.continueFromVoteResults),
    continueFromElimination: () => run('continueFromElimination', engine.continueFromElimination),
    startNextCycle: (random = defaultRandom) => run('startNextCycle', (s) => engine.startNextCycle(s, random)),

    resetGame: () => set({ session: null }),
    endSession: (sessionId) => set((state) => (state.session?.sessionId === sessionId ? { session: null } : state)),
  };
});
