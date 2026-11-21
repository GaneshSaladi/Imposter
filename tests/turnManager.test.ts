import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  advanceTurn,
  createClueCycle,
  createSpeakingOrder,
  getActivePlayerIds,
  getCurrentSpeakerId,
  isCycleComplete,
} from '@/features/gameplay/logic/turnManager';
import { createSeededRandom } from '@/utils/random';

import { makePlayers } from './helpers/gameFixtures';

describe('turn manager', () => {
  const players = makePlayers(5);
  const ids = players.map((p) => p.id);

  it('includes all active players exactly once and excludes eliminated players', () => {
    const active = getActivePlayerIds(players, new Set(['rahul']));
    assert.deepEqual(active, ['ganesh', 'priya', 'akash', 'sneha']);
    for (let seed = 1; seed <= 200; seed++) {
      const order = createSpeakingOrder(active, createSeededRandom(seed));
      assert.equal(order.length, 4);
      assert.equal(new Set(order).size, 4);
      assert.ok(!order.includes('rahul'));
      assert.deepEqual([...order].sort(), [...active].sort());
    }
  });

  it('does not modify the registered player array', () => {
    const snapshot = JSON.stringify(players);
    createSpeakingOrder(ids, createSeededRandom(3));
    assert.equal(JSON.stringify(players), snapshot);
  });

  it('is uniform-ish: every player starts first sometimes (no registration bias)', () => {
    const firsts = new Map<string, number>();
    for (let seed = 1; seed <= 2000; seed++) {
      const first = createSpeakingOrder(ids, createSeededRandom(seed))[0];
      firsts.set(first, (firsts.get(first) ?? 0) + 1);
    }
    assert.equal(firsts.size, 5);
    for (const [, count] of firsts) assert.ok(count > 300 && count < 500, `first-speaker count ${count} (~400 expected)`);
  });

  it('generates a new order for each new cycle (never identical to the previous one)', () => {
    for (let seed = 1; seed <= 300; seed++) {
      const random = createSeededRandom(seed);
      const first = createClueCycle({ cycleNumber: 1, reason: 'start', activeIds: ids }, random);
      const second = createClueCycle(
        { cycleNumber: 2, reason: 'tie', activeIds: ids, previousOrder: first.speakingOrder },
        random,
      );
      assert.notDeepEqual(second.speakingOrder, first.speakingOrder);
    }
  });

  it('keeps the same order across all rounds of a cycle and completes after N rounds', () => {
    for (const rounds of [2, 3] as const) {
      let cycle = createClueCycle({ cycleNumber: 1, reason: 'start', activeIds: ids }, createSeededRandom(5));
      const order = [...cycle.speakingOrder];
      const spoken: string[] = [];
      while (!isCycleComplete(cycle, rounds)) {
        const speaker = getCurrentSpeakerId(cycle, rounds);
        assert.ok(speaker);
        spoken.push(speaker);
        cycle = advanceTurn(cycle, rounds);
        assert.deepEqual([...cycle.speakingOrder], order, 'order stable within the cycle');
      }
      assert.equal(spoken.length, ids.length * rounds);
      assert.deepEqual(spoken, Array.from({ length: rounds }, () => order).flat());
      assert.equal(cycle.completedRounds, rounds);
      assert.equal(getCurrentSpeakerId(cycle, rounds), null);
      assert.equal(advanceTurn(cycle, rounds), cycle, 'advancing a complete cycle is a no-op');
    }
  });
});
