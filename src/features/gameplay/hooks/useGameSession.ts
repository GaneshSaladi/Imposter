import { getSelectedCategories, getTotalWordCount } from '@/features/game-setup/services/categoryService';
import type { PlayerRole } from '@/features/gameplay/types/game.types';
import type { Player } from '@/features/players/types';
import { useGameStore } from '@/store/gameStore';
import type { EntityId } from '@/types/common';

/**
 * Read-only views of the active session. Only `usePlayerSecret` exposes a
 * role/word — call it solely from the active player's revealed card.
 */

/** Whose turn it is. Contains names only — never roles or the word. */
export function useRevealProgress() {
  const session = useGameStore((s) => s.session);
  const advanceReveal = useGameStore((s) => s.advanceReveal);
  if (!session) return null;

  const { revealOrder, currentRevealIndex, players } = session;
  const findPlayer = (id: EntityId | undefined): Player | null =>
    id === undefined ? null : (players.find((player) => player.id === id) ?? null);

  return {
    sessionId: session.sessionId,
    index: currentRevealIndex,
    total: revealOrder.length,
    isComplete: session.isRevealComplete,
    currentPlayer: session.isRevealComplete ? null : findPlayer(revealOrder[currentRevealIndex]),
    previousPlayer: currentRevealIndex > 0 ? findPlayer(revealOrder[currentRevealIndex - 1]) : null,
    /** Finish the current player's turn (no-op if already advanced, e.g. on a double tap). */
    finishTurn: () => advanceReveal(currentRevealIndex),
  };
}

/** The secret role of one player. Returns null when there is no session. */
export function usePlayerSecret(playerId: EntityId): PlayerRole | null {
  return useGameStore((s) => s.session?.roles.find((role) => role.playerId === playerId) ?? null);
}

/** Public, non-secret facts about the session (safe to show to everyone). */
export function useGameSummary() {
  const session = useGameStore((s) => s.session);
  if (!session) return null;
  return {
    sessionId: session.sessionId,
    playerCount: session.players.length,
    imposterCount: session.imposterCount,
    categories: getSelectedCategories(session.selectedCategoryIds),
    wordCount: getTotalWordCount(session.selectedCategoryIds),
    isRevealComplete: session.isRevealComplete,
  };
}
