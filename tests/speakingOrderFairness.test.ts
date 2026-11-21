import './setup/nativeStubs';

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import * as engine from '@/features/gameplay/logic/gameEngine';
import { createGameSession } from '@/features/gameplay/logic/gameSession';
import { createSpeakingOrder } from '@/features/gameplay/logic/turnManager';
import type { GameSession } from '@/features/gameplay/types/game.types';
import { createSeededRandom, type RandomSource } from '@/utils/random';

import {
  crewIds,
  defaultCategories,
  expectOk,
  finishClueCycle,
  imposterIds,
  makePlayers,
  voteOut,
  voteTie,
} from './helpers/gameFixtures';

/**
 * Speaking-order fairness, measured over the REAL game pipeline
 * (create session → assign roles → reveal → START GAME → next cycles).
 *
 * Distribution tests use a seeded generator so they are deterministic
 * (never flaky); the app itself uses Math.random through the same code.
 * Chi-square thresholds are at p = 0.001.
 */

// Chi-square critical values at p = 0.001 by degrees of freedom.
const CHI2_CRITICAL_P001: Record<number, number> = { 2: 13.82, 3: 16.27, 4: 18.47, 5: 20.52, 9: 27.88, 16: 39.25, 25: 52.62 };

function chiSquare(observed: number[]): number {
  const total = observed.reduce((a, b) => a + b, 0);
  const expected = total / observed.length;
  return observed.reduce((sum, o) => sum + (o - expected) ** 2 / expected, 0);
}

function startedGame(playerCount: number, imposters: number, random: RandomSource): GameSession {
  let s = expectOk(
    createGameSession(
      { players: makePlayers(playerCount), imposterCount: imposters, totalPlayers: playerCount, categories: defaultCategories() },
      random,
    ),
  );
  s = expectOk(engine.beginRoleReveal(s));
  for (let i = 0; i < playerCount; i++) s = expectOk(engine.advanceReveal(s, i));
  return expectOk(engine.startGame(s, 3, random));
}

const pct = (count: number, total: number) => `${((count / total) * 100).toFixed(1)}%`;

describe('speaking order fairness (real pipeline)', () => {
  for (const playerCount of [4, 5, 6]) {
    it(`${playerCount} players / 1 imposter: imposter is equally likely in every position`, () => {
      const GAMES = 12_000;
      const rng = createSeededRandom(4_000 + playerCount);
      const positions = new Array<number>(playerCount).fill(0);
      for (let game = 0; game < GAMES; game++) {
        const s = startedGame(playerCount, 1, rng);
        positions[engine.getCurrentCycle(s)!.speakingOrder.indexOf(imposterIds(s)[0])] += 1;
      }
      const chi = chiSquare(positions);
      console.log(
        `    ${playerCount}p imposter position (1st..last): ${positions.map((c) => pct(c, GAMES)).join(' | ')}  χ²=${chi.toFixed(2)}`,
      );
      assert.ok(chi < CHI2_CRITICAL_P001[playerCount - 1], `biased: χ²=${chi.toFixed(2)} ${positions.join(',')}`);
      const lastShare = positions[playerCount - 1] / GAMES;
      assert.ok(Math.abs(lastShare - 1 / playerCount) < 0.02, `imposter last ${pct(positions[playerCount - 1], GAMES)}`);
    });
  }

  it('no player (by registration slot) is favoured for any position — 5×5 table', () => {
    const GAMES = 15_000;
    const rng = createSeededRandom(5_150);
    const table = Array.from({ length: 5 }, () => new Array<number>(5).fill(0));
    for (let game = 0; game < GAMES; game++) {
      const s = startedGame(5, 2, rng);
      engine.getCurrentCycle(s)!.speakingOrder.forEach((id, position) => {
        table[s.players.findIndex((p) => p.id === id)][position] += 1;
      });
    }
    const expected = GAMES / 5;
    const chi = table.flat().reduce((sum, o) => sum + (o - expected) ** 2 / expected, 0);
    assert.ok(chi < CHI2_CRITICAL_P001[16], `registration bias χ²=${chi.toFixed(2)}`);
  });

  it('crewmates and imposters have the same position distribution (no role bias, 5p/2 imposters)', () => {
    const GAMES = 12_000;
    const rng = createSeededRandom(6_252);
    const imp = new Array<number>(5).fill(0);
    const crew = new Array<number>(5).fill(0);
    for (let game = 0; game < GAMES; game++) {
      const s = startedGame(5, 2, rng);
      const order = engine.getCurrentCycle(s)!.speakingOrder;
      imposterIds(s).forEach((id) => (imp[order.indexOf(id)] += 1));
      crewIds(s).forEach((id) => (crew[order.indexOf(id)] += 1));
    }
    console.log(`    imposters (1st..last): ${imp.map((c) => pct(c, GAMES * 2)).join(' | ')}`);
    console.log(`    crewmates (1st..last): ${crew.map((c) => pct(c, GAMES * 3)).join(' | ')}`);
    assert.ok(chiSquare(imp) < CHI2_CRITICAL_P001[4]);
    assert.ok(chiSquare(crew) < CHI2_CRITICAL_P001[4]);
  });

  it('later cycles are fair too: after a tie and after an elimination (remaining players only)', () => {
    const GAMES = 6_000;
    const afterTie = new Array<number>(6).fill(0);
    const afterElimination = new Array<number>(5).fill(0);
    // One continuous random stream across cycles, like the app's startNextCycle().
    const rng = createSeededRandom(7_373);
    const toNextCycle = (session: GameSession) => {
      let s = expectOk(engine.continueFromVoteResults(session));
      if (s.status === 'elimination') s = expectOk(engine.continueFromElimination(s));
      return expectOk(engine.startNextCycle(s, rng));
    };
    for (let game = 0; game < GAMES; game++) {
      let s = finishClueCycle(startedGame(6, 2, rng));
      const [a, b] = engine.getActiveIds(s);
      s = toNextCycle(voteTie(s, a, b));
      const tieOrder = engine.getCurrentCycle(s)!.speakingOrder;
      afterTie[tieOrder.indexOf(imposterIds(s)[0])] += 1;

      s = toNextCycle(voteOut(finishClueCycle(s), crewIds(s)[0]));
      const order = engine.getCurrentCycle(s)!.speakingOrder;
      assert.equal(order.length, 5);
      assert.ok(!order.includes(crewIds(s)[0]), 'eliminated player never speaks again');
      afterElimination[order.indexOf(imposterIds(s)[0])] += 1;
    }
    assert.ok(chiSquare(afterTie) < CHI2_CRITICAL_P001[5], `after tie ${afterTie.join(',')}`);
    assert.ok(chiSquare(afterElimination) < CHI2_CRITICAL_P001[4], `after elimination ${afterElimination.join(',')}`);
  });

  it('10 new games (4 players, 1 imposter): imposter is not consistently last; different players go first and last', () => {
    const lastIsImposter: boolean[] = [];
    const firsts = new Set<string>();
    const lasts = new Set<string>();
    for (let game = 0; game < 10; game++) {
      const s = startedGame(4, 1, createSeededRandom(500 + game));
      const order = engine.getCurrentCycle(s)!.speakingOrder;
      lastIsImposter.push(order[order.length - 1] === imposterIds(s)[0]);
      firsts.add(order[0]);
      lasts.add(order[order.length - 1]);
    }
    assert.ok(lastIsImposter.filter(Boolean).length <= 5, `imposter last in ${lastIsImposter.filter(Boolean).length}/10`);
    assert.ok(firsts.size >= 3 && lasts.size >= 3);
  });

  it('the shuffle itself never mutates its input and gives every element every position', () => {
    const ids = ['a', 'b', 'c', 'd'];
    const counts = ids.map(() => new Array<number>(4).fill(0));
    const SHUFFLES = 20_000;
    const rng = createSeededRandom(8_484);
    for (let i = 0; i < SHUFFLES; i++) {
      createSpeakingOrder(ids, rng).forEach((id, position) => (counts[ids.indexOf(id)][position] += 1));
    }
    assert.deepEqual(ids, ['a', 'b', 'c', 'd']);
    const expected = SHUFFLES / ids.length; // each element lands in each position 1/4 of the time
    const chi = counts.flat().reduce((sum, o) => sum + (o - expected) ** 2 / expected, 0);
    assert.ok(chi < CHI2_CRITICAL_P001[9], `χ²=${chi.toFixed(2)}`);
  });
});
