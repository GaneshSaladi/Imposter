import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { StorageKeys } from '@/constants/config';
import { DEFAULT_CATEGORY_IDS, DEFAULT_PLAYER_COUNTS } from '@/features/game-setup/constants';
import {
  decrementImposters,
  decrementPlayers,
  incrementImposters,
  incrementPlayers,
  normalizePlayerCounts,
} from '@/features/game-setup/logic/configurationRules';
import {
  getAllCategoryIds,
  getCategoryById,
  getSelectedCategories,
  normalizeCategoryIds,
} from '@/features/game-setup/services/categoryService';
import type { CategoryId, CategorySelection, WordCategory } from '@/features/game-setup/types/category.types';
import type { GameConfiguration, PlayerCounts } from '@/features/game-setup/types';
import { DEFAULT_CLUE_ROUNDS, isClueRoundsPerCycle } from '@/features/gameplay/constants';
import type { ClueRoundsPerCycle } from '@/features/gameplay/types/game.types';
import type { GameTypeId } from '@/features/game-types/types';
import {
  normalizePlayerName,
  validatePlayerColor,
  validatePlayerName,
} from '@/features/players/logic/playerValidation';
import type { NewPlayerInput, Player } from '@/features/players/types';
import { zustandStorage } from '@/services/storage/storageService';
import type { EntityId, Result } from '@/types/common';
import { generateId } from '@/utils/helpers';
import { isRecord } from '@/utils/validators';

/**
 * Setup for the next match.
 * - Session data (game type, counts, players) lives only while the app is open.
 * - Category selection is a saved preference (persisted) and survives resets.
 * Every action re-applies the shared rules, so the store never holds invalid data.
 */
interface GameSetupSessionState extends PlayerCounts {
  gameType: GameTypeId | null;
  players: Player[];
}

interface GameSetupState extends GameSetupSessionState {
  selectedCategoryIds: CategoryId[];
  /** Preferred clue rounds per cycle (chosen on Game Ready; reused by Play Again). */
  clueRoundsPerCycle: ClueRoundsPerCycle;
}

/** The saved preferences (everything else is per session). */
type PersistedGameSetup = CategorySelection & { clueRoundsPerCycle: ClueRoundsPerCycle };

interface GameSetupActions {
  /** Selects a mode. Switching to a different mode starts a fresh session. */
  selectGameType: (gameType: GameTypeId) => void;
  updateConfiguration: (changes: Partial<PlayerCounts>) => void;
  incrementPlayers: () => void;
  decrementPlayers: () => void;
  incrementImposters: () => void;
  decrementImposters: () => void;
  addPlayer: (input: NewPlayerInput) => Result<Player, string>;
  removePlayer: (id: EntityId) => void;
  /** Clears the session (game type, counts, players). Category choices are kept. */
  resetSetup: () => void;

  toggleCategory: (categoryId: CategoryId) => void;
  selectAllCategories: () => void;
  clearAllCategories: () => void;
  restoreDefaultCategories: () => void;
  setClueRoundsPerCycle: (rounds: ClueRoundsPerCycle) => void;
}

export type GameSetupStore = GameSetupState & GameSetupActions;

const initialSessionState: GameSetupSessionState = {
  gameType: null,
  ...DEFAULT_PLAYER_COUNTS,
  players: [],
};

const defaultCategoryIds = (): CategoryId[] => normalizeCategoryIds(DEFAULT_CATEGORY_IDS);

/** Restores a saved selection, dropping ids that no longer exist in the database. */
function restoreSavedCategoryIds(persisted: unknown, fallback: CategoryId[]): CategoryId[] {
  if (!isRecord(persisted) || !Array.isArray(persisted.selectedCategoryIds)) return fallback;
  const saved = persisted.selectedCategoryIds.filter((id): id is string => typeof id === 'string');
  const known = normalizeCategoryIds(saved);
  // An explicit empty choice is respected; a choice of only-removed categories falls back.
  return saved.length > 0 && known.length === 0 ? fallback : known;
}

type CountsUpdater = (counts: PlayerCounts, registeredPlayers: number) => PlayerCounts;

export const useGameSetupStore = create<GameSetupStore>()(
  persist(
    (set, get) => {
      const applyCounts = (update: CountsUpdater) =>
        set((state) => update({ totalPlayers: state.totalPlayers, imposters: state.imposters }, state.players.length));

      return {
        ...initialSessionState,
        selectedCategoryIds: defaultCategoryIds(),
        clueRoundsPerCycle: DEFAULT_CLUE_ROUNDS,

        selectGameType: (gameType) => {
          if (get().gameType === gameType) return;
          set({ ...initialSessionState, gameType });
        },

        updateConfiguration: (changes) =>
          applyCounts((counts, registered) => normalizePlayerCounts({ ...counts, ...changes }, registered)),
        incrementPlayers: () => applyCounts(incrementPlayers),
        decrementPlayers: () => applyCounts(decrementPlayers),
        incrementImposters: () => applyCounts(incrementImposters),
        decrementImposters: () => applyCounts(decrementImposters),

        addPlayer: ({ name, color }) => {
          const { players, totalPlayers } = get();
          if (players.length >= totalPlayers) {
            return { ok: false, error: 'All players are already registered.' };
          }
          const nameCheck = validatePlayerName(name, players);
          if (!nameCheck.valid) return { ok: false, error: nameCheck.message ?? 'Invalid name.' };
          const colorCheck = validatePlayerColor(color, players);
          if (!colorCheck.valid) return { ok: false, error: colorCheck.message ?? 'Invalid color.' };

          const player: Player = { id: generateId(), name: normalizePlayerName(name), color };
          set({ players: [...players, player] });
          return { ok: true, value: player };
        },

        removePlayer: (id) => set((state) => ({ players: state.players.filter((player) => player.id !== id) })),

        resetSetup: () => set(initialSessionState),

        toggleCategory: (categoryId) => {
          if (!getCategoryById(categoryId)) return;
          set((state) => {
            const isSelected = state.selectedCategoryIds.includes(categoryId);
            const next = isSelected
              ? state.selectedCategoryIds.filter((id) => id !== categoryId)
              : [...state.selectedCategoryIds, categoryId];
            return { selectedCategoryIds: normalizeCategoryIds(next) };
          });
        },
        selectAllCategories: () => set({ selectedCategoryIds: getAllCategoryIds() }),
        clearAllCategories: () => set({ selectedCategoryIds: [] }),
        restoreDefaultCategories: () => set({ selectedCategoryIds: defaultCategoryIds() }),
        setClueRoundsPerCycle: (rounds) => {
          if (isClueRoundsPerCycle(rounds)) set({ clueRoundsPerCycle: rounds });
        },
      };
    },
    {
      name: StorageKeys.gameSetup,
      storage: zustandStorage,
      version: 1,
      // Only preferences are saved; players/counts are per session.
      partialize: (state): PersistedGameSetup => ({
        selectedCategoryIds: state.selectedCategoryIds,
        clueRoundsPerCycle: state.clueRoundsPerCycle,
      }),
      merge: (persisted, current) => ({
        ...current,
        selectedCategoryIds: restoreSavedCategoryIds(persisted, current.selectedCategoryIds),
        clueRoundsPerCycle:
          isRecord(persisted) && isClueRoundsPerCycle(persisted.clueRoundsPerCycle)
            ? persisted.clueRoundsPerCycle
            : current.clueRoundsPerCycle,
      }),
    },
  ),
);

// ---- Selectors (return primitives or stable references) ----

export const selectRegisteredCount = (state: GameSetupStore): number => state.players.length;

export const selectRemainingSlots = (state: GameSetupStore): number =>
  Math.max(state.totalPlayers - state.players.length, 0);

export const selectIsRegistrationComplete = (state: GameSetupStore): boolean =>
  state.players.length === state.totalPlayers;

export const selectHasCategorySelection = (state: GameSetupStore): boolean =>
  state.selectedCategoryIds.length > 0;

/** Selected categories with their words. Builds a new array — use outside selectors or memoize. */
export function getSelectedCategoriesFromState(state: GameSetupState): WordCategory[] {
  return getSelectedCategories(state.selectedCategoryIds);
}

/** Snapshot of the finished configuration, or null if no game type is chosen. */
export function getGameConfiguration(state: GameSetupState): GameConfiguration | null {
  if (state.gameType === null) return null;
  return { gameType: state.gameType, totalPlayers: state.totalPlayers, imposters: state.imposters };
}
