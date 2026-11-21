import './setup/nativeStubs';

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { checkWinCondition } from '@/features/gameplay/logic/winConditionEngine';
import { QUICK_RULES, STEPS, WIN_CONDITIONS } from '@/features/how-to-play/constants/howToPlayContent';

describe('How to Play content matches the real game rules', () => {
  it('every win example gives the result the engine would', () => {
    for (const condition of WIN_CONDITIONS) {
      for (const example of condition.examples) {
        const winner = checkWinCondition({ imposters: example.count.imposters, crewmates: example.count.crewmates });
        const expected = example.isWin ? condition.side : null;
        assert.equal(winner, expected, `${condition.title}: "${example.label}"`);
      }
    }
  });

  it('covers both win conditions, the equal-numbers case and ties', () => {
    assert.deepEqual(WIN_CONDITIONS.map((c) => c.side), ['crew', 'imposter']);
    const imposterExamples = WIN_CONDITIONS[1].examples;
    assert.ok(imposterExamples.some((e) => e.isWin && e.count.imposters === e.count.crewmates), 'equal numbers explained');
    assert.ok(STEPS.some((s) => s.outcomes?.some((o) => /tie/i.test(o.title))), 'tie explained');
    assert.ok(QUICK_RULES.some((r) => /tie/i.test(r)));
    assert.deepEqual(STEPS.map((s) => s.step), [1, 2, 3, 4, 5]);
  });
});
