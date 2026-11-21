import { Stack } from 'expo-router';

import { useStackScreenOptions } from '@/hooks/useStackScreenOptions';

/**
 * New-game flow: game type → player configuration → player registration
 * → setup complete → categories. Back navigation never resets setup data.
 */
export default function SetupLayout() {
  const screenOptions = useStackScreenOptions();

  return (
    <Stack screenOptions={screenOptions}>
      <Stack.Screen name="game-type" options={{ title: 'New Game' }} />
      <Stack.Screen name="player-setup" options={{ title: 'Players' }} />
      <Stack.Screen name="player-registration" options={{ title: 'Register Players' }} />
      <Stack.Screen name="setup-complete" options={{ title: 'Lineup' }} />
      <Stack.Screen name="categories" options={{ title: 'Categories' }} />
    </Stack>
  );
}
