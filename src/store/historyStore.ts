import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { StorageKeys } from '@/constants/config';
import { nextMatchNumber, sanitizeHistory } from '@/features/history/services/gameHistoryService';
import type { GameHistory } from '@/features/history/types/history.types';
import { zustandStorage } from '@/services/storage/storageService';
import { logError } from '@/utils/errors';
import { isRecord } from '@/utils/validators';

/**
 * Completed matches, persisted on the device (AsyncStorage). Separate from
 * the in-memory game session. Records are read-only once saved.
 */
interface HistoryState {
  /** Stored in save order; use `sortNewestFirst` for display. */
  records: GameHistory[];
  /** Highest match number ever issued — numbers are never reused after deletes. */
  lastMatchNumber: number;
}

interface HistoryActions {
  /**
   * Saves a completed match exactly once (by id) and assigns its match
   * number. Returns the stored record (existing one if already saved).
   */
  addRecord: (record: GameHistory) => GameHistory;
  /** Deletes only the given match. */
  deleteRecord: (id: string) => void;
}

export type HistoryStore = HistoryState & HistoryActions;

export const useHistoryStore = create<HistoryStore>()(
  persist(
    (set, get) => ({
      records: [],
      lastMatchNumber: 0,

      addRecord: (record) => {
        const existing = get().records.find((entry) => entry.id === record.id);
        if (existing) return existing;
        const matchNumber = Math.max(get().lastMatchNumber, nextMatchNumber(get().records) - 1) + 1;
        const saved: GameHistory = { ...record, matchNumber };
        set((state) => ({ records: [...state.records, saved], lastMatchNumber: matchNumber }));
        return saved;
      },

      deleteRecord: (id) => set((state) => ({ records: state.records.filter((record) => record.id !== id) })),
    }),
    {
      name: StorageKeys.history,
      storage: zustandStorage,
      version: 1,
      partialize: (state): HistoryState => ({ records: state.records, lastMatchNumber: state.lastMatchNumber }),
      // Validate everything loaded from disk; skip (and report) anything malformed.
      merge: (persisted, current) => {
        const raw = isRecord(persisted) ? persisted : {};
        const { records, invalidCount } = sanitizeHistory(raw.records);
        if (invalidCount > 0) logError(new Error(`Skipped ${invalidCount} invalid history record(s).`), 'history');
        const savedLast = typeof raw.lastMatchNumber === 'number' && Number.isInteger(raw.lastMatchNumber) ? raw.lastMatchNumber : 0;
        return { ...current, records, lastMatchNumber: Math.max(savedLast, nextMatchNumber(records) - 1) };
      },
    },
  ),
);

export const selectHistoryRecord = (id: string | undefined) => (state: HistoryStore) =>
  id ? state.records.find((record) => record.id === id) : undefined;
