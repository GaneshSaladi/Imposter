import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { checkWinCondition, getRemainingCounts } from '@/features/gameplay/logic/winConditionEngine';
import type { PlayerRole } from '@/features/gameplay/types/game.types';

describe('win condition engine', () => {
  it('matches the V1 rule table', () => {
    const table: [number, number, 'crew' | 'imposter' | null][] = [
      [1, 4, null],
      [1, 3, null],
      [1, 2, null],
      [1, 1, 'imposter'],
      [2, 3, null],
      [2, 2, 'imposter'],
      [3, 3, 'imposter'],
      [3, 2, 'imposter'],
      [0, 4, 'crew'],
      [0, 1, 'crew'],
    ];
    for (const [imposters, crewmates, expected] of table) {
      assert.equal(checkWinCondition({ imposters, crewmates }), expected, `${imposters} vs ${crewmates}`);
    }
  });

  it('counts remaining roles, ignoring eliminated players', () => {
    const roles: PlayerRole[] = [
      { playerId: 'a', role: 'crewmate', secretWord: 'X' },
      { playerId: 'b', role: 'imposter' },
      { playerId: 'c', role: 'crewmate', secretWord: 'X' },
      { playerId: 'd', role: 'imposter' },
    ];
    assert.deepEqual(getRemainingCounts(roles, new Set()), { imposters: 2, crewmates: 2 });
    assert.deepEqual(getRemainingCounts(roles, new Set(['b', 'c'])), { imposters: 1, crewmates: 1 });
  });
});
