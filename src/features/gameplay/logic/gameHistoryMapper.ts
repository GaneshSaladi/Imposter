import { getCategoryById } from '@/features/game-setup/services/categoryService';
import type { GameSession } from '@/features/gameplay/types/game.types';
import { GAME_HISTORY_SCHEMA_VERSION, type GameHistory } from '@/features/history/types/history.types';

/**
 * Converts a finished session into a history record. Returns null for
 * unfinished games — incomplete games are never saved as history.
 * `matchNumber` is assigned by the history store when saving.
 */
export function toGameHistory(session: GameSession, matchNumber = 0): GameHistory | null {
  if (session.winner === null || session.completedAt === null || session.clueRoundsPerCycle === null) return null;

  const eliminationByPlayer = new Map(session.eliminations.map((elimination) => [elimination.playerId, elimination]));
  const resolvedPhases = session.votingPhases.filter((phase) => phase.result !== null);

  return {
    schemaVersion: GAME_HISTORY_SCHEMA_VERSION,
    id: session.sessionId,
    matchNumber,
    playedAt: new Date(session.createdAt).toISOString(),
    completedAt: new Date(session.completedAt).toISOString(),
    durationSeconds: Math.max(0, Math.round((session.completedAt - session.createdAt) / 1000)),
    gameType: session.gameType,
    secretWord: session.secretWord,
    selectedCategoryIds: [...session.selectedCategoryIds],
    categories: session.selectedCategoryIds.map((id) => ({ id, name: getCategoryById(id)?.name ?? id })),
    clueRoundsPerCycle: session.clueRoundsPerCycle,
    initialPlayerCount: session.players.length,
    initialImposterCount: session.imposterCount,
    players: session.players.map((player) => {
      const role = session.roles.find((entry) => entry.playerId === player.id);
      const elimination = eliminationByPlayer.get(player.id);
      return {
        id: player.id,
        name: player.name,
        color: player.color,
        role: role?.role ?? 'crewmate',
        eliminated: elimination !== undefined,
        ...(elimination ? { eliminatedRound: elimination.cycleNumber } : {}),
      };
    }),
    clueCycles: session.cycles.map((cycle) => ({
      cycleNumber: cycle.cycleNumber,
      reason: cycle.reason,
      speakingOrder: [...cycle.speakingOrder],
      completedClueRounds: cycle.completedRounds,
    })),
    votingHistory: resolvedPhases.map((phase) => ({
      votingPhaseId: phase.votingPhaseId,
      phaseNumber: phase.phaseNumber,
      cycleNumber: phase.cycleNumber,
      votes: phase.votes.map((vote) => ({ voterId: vote.voterId, votedForId: vote.votedForId })),
      voteCounts: { ...(phase.result?.voteCounts ?? {}) },
      isTie: phase.result?.isTie ?? false,
      eliminatedPlayerId: phase.result?.eliminatedPlayerId ?? null,
    })),
    totalClueCycles: session.cycles.length,
    totalVotingPhases: resolvedPhases.length,
    totalEliminations: session.eliminations.length,
    totalTiedVotes: resolvedPhases.filter((phase) => phase.result?.isTie).length,
    winner: session.winner,
  };
}
