import { useEffect, useRef, useState } from 'react';
import { AppState, type AppStateStatus } from 'react-native';

import { isOneOf } from '@/utils/validators';

const APP_STATES: readonly AppStateStatus[] = ['active', 'background', 'inactive', 'extension', 'unknown'];

/** `AppState.currentState` is typed as a loose string; narrow it safely. */
function getCurrentAppState(): AppStateStatus {
  const state = AppState.currentState;
  return isOneOf(state, APP_STATES) ? state : 'unknown';
}

interface AppStateCallbacks {
  onForeground?: () => void;
  onBackground?: () => void;
}

/**
 * Tracks whether the app is active/background and fires callbacks on transitions
 * (e.g. pause music when backgrounded, resume when foregrounded).
 */
export function useAppState({ onForeground, onBackground }: AppStateCallbacks = {}): AppStateStatus {
  const [appState, setAppState] = useState<AppStateStatus>(getCurrentAppState);
  const previous = useRef<AppStateStatus>(getCurrentAppState());
  const callbacks = useRef<AppStateCallbacks>({ onForeground, onBackground });

  useEffect(() => {
    callbacks.current = { onForeground, onBackground };
  }, [onForeground, onBackground]);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (next) => {
      const wasActive = previous.current === 'active';
      if (!wasActive && next === 'active') callbacks.current.onForeground?.();
      if (wasActive && next.match(/inactive|background/)) callbacks.current.onBackground?.();
      previous.current = next;
      setAppState(next);
    });
    return () => subscription.remove();
  }, []);

  return appState;
}
