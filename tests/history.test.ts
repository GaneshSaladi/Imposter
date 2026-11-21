import { flushAsync, memoryStorage } from './setup/nativeStubs';

import assert from 'node:assert/strict';
import { beforeEach, describe, it } from 'node:test';

import { StorageKeys } from '@/constants/config';
import * as engine from '@/features/gameplay/logic/gameEngine';
import { toGameHistory } from '@/features/gameplay/logic/gameHistoryMapper';
import { getCurrentVoterId } from '@/features/gameplay/logic/votingEngine';
import { isGameHistory, sanitizeHistory, sortNewestFirst } from '@/features/history/services/gameHistoryService';
import type { GameHistory } from '@/features/history/types/history.types';
// Importing the store index registers the "save completed games" listener, like the app does.
import { useGameStore, useHistoryStore } from '@/store';
import type { EntityId } from '@/types/common';
import { createSeededRandom } from '@/utils/random';

import { crewIds, imposterIds, readySession } from './helpers/gameFixtures';

const game = () => useGameStore.getState();
const history = () => useHistoryStore.getState();

/** Plays a full game through the store until crew wins (by voting imposters out). */
function playToCrewWin(seed: number, players = 4, imposters = 1): string {
  game().initializeSession(readySession(players, imposters, seed));
  game().startGame(3, createSeededRandom(seed));
  for (let guard = 0; guard < 10 && game().session?.winner === null; guard++) {
    if (game().session?.status === 'next-cycle') game().startNextCycle();
    game().beginClueRounds();
    for (let turn = 0; turn < 100 && !engine.isClueCycleComplete(game().session!); turn++) {
      const cycle = engine.getCurrentCycle(game().session!)!;
      game().advanceSpeakingTurn({ cycleNumber: cycle.cycleNumber, round: cycle.currentRound, spokenCount: cycle.spokenCount });
    }
    game().startVoting();
    const target = imposterIds(game().session!).find((id) => !game().session!.eliminations.some((e) => e.playerId === id))!;
    let phase = engine.getCurrentVotingPhase(game().session!)!;
    while (getCurrentVoterId(phase)) {
      const voter = getCurrentVoterId(phase) as EntityId;
      const active = engine.getActiveIds(game().session!);
      game().submitVote(voter, voter === target ? (active.find((id) => id !== voter) as EntityId) : target);
      phase = engine.getCurrentVotingPhase(game().session!)!;
    }
    game().resolveVoting();
    game().continueFromVoteResults();
    game().continueFromElimination();
  }
  assert.equal(game().session?.winner, 'crew');
  return game().session!.sessionId;
}

/**
 * Simulates closing and reopening the app: in-memory state is lost, then the
 * store reloads from what is on "disk". (Clearing memory via setState would
 * itself be persisted, so the disk snapshot is restored before reloading.)
 */
async function simulateRestart(diskContents?: string) {
  await flushAsync();
  const disk = diskContents ?? memoryStorage.get(StorageKeys.history);
  useHistoryStore.setState({ records: [], lastMatchNumber: 0 });
  await flushAsync();
  if (disk === undefined) memoryStorage.delete(StorageKeys.history);
  else memoryStorage.set(StorageKeys.history, disk);
  await useHistoryStore.persist.rehydrate();
}

beforeEach(async () => {
  game().resetGame();
  useHistoryStore.setState({ records: [], lastMatchNumber: 0 });
  await flushAsync();
});

describe('history: saving', () => {
  it('saves a completed game exactly once, with a match number', async () => {
    const id = playToCrewWin(1);
    assert.equal(history().records.length, 1);
    const saved = history().records[0];
    assert.equal(saved.id, id);
    assert.equal(saved.matchNumber, 1);
    assert.ok(isGameHistory(saved));

    // Re-saving the same match (e.g. a re-render or second listener) is a no-op.
    history().addRecord(toGameHistory(game().session!)!);
    assert.equal(history().records.length, 1);
    await flushAsync();
    const stored = JSON.parse(memoryStorage.get(StorageKeys.history) ?? '{}');
    assert.equal(stored.state.records.length, 1);
  });

  it('does not save unfinished or abandoned games', () => {
    game().initializeSession(readySession(5, 2, 3));
    game().startGame(3);
    game().resetGame(); // player left mid-game
    assert.equal(history().records.length, 0);
  });

  it('a tie never saves a game (no winner yet)', () => {
    game().initializeSession(readySession(5, 1, 9));
    game().startGame(2);
    assert.equal(history().records.length, 0);
  });
});

describe('history: persistence (scenario E)', () => {
  it('survives app restart, deletes only the selected match, keeps others', async () => {
    const first = playToCrewWin(11);
    const second = playToCrewWin(12, 6, 2);
    const third = playToCrewWin(13);
    assert.deepEqual(history().records.map((r) => r.matchNumber), [1, 2, 3]);
    await flushAsync();

    // "Close and reopen": memory wiped, reloaded from storage.
    await simulateRestart();
    assert.deepEqual(history().records.map((r) => r.id), [first, second, third]);

    // Newest first for display.
    const newest = sortNewestFirst(history().records);
    assert.equal(newest[newest.length - 1].id, first);

    // Detail data is intact and complete.
    const detail = history().records.find((r) => r.id === second)!;
    assert.ok(detail.votingHistory.length >= 2);
    assert.ok(detail.votingHistory.every((phase) => phase.votes.length > 0));
    assert.equal(detail.players.filter((p) => p.role === 'imposter').length, 2);

    history().deleteRecord(second);
    assert.deepEqual(history().records.map((r) => r.id), [first, third]);
    await simulateRestart();
    assert.deepEqual(history().records.map((r) => r.id), [first, third], 'deletion persisted, others kept');

    // Numbers are never reused after a delete.
    playToCrewWin(14);
    assert.equal(history().records.at(-1)?.matchNumber, 4);
  });

  it('play again does not change previous history', async () => {
    playToCrewWin(21);
    const before = JSON.stringify(history().records);
    playToCrewWin(22); // a brand-new session
    assert.equal(history().records.length, 2);
    assert.equal(JSON.stringify(history().records.slice(0, 1)), before);
  });
});

describe('history: invalid persisted data', () => {
  it('keeps valid records and skips malformed ones without crashing', async () => {
    const valid = (() => {
      playToCrewWin(31);
      return history().records[0];
    })();
    const broken: unknown[] = [
      valid,
      { ...valid, id: 'x1', winner: 'nobody' },
      { ...valid, id: 'x2', players: 'oops' },
      { ...valid, id: 'x3', playedAt: 'not a date' },
      null,
      42,
      valid, // duplicate id
    ];
    await simulateRestart(JSON.stringify({ state: { records: broken, lastMatchNumber: 'x' }, version: 1 }));
    assert.deepEqual(history().records.map((r: GameHistory) => r.id), [valid.id]);
    assert.equal(history().lastMatchNumber, 1);

    const { records, invalidCount } = sanitizeHistory(broken);
    assert.equal(records.length, 1);
    assert.equal(invalidCount, 6);
  });

  it('survives completely corrupted or missing storage', async () => {
    await assert.doesNotReject(simulateRestart('{not json'));
    assert.ok(Array.isArray(history().records));
    await flushAsync();
    memoryStorage.delete(StorageKeys.history);
    await assert.doesNotReject(useHistoryStore.persist.rehydrate());
    assert.ok(Array.isArray(history().records));
    assert.deepEqual(sanitizeHistory(undefined), { records: [], invalidCount: 0 });
    assert.deepEqual(sanitizeHistory('garbage'), { records: [], invalidCount: 1 });
  });

  it('active-game secrets are not persisted (only completed history)', async () => {
    game().initializeSession(readySession(4, 1, 41));
    game().startGame(3);
    const word = game().session!.secretWord;
    await flushAsync();
    for (const value of memoryStorage.values()) assert.equal(value.includes(`"secretWord":"${word}"`), false);
    assert.ok(crewIds(game().session!).length === 3);
  });
});
