import {
  getActiveIds,
  getCurrentCycle,
  getCurrentVotingPhase,
  getRemaining,
  isClueCycleComplete,
} from '@/features/gameplay/logic/gameEngine';
import { getCurrentSpeakerId } from '@/features/gameplay/logic/turnManager';
import { getCurrentVoterId, isVotingComplete } from '@/features/gameplay/logic/votingEngine';
import type { RoleType } from '@/features/gameplay/types/game.types';
import type { Player } from '@/features/players/types';
import { useGameStore } from '@/store/gameStore';
import type { EntityId } from '@/types/common';

/** A player as everyone may see them: roles only for players already eliminated. */
export interface PublicPlayer extends Player {
  eliminated: boolean;
  /** Revealed role — set only once the player has been eliminated. */
  revealedRole: RoleType | null;
  eliminatedInCycle: number | null;
}

/**
 * Public view of the running game + its actions. Never exposes the secret
 * word or the roles of players still in the game.
 */
export function useGameEngine() {
  const session = useGameStore((s) => s.session);
  const actions = useGameStore.getState();
  if (!session) return null;

  const eliminationByPlayer = new Map(session.eliminations.map((elimination) => [elimination.playerId, elimination]));
  const players: PublicPlayer[] = session.players.map((player) => {
    const elimination = eliminationByPlayer.get(player.id);
    return {
      ...player,
      eliminated: elimination !== undefined,
      revealedRole: elimination?.role ?? null,
      eliminatedInCycle: elimination?.cycleNumber ?? null,
    };
  });
  const byId = new Map(players.map((player) => [player.id, player]));
  const playerById = (id: EntityId | null | undefined): PublicPlayer | null => (id ? (byId.get(id) ?? null) : null);

  const activeIds = getActiveIds(session);
  const cycle = getCurrentCycle(session);
  const rounds = session.clueRoundsPerCycle ?? 0;
  const votingPhase = getCurrentVotingPhase(session);
  const remaining = getRemaining(session);

  return {
    sessionId: session.sessionId,
    status: session.status,
    players,
    playerById,
    activePlayers: activeIds.map((id) => byId.get(id) as PublicPlayer),
    eliminatedPlayers: players.filter((player) => player.eliminated),
    /** General statistic only — never which players. */
    remainingImposters: remaining.imposters,
    clueRoundsPerCycle: rounds,
    cycle,
    isCycleComplete: isClueCycleComplete(session),
    currentSpeaker: cycle ? playerById(getCurrentSpeakerId(cycle, rounds)) : null,
    votingPhase,
    currentVoter: votingPhase ? playerById(getCurrentVoterId(votingPhase)) : null,
    isVotingComplete: votingPhase ? isVotingComplete(votingPhase) : false,
    isGameOver: session.winner !== null,
    actions: {
      beginClueRounds: actions.beginClueRounds,
      advanceSpeakingTurn: actions.advanceSpeakingTurn,
      startVoting: actions.startVoting,
      submitVote: actions.submitVote,
      resolveVoting: actions.resolveVoting,
      continueFromVoteResults: actions.continueFromVoteResults,
      continueFromElimination: actions.continueFromElimination,
      startNextCycle: actions.startNextCycle,
    },
  };
}

export type GameEngineView = NonNullable<ReturnType<typeof useGameEngine>>;
