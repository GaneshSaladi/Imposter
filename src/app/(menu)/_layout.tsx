import { Stack } from 'expo-router';

import { useStackScreenOptions } from '@/hooks/useStackScreenOptions';

// Deep links to /settings or /profile still get Home underneath, so "back" works.
export const unstable_settings = {
  anchor: 'home',
};

export default function MenuLayout() {
  const screenOptions = useStackScreenOptions();

  return (
    <Stack screenOptions={screenOptions}>
      <Stack.Screen name="home" options={{ headerShown: false }} />
      <Stack.Screen name="how-to-play" options={{ title: 'How to Play' }} />
      <Stack.Screen name="settings" options={{ title: 'Settings' }} />
      <Stack.Screen name="word-categories" options={{ title: 'Word Categories' }} />
      <Stack.Screen name="history" options={{ title: 'Game History' }} />
      <Stack.Screen name="history/[matchId]" options={{ title: 'Match Details' }} />
      <Stack.Screen name="profile" options={{ title: 'Profile' }} />
    </Stack>
  );
}
