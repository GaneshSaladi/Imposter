import { SetupLimits } from '@/features/game-setup/constants';
import type { CounterAvailability, PlayerCounts } from '@/features/game-setup/types';
import { clamp } from '@/utils/helpers';

/**
 * Pure player/imposter count rules. Used by both the UI (to enable/disable
 * buttons) and the store (to reject invalid state), so they can never drift.
 *
 * `registeredPlayers` keeps the total from dropping below the number of
 * people already registered — remove a player first to go lower.
 */

/** Fewest crewmates needed for `imposters`: at least minCrewmates AND more than the imposters. */
function minCrewmatesFor(imposters: number): number {
  return Math.max(SetupLimits.minCrewmates, imposters + 1);
}

/**
 * Highest imposter count that still fits within maxPlayers. Crewmates must
 * outnumber imposters, otherwise the imposters would already have won before
 * the first clue (V1 rule: imposters win when imposters >= crewmates).
 */
export const MAX_IMPOSTERS = Math.min(
  SetupLimits.maxPlayers - SetupLimits.minCrewmates,
  Math.floor((SetupLimits.maxPlayers - 1) / 2),
);

/** Fewest players allowed for the given imposter count (and registrations). */
export function getMinTotalPlayers(imposters: number, registeredPlayers = 0): number {
  return Math.max(SetupLimits.minPlayers, imposters + minCrewmatesFor(imposters), registeredPlayers);
}

export function getCrewmateCount({ totalPlayers, imposters }: PlayerCounts): number {
  return totalPlayers - imposters;
}

export function isValidPlayerCounts({ totalPlayers, imposters }: PlayerCounts, registeredPlayers = 0): boolean {
  return (
    Number.isInteger(totalPlayers) &&
    Number.isInteger(imposters) &&
    imposters >= SetupLimits.minImposters &&
    imposters <= MAX_IMPOSTERS &&
    totalPlayers <= SetupLimits.maxPlayers &&
    totalPlayers >= getMinTotalPlayers(imposters, registeredPlayers)
  );
}

/**
 * Coerces any requested counts into the nearest valid configuration.
 * Imposters are resolved first; the player total is then raised if needed.
 */
export function normalizePlayerCounts(requested: PlayerCounts, registeredPlayers = 0): PlayerCounts {
  const imposters = clamp(Math.round(requested.imposters), SetupLimits.minImposters, MAX_IMPOSTERS);
  const totalPlayers = clamp(
    Math.round(requested.totalPlayers),
    getMinTotalPlayers(imposters, registeredPlayers),
    SetupLimits.maxPlayers,
  );
  return { totalPlayers, imposters };
}

export function getCounterAvailability(counts: PlayerCounts, registeredPlayers = 0): CounterAvailability {
  return {
    canIncrementPlayers: counts.totalPlayers < SetupLimits.maxPlayers,
    canDecrementPlayers: counts.totalPlayers > getMinTotalPlayers(counts.imposters, registeredPlayers),
    // Adding an imposter auto-adds players, so only the overall cap matters.
    canIncrementImposters: counts.imposters < MAX_IMPOSTERS,
    canDecrementImposters: counts.imposters > SetupLimits.minImposters,
  };
}

export function incrementPlayers(counts: PlayerCounts, registeredPlayers = 0): PlayerCounts {
  return normalizePlayerCounts({ ...counts, totalPlayers: counts.totalPlayers + 1 }, registeredPlayers);
}

export function decrementPlayers(counts: PlayerCounts, registeredPlayers = 0): PlayerCounts {
  return normalizePlayerCounts({ ...counts, totalPlayers: counts.totalPlayers - 1 }, registeredPlayers);
}

/** Adds an imposter, raising the player total when needed to keep enough crewmates. */
export function incrementImposters(counts: PlayerCounts, registeredPlayers = 0): PlayerCounts {
  return normalizePlayerCounts({ ...counts, imposters: counts.imposters + 1 }, registeredPlayers);
}

/** Removes an imposter. The player total is kept as-is. */
export function decrementImposters(counts: PlayerCounts, registeredPlayers = 0): PlayerCounts {
  return normalizePlayerCounts({ ...counts, imposters: counts.imposters - 1 }, registeredPlayers);
}
