import type { GameTypeId } from '@/features/game-types/types';
import type { ClueRoundsPerCycle, CycleReason, RoleType, Winner } from '@/features/gameplay/types/game.types';

/**
 * A completed match as stored on the device. Read-only once saved.
 * `schemaVersion` lets future versions migrate old records safely.
 */
export const GAME_HISTORY_SCHEMA_VERSION = 1;

export interface GameHistoryPlayer {
  id: string;
  name: string;
  color: string;
  role: RoleType;
  eliminated: boolean;
  /** Clue cycle in which the player was voted out. */
  eliminatedRound?: number;
}

export interface GameHistoryCycle {
  cycleNumber: number;
  reason: CycleReason;
  speakingOrder: string[];
  completedClueRounds: number;
}

export interface GameHistoryVote {
  voterId: string;
  votedForId: string;
}

export interface GameHistoryVotingPhase {
  votingPhaseId: string;
  phaseNumber: number;
  cycleNumber: number;
  votes: GameHistoryVote[];
  voteCounts: Record<string, number>;
  isTie: boolean;
  eliminatedPlayerId: string | null;
}

export interface GameHistoryCategory {
  id: string;
  /** Name at the time the game was played (kept even if the database changes). */
  name: string;
}

export interface GameHistory {
  schemaVersion: typeof GAME_HISTORY_SCHEMA_VERSION;
  /** Unique match id (the session id) — prevents duplicate saves. */
  id: string;
  /** Sequential, human-friendly number ("GAME #007"). */
  matchNumber: number;
  /** ISO timestamps. */
  playedAt: string;
  completedAt: string;
  durationSeconds: number;

  gameType: GameTypeId;
  secretWord: string;
  selectedCategoryIds: string[];
  categories: GameHistoryCategory[];
  clueRoundsPerCycle: ClueRoundsPerCycle;

  initialPlayerCount: number;
  initialImposterCount: number;
  players: GameHistoryPlayer[];
  clueCycles: GameHistoryCycle[];
  votingHistory: GameHistoryVotingPhase[];

  totalClueCycles: number;
  totalVotingPhases: number;
  totalEliminations: number;
  totalTiedVotes: number;
  winner: Winner;
}
