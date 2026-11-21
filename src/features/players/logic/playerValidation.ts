import { SetupLimits } from '@/features/game-setup/constants';
import { PLAYER_COLORS } from '@/features/players/constants/playerColors';
import type { Player, PlayerColorOption } from '@/features/players/types';
import { normalizeWhitespace } from '@/utils/helpers';
import { invalid, valid, type ValidationResult } from '@/utils/validators';

/**
 * Pure player rules shared by the Add Player form (instant feedback) and
 * the game setup store (final authority).
 */

export function normalizePlayerName(name: string): string {
  return normalizeWhitespace(name);
}

function nameKey(name: string): string {
  return normalizePlayerName(name).toLocaleLowerCase();
}

export function isDuplicatePlayerName(name: string, players: readonly Player[]): boolean {
  const key = nameKey(name);
  return players.some((player) => nameKey(player.name) === key);
}

export function validatePlayerName(name: string, players: readonly Player[]): ValidationResult {
  const normalized = normalizePlayerName(name);
  if (normalized.length === 0) return invalid('Please enter a name.');
  if (normalized.length > SetupLimits.maxPlayerNameLength) {
    return invalid(`Names can be up to ${SetupLimits.maxPlayerNameLength} characters.`);
  }
  if (isDuplicatePlayerName(normalized, players)) {
    return invalid(`"${normalized}" is already playing. Try another name.`);
  }
  return valid();
}

export function getAvailableColors(
  players: readonly Player[],
  palette: readonly PlayerColorOption[] = PLAYER_COLORS,
): PlayerColorOption[] {
  const used = new Set(players.map((player) => player.color));
  return palette.filter((option) => !used.has(option.value));
}

/** True when every palette color is taken — colors may then be shared. */
export function areAllColorsUsed(players: readonly Player[], palette = PLAYER_COLORS): boolean {
  return getAvailableColors(players, palette).length === 0;
}

/** First free color; cycles through the palette once all are used. */
export function getDefaultPlayerColor(players: readonly Player[], palette = PLAYER_COLORS): string {
  const available = getAvailableColors(players, palette);
  return (available[0] ?? palette[players.length % palette.length]).value;
}

export function validatePlayerColor(
  color: string,
  players: readonly Player[],
  palette = PLAYER_COLORS,
): ValidationResult {
  if (!palette.some((option) => option.value === color)) return invalid('Please pick a color.');
  const takenBy = players.find((player) => player.color === color);
  if (takenBy && !areAllColorsUsed(players, palette)) {
    return invalid(`${takenBy.name} already has this color.`);
  }
  return valid();
}
