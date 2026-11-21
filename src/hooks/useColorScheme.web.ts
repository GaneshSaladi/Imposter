import { useSyncExternalStore } from 'react';
import { useColorScheme as useRNColorScheme } from 'react-native';

const noopSubscribe = () => () => {};

/**
 * Web is server-rendered, so the system scheme is only known on the client.
 * Report light during SSR/hydration to keep server and client markup identical.
 */
export function useColorScheme() {
  const isClient = useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  );
  const colorScheme = useRNColorScheme();

  return isClient ? colorScheme : 'light';
}
