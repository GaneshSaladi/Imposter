import { isValidPlayerCounts } from '@/features/game-setup/logic/configurationRules';
import { getSelectedCategories } from '@/features/game-setup/services/categoryService';
import type { CategoryId, WordCategory } from '@/features/game-setup/types/category.types';
import type { GameTypeId } from '@/features/game-types/types';
import type { GameSession } from '@/features/gameplay/types/game.types';
import type { Player } from '@/features/players/types';
import { useGameSetupStore } from '@/store/gameSetupStore';
import { useGameStore } from '@/store/gameStore';
import type { Result } from '@/types/common';
import { generateId } from '@/utils/helpers';
import { defaultRandom, pickRandom, type RandomSource } from '@/utils/random';

import { createRevealOrder } from './playerShuffle';
import { assignRoles } from './roleAssignment';

export interface GameSessionInput {
  /** Defaults to 'words' (the only mode in V1). */
  gameType?: GameTypeId;
  players: readonly Player[];
  imposterCount: number;
  /** The configured total; registration must be complete. */
  totalPlayers: number;
  categories: readonly WordCategory[];
}

interface WordChoice {
  word: string;
  categoryId: CategoryId;
}

/**
 * One uniformly random word from all words of the given categories combined.
 * `excludeWord` (e.g. the previous game's word) is skipped when other words exist.
 */
export function pickSecretWord(
  categories: readonly WordCategory[],
  random: RandomSource = defaultRandom,
  excludeWord?: string,
): WordChoice {
  const pool: WordChoice[] = categories.flatMap((category) =>
    category.words.map((word) => ({ word, categoryId: category.id })),
  );
  const excluded = excludeWord?.toLocaleLowerCase();
  const fresh = excluded ? pool.filter((choice) => choice.word.toLocaleLowerCase() !== excluded) : pool;
  return pickRandom(fresh.length > 0 ? fresh : pool, random);
}

/**
 * Pure session builder: validates the setup, picks the word, assigns roles
 * and shuffles the reveal order. Does not touch any store.
 */
export function createGameSession(
  input: GameSessionInput,
  random: RandomSource = defaultRandom,
  options: { excludeWord?: string; now?: number } = {},
): Result<GameSession, string> {
  const { players, imposterCount, totalPlayers, categories } = input;

  if (players.length !== totalPlayers) {
    return { ok: false, error: `Register all ${totalPlayers} players first (${players.length} so far).` };
  }
  if (!isValidPlayerCounts({ totalPlayers: players.length, imposters: imposterCount })) {
    return { ok: false, error: `${imposterCount} imposter(s) is not valid for ${players.length} players.` };
  }
  if (new Set(players.map((player) => player.id)).size !== players.length) {
    return { ok: false, error: 'Player list contains duplicates.' };
  }
  if (categories.length === 0) return { ok: false, error: 'Select at least one category.' };
  if (categories.every((category) => category.words.length === 0)) {
    return { ok: false, error: 'The selected categories have no words.' };
  }

  const { word, categoryId } = pickSecretWord(categories, random, options.excludeWord);
  const playerIds = players.map((player) => player.id);

  const session: GameSession = {
    sessionId: generateId(),
    gameType: input.gameType ?? 'words',
    createdAt: options.now ?? Date.now(),
    players: players.map((player) => ({ ...player })),
    imposterCount,
    secretWord: word,
    secretCategoryId: categoryId,
    selectedCategoryIds: categories.map((category) => category.id),
    roles: assignRoles(playerIds, imposterCount, word, random),
    revealOrder: createRevealOrder(players, random),
    currentRevealIndex: 0,
    isInitialized: true,
    isRevealComplete: false,
    status: 'preparing',
    clueRoundsPerCycle: null,
    startedAt: null,
    completedAt: null,
    cycles: [],
    votingPhases: [],
    eliminations: [],
    winner: null,
  };
  return { ok: true, value: session };
}

/**
 * Starts a brand-new game from the current setup and saves it in the game
 * store (replacing any previous session). Call from a user action (categories
 * Continue, Play Again) — never from render or mount — so roles are
 * generated exactly once per game. The previous game's word is avoided.
 */
export function startNewGameSession(random: RandomSource = defaultRandom): Result<GameSession, string> {
  const setup = useGameSetupStore.getState();
  const previousWord = useGameStore.getState().session?.secretWord;
  const result = createGameSession(
    {
      gameType: setup.gameType ?? 'words',
      players: setup.players,
      imposterCount: setup.imposters,
      totalPlayers: setup.totalPlayers,
      categories: getSelectedCategories(setup.selectedCategoryIds),
    },
    random,
    { excludeWord: previousWord },
  );
  if (result.ok) useGameStore.getState().initializeSession(result.value);
  return result;
}
