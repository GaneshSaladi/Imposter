import './setup/nativeStubs';

import assert from 'node:assert/strict';
import { beforeEach, describe, it } from 'node:test';

import * as engine from '@/features/gameplay/logic/gameEngine';
import { toGameHistory } from '@/features/gameplay/logic/gameHistoryMapper';
import { startNewGameSession } from '@/features/gameplay/logic/gameSession';
import { getDefaultPlayerColor } from '@/features/players/logic/playerValidation';
import { useGameSetupStore } from '@/store/gameSetupStore';
import { useGameStore } from '@/store/gameStore';
import { createSeededRandom } from '@/utils/random';

import {
  continueToNextCycle,
  crewIds,
  expectOk,
  finishClueCycle,
  imposterIds,
  readySession,
  voteOut,
  voteTie,
} from './helpers/gameFixtures';

describe('results record (mapper)', () => {
  it('returns null for unfinished games', () => {
    const ready = readySession(5, 2, 1);
    assert.equal(toGameHistory(ready), null);
    const midGame = finishClueCycle(expectOk(engine.startGame(ready, 3, createSeededRandom(1))));
    assert.equal(toGameHistory(midGame), null);
  });

  it('captures roles, eliminations, votes, ties and totals accurately', () => {
    let s = finishClueCycle(expectOk(engine.startGame(readySession(6, 2, 77), 2, createSeededRandom(3))));
    const [a, b] = engine.getActiveIds(s);
    s = finishClueCycle(continueToNextCycle(voteTie(s, a, b))); // cycle 1: tie
    const crew = crewIds(s)[0];
    s = finishClueCycle(continueToNextCycle(voteOut(s, crew))); // cycle 2: crewmate out
    const [imp1, imp2] = imposterIds(s);
    s = finishClueCycle(continueToNextCycle(voteOut(s, imp1))); // cycle 3: imposter out
    s = voteOut(s, imp2); // cycle 4: last imposter out → crew wins
    assert.equal(s.winner, 'crew');

    const record = toGameHistory({ ...s, completedAt: s.createdAt + 754_000 });
    assert.ok(record);
    assert.equal(record.winner, 'crew');
    assert.equal(record.secretWord, s.secretWord);
    assert.equal(record.durationSeconds, 754);
    assert.equal(record.clueRoundsPerCycle, 2);
    assert.equal(record.initialPlayerCount, 6);
    assert.equal(record.initialImposterCount, 2);
    assert.equal(record.totalClueCycles, 4);
    assert.equal(record.totalVotingPhases, 4);
    assert.equal(record.totalEliminations, 3);
    assert.equal(record.totalTiedVotes, 1);
    assert.deepEqual(record.votingHistory.map((v) => v.isTie), [true, false, false, false]);
    assert.equal(record.votingHistory[0].eliminatedPlayerId, null);
    assert.equal(record.votingHistory[1].eliminatedPlayerId, crew);
    assert.equal(record.votingHistory[0].votes.length, 6, 'individual votes kept');
    assert.deepEqual(
      record.players.filter((p) => p.role === 'imposter').map((p) => p.id).sort(),
      [imp1, imp2].sort(),
      'every imposter identity revealed',
    );
    const crewRecord = record.players.find((p) => p.id === crew);
    assert.equal(crewRecord?.eliminated, true);
    assert.equal(crewRecord?.eliminatedRound, 2);
    assert.ok(record.clueCycles.every((c) => c.completedClueRounds === 2));
    assert.equal(record.categories[0].name, 'Animals');
    assert.ok(!Number.isNaN(Date.parse(record.playedAt)) && !Number.isNaN(Date.parse(record.completedAt)));
  });
});

describe('play again (scenario F, setup side)', () => {
  const setup = () => useGameSetupStore.getState();
  const game = () => useGameStore.getState();

  beforeEach(() => {
    setup().resetSetup();
    game().resetGame();
  });

  it('keeps players, colors, counts, categories and round preference; new word, roles and order', () => {
    setup().selectGameType('words');
    setup().updateConfiguration({ totalPlayers: 5, imposters: 2 });
    for (const name of ['Ganesh', 'Rahul', 'Priya', 'Akash', 'Sneha']) {
      assert.ok(setup().addPlayer({ name, color: getDefaultPlayerColor(setup().players) }).ok);
    }
    setup().toggleCategory('sports');
    setup().setClueRoundsPerCycle(2);
    const setupBefore = JSON.stringify({
      players: setup().players,
      counts: [setup().totalPlayers, setup().imposters],
      categories: setup().selectedCategoryIds,
      rounds: setup().clueRoundsPerCycle,
    });

    const signatures = new Set<string>();
    let previousWord: string | null = null;
    for (let gameNumber = 0; gameNumber < 25; gameNumber++) {
      assert.ok(startNewGameSession().ok);
      const s = game().session;
      assert.ok(s);
      assert.equal(s.status, 'preparing', 'fresh preparation + private reveal flow');
      assert.equal(s.eliminations.length, 0);
      assert.equal(s.votingPhases.length, 0);
      assert.equal(s.cycles.length, 0);
      assert.deepEqual(s.players.map((p) => p.name), ['Ganesh', 'Rahul', 'Priya', 'Akash', 'Sneha']);
      assert.equal(s.imposterCount, 2);
      assert.ok(s.selectedCategoryIds.includes('sports'));
      if (previousWord) assert.notEqual(s.secretWord, previousWord, 'previous word not reused');
      previousWord = s.secretWord;
      signatures.add(JSON.stringify([s.roles, s.revealOrder]));
    }
    assert.ok(signatures.size > 15, 'roles/orders vary between games');
    assert.equal(
      JSON.stringify({
        players: setup().players,
        counts: [setup().totalPlayers, setup().imposters],
        categories: setup().selectedCategoryIds,
        rounds: setup().clueRoundsPerCycle,
      }),
      setupBefore,
      'setup untouched by playing',
    );
  });
});
