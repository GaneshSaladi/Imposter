import type { CategoryId } from '@/features/game-setup/types/category.types';
import type { GameTypeId } from '@/features/game-types/types';
import type { Player } from '@/features/players/types';
import type { EntityId } from '@/types/common';

export type RoleType = 'crewmate' | 'imposter';

/** Winning side. */
export type Winner = 'crew' | 'imposter';

export type ClueRoundsPerCycle = 2 | 3;

/**
 * Explicit game state machine:
 *
 * preparing → role-reveal → ready → speaking-order → clue-round → voting
 *   → vote-results ─┬─ (tie) ───────────────→ next-cycle → speaking-order …
 *                   └─ (elimination) → elimination ─┬─ (no winner) → next-cycle
 *                                                   └─ (winner) ───→ completed
 */
export type GameStatus =
  | 'preparing'
  | 'role-reveal'
  | 'ready'
  | 'speaking-order'
  | 'clue-round'
  | 'voting'
  | 'vote-results'
  | 'elimination'
  | 'next-cycle'
  | 'completed';

/**
 * A player's secret role. Imposters have no `secretWord` field at all,
 * so imposter-facing code cannot accidentally read it.
 */
export type PlayerRole =
  | { playerId: EntityId; role: 'crewmate'; secretWord: string }
  | { playerId: EntityId; role: 'imposter' };

/** Why a clue cycle started. */
export type CycleReason = 'start' | 'elimination' | 'tie';

/** One clue cycle: the same speaking order for its 2 or 3 rounds. */
export interface ClueCycle {
  cycleNumber: number;
  reason: CycleReason;
  /** Active players in speaking order (fresh shuffle per cycle). */
  speakingOrder: readonly EntityId[];
  /** 1-based round currently being played. */
  currentRound: number;
  /** How many players have spoken in the current round (a prefix of speakingOrder). */
  spokenCount: number;
  completedRounds: number;
}

export interface Vote {
  voterId: EntityId;
  votedForId: EntityId;
}

export interface VotingResult {
  /** Votes per active player (0 included). */
  voteCounts: Readonly<Record<EntityId, number>>;
  maxVotes: number;
  /** Players sharing the highest count. More than one = tie. */
  topPlayerIds: readonly EntityId[];
  isTie: boolean;
  eliminatedPlayerId: EntityId | null;
}

export interface VotingPhase {
  votingPhaseId: string;
  phaseNumber: number;
  cycleNumber: number;
  /** Active players in voting order (independent shuffle). */
  votingOrder: readonly EntityId[];
  /** Submitted votes, in voting order — so the next voter is votingOrder[votes.length]. */
  votes: readonly Vote[];
  /** Set once the phase is resolved; null while voting is in progress. */
  result: VotingResult | null;
}

export interface Elimination {
  playerId: EntityId;
  role: RoleType;
  /** Clue cycle whose vote eliminated the player. */
  cycleNumber: number;
  votingPhaseId: string;
}

/** One match. Kept in memory only; completed matches are copied to history. */
export interface GameSession {
  sessionId: string;
  gameType: GameTypeId;
  /** When preparation started (ms epoch). Used for the game duration. */
  createdAt: number;
  /** Snapshot of the registered players (original registration order). */
  players: readonly Player[];
  imposterCount: number;
  secretWord: string;
  /** Category the secret word came from. */
  secretCategoryId: CategoryId;
  selectedCategoryIds: readonly CategoryId[];
  /** Exactly one role per player, in registration order. Never changes. */
  roles: readonly PlayerRole[];
  /** Player ids in the order the phone is passed for the private reveal. */
  revealOrder: readonly EntityId[];
  /** Index into `revealOrder`; equals its length when done. */
  currentRevealIndex: number;
  isInitialized: boolean;
  isRevealComplete: boolean;

  status: GameStatus;
  /** Chosen on the Game Ready screen; null until the game starts. */
  clueRoundsPerCycle: ClueRoundsPerCycle | null;
  /** When START GAME was pressed (ms epoch). */
  startedAt: number | null;
  /** When the winning condition was reached (ms epoch). */
  completedAt: number | null;
  /** All clue cycles; the last one is the current one. */
  cycles: readonly ClueCycle[];
  /** All voting phases; the last one may be in progress. */
  votingPhases: readonly VotingPhase[];
  eliminations: readonly Elimination[];
  winner: Winner | null;
}
