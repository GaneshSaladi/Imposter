import { Stack } from 'expo-router';

import { useTheme } from '@/hooks/useTheme';

/**
 * Active match: get ready → private role reveal → game ready → play.
 * Swipe-back is disabled so nobody can return to a previous player's card;
 * Android back is intercepted per screen by `useLeaveGameGuard`.
 */
export default function GameLayout() {
  const { colors } = useTheme();

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        gestureEnabled: false,
        animation: 'fade',
        contentStyle: { backgroundColor: colors.background },
      }}
    />
  );
}
