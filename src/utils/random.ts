/**
 * Randomization utilities. Every function takes an optional `random` source
 * so game logic can be tested deterministically with `createSeededRandom`.
 */

/** Returns a float in [0, 1). */
export type RandomSource = () => number;

export const defaultRandom: RandomSource = Math.random;

/** Integer in [0, maxExclusive). */
export function randomInt(maxExclusive: number, random: RandomSource = defaultRandom): number {
  if (!Number.isInteger(maxExclusive) || maxExclusive <= 0) {
    throw new RangeError(`randomInt: maxExclusive must be a positive integer (got ${maxExclusive})`);
  }
  return Math.floor(random() * maxExclusive);
}

/** Returns a new, uniformly shuffled array (Fisher–Yates). Never mutates the input. */
export function shuffle<T>(items: readonly T[], random: RandomSource = defaultRandom): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = randomInt(i + 1, random);
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export function pickRandom<T>(items: readonly T[], random: RandomSource = defaultRandom): T {
  if (items.length === 0) throw new RangeError('pickRandom: cannot pick from an empty list');
  return items[randomInt(items.length, random)];
}

/** `count` distinct items, chosen uniformly. */
export function sampleWithoutReplacement<T>(
  items: readonly T[],
  count: number,
  random: RandomSource = defaultRandom,
): T[] {
  if (count < 0 || count > items.length) {
    throw new RangeError(`sampleWithoutReplacement: cannot take ${count} of ${items.length}`);
  }
  return shuffle(items, random).slice(0, count);
}

/** Deterministic generator (mulberry32) for tests and reproducible debugging. */
export function createSeededRandom(seed: number): RandomSource {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
