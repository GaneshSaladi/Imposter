import type { CategoryId } from '@/features/game-setup/types/category.types';

/**
 * Rules for configuring a match. The core constraint:
 *   totalPlayers >= imposters + minCrewmates
 * and crewmates must outnumber imposters (otherwise imposters win at once):
 *   totalPlayers >= 2 * imposters + 1
 */
export const SetupLimits = {
  minPlayers: 4,
  maxPlayers: 12,
  minImposters: 1,
  /** Non-imposters a game always needs. */
  minCrewmates: 3,
  maxPlayerNameLength: 16,
} as const;

export const DEFAULT_PLAYER_COUNTS = {
  totalPlayers: 4,
  imposters: 1,
} as const;

/** Categories selected on first launch (until the user saves their own choice). */
export const DEFAULT_CATEGORY_IDS: readonly CategoryId[] = ['animals', 'fruits', 'food', 'objects'];
