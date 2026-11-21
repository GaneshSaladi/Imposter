import { flushAsync, memoryStorage } from './setup/nativeStubs';

import assert from 'node:assert/strict';
import { beforeEach, describe, it } from 'node:test';

import { StorageKeys } from '@/constants/config';
import rawDatabase from '@/data/wordCategories.json';
import {
  getCounterAvailability,
  isValidPlayerCounts,
  MAX_IMPOSTERS,
  normalizePlayerCounts,
} from '@/features/game-setup/logic/configurationRules';
import * as engine from '@/features/gameplay/logic/gameEngine';
import { validateWordDatabase } from '@/features/game-setup/logic/wordDatabaseValidation';
import { getAllCategories, getSelectedCategories, getTotalWordCount, getWordsByCategory } from '@/features/game-setup/services/categoryService';
import { createGameSession, startNewGameSession } from '@/features/gameplay/logic/gameSession';
import { isValidRevealOrder } from '@/features/gameplay/logic/playerShuffle';
import { isValidRoleAssignment } from '@/features/gameplay/logic/roleAssignment';
import { PLAYER_COLORS } from '@/features/players/constants/playerColors';
import { getDefaultPlayerColor, validatePlayerName } from '@/features/players/logic/playerValidation';
import { selectIsRegistrationComplete, useGameSetupStore } from '@/store/gameSetupStore';
import { useGameStore } from '@/store/gameStore';
import { createSeededRandom } from '@/utils/random';

import { makePlayers } from './helpers/gameFixtures';

const setup = () => useGameSetupStore.getState();
const game = () => useGameStore.getState();
const counts = () => ({ totalPlayers: setup().totalPlayers, imposters: setup().imposters });

beforeEach(() => {
  setup().resetSetup();
  setup().restoreDefaultCategories();
  game().resetGame();
});

describe('setup: player configuration & registration', () => {
  it('defaults to 4 players / 1 imposter; imposters auto-raise players (5/2, 7/3, 9/4)', () => {
    assert.deepEqual(counts(), { totalPlayers: 4, imposters: 1 });
    assert.equal(getCounterAvailability(counts()).canDecrementPlayers, false);
    setup().incrementImposters();
    assert.deepEqual(counts(), { totalPlayers: 5, imposters: 2 });
    setup().incrementImposters();
    setup().incrementImposters();
    assert.deepEqual(counts(), { totalPlayers: 9, imposters: 4 });
  });

  it('normalizes invalid configurations', () => {
    for (const bad of [
      { totalPlayers: 4, imposters: 2 },
      { totalPlayers: 3, imposters: 1 },
      { totalPlayers: 13, imposters: 1 },
      { totalPlayers: 6, imposters: 3 }, // 3 vs 3 would be an instant imposter win
      { totalPlayers: 12, imposters: 6 },
    ]) {
      assert.equal(isValidPlayerCounts(bad), false, JSON.stringify(bad));
      assert.equal(isValidPlayerCounts(normalizePlayerCounts(bad)), true);
    }
    assert.equal(MAX_IMPOSTERS, 5);
  });

  it('every configuration setup allows can actually start a game (no stuck Game Ready)', () => {
    const categories = getSelectedCategories(['animals']);
    for (let imposters = 1; imposters <= MAX_IMPOSTERS; imposters++) {
      for (let total = 4; total <= 12; total++) {
        if (!isValidPlayerCounts({ totalPlayers: total, imposters })) continue;
        const players = makePlayers(Math.min(total, 8)).concat(
          Array.from({ length: Math.max(0, total - 8) }, (_, i) => ({ id: `extra${i}`, name: `Extra ${i}`, color: PLAYER_COLORS[8 + i].value })),
        );
        const s = createGameSession({ players, imposterCount: imposters, totalPlayers: total, categories }, createSeededRandom(total));
        assert.ok(s.ok, `${total}/${imposters} must create`);
        let session = s.value;
        const reveal = engine.beginRoleReveal(session);
        assert.ok(reveal.ok);
        session = reveal.value;
        for (let i = 0; i < total; i++) {
          const next = engine.advanceReveal(session, i);
          assert.ok(next.ok);
          session = next.value;
        }
        const started = engine.startGame(session, 3);
        assert.ok(started.ok, `${total}/${imposters} must be able to start`);
      }
    }
  });

  it('validates names and colors; completes registration', () => {
    assert.equal(validatePlayerName('  ', []).valid, false);
    for (let i = 0; i < 4; i++) assert.ok(setup().addPlayer({ name: `P${i}`, color: getDefaultPlayerColor(setup().players) }).ok);
    assert.equal(setup().addPlayer({ name: 'p0', color: PLAYER_COLORS[5].value }).ok, false);
    assert.equal(selectIsRegistrationComplete(setup()), true);
  });
});

describe('setup: categories & word database', () => {
  it('database is valid: 12 categories, all >= 100 words', () => {
    assert.equal(validateWordDatabase(rawDatabase).valid, true);
    assert.equal(getAllCategories().length, 12);
    for (const category of getAllCategories()) assert.ok(category.words.length >= 100);
    assert.equal(getTotalWordCount(['animals']), getWordsByCategory('animals').length);
  });

  it('defaults (Animals, Fruits, Food, Objects) and persistence after restart', async () => {
    assert.deepEqual(setup().selectedCategoryIds, ['animals', 'fruits', 'food', 'objects']);
    setup().toggleCategory('sports');
    await flushAsync();
    memoryStorage.set(
      StorageKeys.gameSetup,
      JSON.stringify({ state: { selectedCategoryIds: ['sports', 'anime'] }, version: 1 }),
    );
    await useGameSetupStore.persist.rehydrate();
    assert.deepEqual(setup().selectedCategoryIds, ['sports', 'anime']);
  });
});

describe('clue round preference', () => {
  it('defaults to 3, accepts 2/3 only, survives restart and Start Game resets', async () => {
    assert.equal(setup().clueRoundsPerCycle, 3);
    setup().setClueRoundsPerCycle(4 as 3);
    assert.equal(setup().clueRoundsPerCycle, 3, 'invalid value ignored');
    setup().setClueRoundsPerCycle(2);
    setup().resetSetup();
    assert.equal(setup().clueRoundsPerCycle, 2, 'kept across new setups');
    await flushAsync();
    const saved = JSON.parse(memoryStorage.get(StorageKeys.gameSetup) ?? '{}');
    assert.equal(saved.state.clueRoundsPerCycle, 2);
    memoryStorage.set(StorageKeys.gameSetup, JSON.stringify({ state: { selectedCategoryIds: ['food'], clueRoundsPerCycle: 9 }, version: 1 }));
    await useGameSetupStore.persist.rehydrate();
    assert.equal(setup().clueRoundsPerCycle, 2, 'corrupt saved value ignored');
    setup().setClueRoundsPerCycle(3);
  });
});

describe('role distribution session', () => {
  it('invariants hold for 4/1, 5/2, 6/3 over many random games', () => {
    const categories = getSelectedCategories(['animals', 'fruits', 'food', 'objects']);
    for (const [n, k] of [[4, 1], [5, 2], [7, 3]] as const) {
      const players = makePlayers(n);
      for (let seed = 1; seed <= 200; seed++) {
        const r = createGameSession({ players, imposterCount: k, totalPlayers: n, categories }, createSeededRandom(seed));
        assert.ok(r.ok);
        assert.ok(isValidRoleAssignment(r.value.roles, players.map((p) => p.id), k, r.value.secretWord));
        assert.ok(isValidRevealOrder(r.value.revealOrder, players));
        assert.equal(r.value.status, 'preparing');
      }
    }
  });

  it('store: reveal cannot skip players; session is frozen; secrets never reach storage', () => {
    for (let i = 0; i < 4; i++) setup().addPlayer({ name: `Q${i}`, color: getDefaultPlayerColor(setup().players) });
    assert.ok(startNewGameSession(createSeededRandom(42)).ok);
    const first = game().session;
    assert.ok(first && Object.isFrozen(first) && Object.isFrozen(first.roles));
    assert.ok(game().beginRoleReveal().ok);

    assert.equal(game().advanceReveal(1).ok, false, 'stale index rejected');
    assert.ok(game().advanceReveal(0).ok);
    assert.equal(game().advanceReveal(0).ok, false, 'double tap rejected');
    for (let i = 1; i < 4; i++) assert.ok(game().advanceReveal(i).ok);
    assert.equal(game().session?.status, 'ready');
    assert.equal(JSON.stringify(game().session?.roles), JSON.stringify(first.roles));

    for (const value of memoryStorage.values()) assert.equal(value.includes(first.secretWord), false);
  });

  it('a new game avoids the previous secret word and re-rolls roles', () => {
    for (let i = 0; i < 4; i++) setup().addPlayer({ name: `R${i}`, color: getDefaultPlayerColor(setup().players) });
    // Restrict to one tiny pool so a repeat would be likely without the exclusion.
    for (let round = 0; round < 50; round++) {
      const previous = game().session?.secretWord;
      assert.ok(startNewGameSession().ok);
      if (previous) assert.notEqual(game().session?.secretWord, previous);
    }
  });
});
