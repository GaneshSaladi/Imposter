import { useEffect, useState } from 'react';

import { toGameHistory } from '@/features/gameplay/logic/gameHistoryMapper';

import { useGameSetupStore } from './gameSetupStore';
import { onGameCompleted, useGameStore } from './gameStore';
import { useHistoryStore } from './historyStore';
import { useSettingsStore } from './settingsStore';

export { useGameSetupStore, useGameStore, useHistoryStore, useSettingsStore };
export { selectHistoryRecord } from './historyStore';
export type { HistoryStore } from './historyStore';

/**
 * Save every completed game to history the moment its winner is decided
 * (before the reveal screens), so an interruption afterwards can't lose it.
 * `addRecord` is idempotent by match id, so it can never be saved twice.
 */
onGameCompleted((session) => {
  const record = toGameHistory(session);
  if (record) useHistoryStore.getState().addRecord(record);
});
export {
  getGameConfiguration,
  getSelectedCategoriesFromState,
  selectHasCategorySelection,
  selectIsRegistrationComplete,
  selectRegisteredCount,
  selectRemainingSlots,
} from './gameSetupStore';
export type { GameSetupStore } from './gameSetupStore';
export type { GameStore } from './gameStore';
export type { SettingsStore } from './settingsStore';

const persistedStores = [useSettingsStore, useGameSetupStore, useHistoryStore] as const;

function allHydrated(): boolean {
  return persistedStores.every((store) => store.persist.hasHydrated());
}

/** True once every persisted store has finished loading from AsyncStorage. */
export function useStoresHydrated(): boolean {
  const [hydrated, setHydrated] = useState(allHydrated);

  useEffect(() => {
    if (hydrated) return;
    const check = () => {
      if (allHydrated()) setHydrated(true);
    };
    const unsubscribers = persistedStores.map((store) => store.persist.onFinishHydration(check));
    check();
    return () => unsubscribers.forEach((unsubscribe) => unsubscribe());
  }, [hydrated]);

  return hydrated;
}
