import { GAME_HISTORY_SCHEMA_VERSION, type GameHistory } from '@/features/history/types/history.types';
import { isRecord } from '@/utils/validators';

/**
 * Validation and helpers for locally stored match history. Persisted data
 * may be missing, from an older version or corrupted — every record is
 * checked field by field before the app trusts it.
 */

const isString = (value: unknown): value is string => typeof value === 'string';
const isNonEmptyString = (value: unknown): value is string => isString(value) && value.length > 0;
const isCount = (value: unknown): value is number => typeof value === 'number' && Number.isInteger(value) && value >= 0;
const isIsoDate = (value: unknown): value is string => isString(value) && !Number.isNaN(Date.parse(value));
const isArrayOf = <T>(value: unknown, guard: (item: unknown) => item is T): value is T[] =>
  Array.isArray(value) && value.every(guard);

function isHistoryPlayer(value: unknown): boolean {
  return (
    isRecord(value) &&
    isNonEmptyString(value.id) &&
    isString(value.name) &&
    isString(value.color) &&
    (value.role === 'crewmate' || value.role === 'imposter') &&
    typeof value.eliminated === 'boolean' &&
    (value.eliminatedRound === undefined || isCount(value.eliminatedRound))
  );
}

function isVote(value: unknown): boolean {
  return isRecord(value) && isNonEmptyString(value.voterId) && isNonEmptyString(value.votedForId);
}

function isVotingPhase(value: unknown): boolean {
  return (
    isRecord(value) &&
    isNonEmptyString(value.votingPhaseId) &&
    isCount(value.phaseNumber) &&
    isCount(value.cycleNumber) &&
    Array.isArray(value.votes) &&
    value.votes.every(isVote) &&
    isRecord(value.voteCounts) &&
    Object.values(value.voteCounts).every(isCount) &&
    typeof value.isTie === 'boolean' &&
    (value.eliminatedPlayerId === null || isNonEmptyString(value.eliminatedPlayerId))
  );
}

function isCycle(value: unknown): boolean {
  return (
    isRecord(value) &&
    isCount(value.cycleNumber) &&
    (value.reason === 'start' || value.reason === 'elimination' || value.reason === 'tie') &&
    isArrayOf(value.speakingOrder, isString) &&
    isCount(value.completedClueRounds)
  );
}

function isCategory(value: unknown): boolean {
  return isRecord(value) && isNonEmptyString(value.id) && isString(value.name);
}

export function isGameHistory(value: unknown): value is GameHistory {
  return (
    isRecord(value) &&
    value.schemaVersion === GAME_HISTORY_SCHEMA_VERSION &&
    isNonEmptyString(value.id) &&
    isCount(value.matchNumber) &&
    isIsoDate(value.playedAt) &&
    isIsoDate(value.completedAt) &&
    isCount(value.durationSeconds) &&
    value.gameType === 'words' &&
    isNonEmptyString(value.secretWord) &&
    isArrayOf(value.selectedCategoryIds, isString) &&
    Array.isArray(value.categories) &&
    value.categories.every(isCategory) &&
    (value.clueRoundsPerCycle === 2 || value.clueRoundsPerCycle === 3) &&
    isCount(value.initialPlayerCount) &&
    isCount(value.initialImposterCount) &&
    Array.isArray(value.players) &&
    value.players.length > 0 &&
    value.players.every(isHistoryPlayer) &&
    Array.isArray(value.clueCycles) &&
    value.clueCycles.every(isCycle) &&
    Array.isArray(value.votingHistory) &&
    value.votingHistory.every(isVotingPhase) &&
    isCount(value.totalClueCycles) &&
    isCount(value.totalVotingPhases) &&
    isCount(value.totalEliminations) &&
    isCount(value.totalTiedVotes) &&
    (value.winner === 'crew' || value.winner === 'imposter')
  );
}

/** Keeps valid, unique records; reports how many were skipped. Never throws. */
export function sanitizeHistory(raw: unknown): { records: GameHistory[]; invalidCount: number } {
  if (!Array.isArray(raw)) return { records: [], invalidCount: raw === undefined || raw === null ? 0 : 1 };
  const seen = new Set<string>();
  const records: GameHistory[] = [];
  let invalidCount = 0;
  raw.forEach((entry: unknown) => {
    if (!isGameHistory(entry) || seen.has(entry.id)) {
      invalidCount += 1;
      return;
    }
    seen.add(entry.id);
    records.push(entry);
  });
  return { records, invalidCount };
}

/** Newest first. */
export function sortNewestFirst(records: readonly GameHistory[]): GameHistory[] {
  return [...records].sort((a, b) => Date.parse(b.completedAt) - Date.parse(a.completedAt));
}

/** Next sequential match number (never reuses numbers of deleted matches still below the max). */
export function nextMatchNumber(records: readonly GameHistory[]): number {
  return records.reduce((max, record) => Math.max(max, record.matchNumber), 0) + 1;
}
