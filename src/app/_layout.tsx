import { DarkTheme, DefaultTheme, Stack, ThemeProvider, type ErrorBoundaryProps } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { RotateCcw } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { AppButton, AppText, ScreenContainer } from '@/components';
import { LoadingScreen } from '@/features/onboarding/components/LoadingScreen';
import { useAppStartup } from '@/features/onboarding/hooks/useAppStartup';
import { useSyncServiceSettings } from '@/hooks/useSyncServiceSettings';
import { useTheme } from '@/hooks/useTheme';
import { brandColors, darkTheme, lightTheme, type AppTheme } from '@/theme';
import { getErrorMessage, logError } from '@/utils/errors';

// Native splash stays up until the branded LoadingScreen has laid out.
// Both share the same background color, so the handoff is seamless.
SplashScreen.preventAutoHideAsync().catch(() => {});
SplashScreen.setOptions({ fade: true, duration: 250 });

function hideNativeSplash() {
  SplashScreen.hideAsync().catch(() => {});
}

function toNavigationTheme(theme: AppTheme, base: typeof DefaultTheme) {
  return {
    ...base,
    colors: {
      ...base.colors,
      primary: theme.colors.primary,
      background: theme.colors.background,
      card: theme.colors.background,
      text: theme.colors.text,
      border: theme.colors.border,
      notification: theme.colors.danger,
    },
  };
}

const navigationThemes = {
  light: toNavigationTheme(lightTheme, DefaultTheme),
  dark: toNavigationTheme(darkTheme, DarkTheme),
};

export default function RootLayout() {
  const { isReady } = useAppStartup();
  const [introComplete, setIntroComplete] = useState(false);
  const theme = useTheme();
  useSyncServiceSettings();

  // The loading screen leaves only when startup work is done AND its intro has
  // played, so it never flashes for a single frame on fast devices.
  const showLoadingScreen = !(isReady && introComplete);

  return (
    <GestureHandlerRootView style={styles.root}>
      <ThemeProvider value={navigationThemes[theme.scheme]}>
        <StatusBar style={showLoadingScreen || theme.scheme === 'dark' ? 'light' : 'dark'} />
        {/* Mounts underneath the loading overlay once ready; `/` redirects to Home. */}
        {isReady ? (
          <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: theme.colors.background } }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="(menu)" />
            <Stack.Screen name="(setup)" />
            {/* No swipe-back out of an active game. */}
            <Stack.Screen name="(game)" options={{ gestureEnabled: false, animation: 'fade' }} />
          </Stack>
        ) : null}
        {showLoadingScreen ? (
          <LoadingScreen onLayout={hideNativeSplash} onIntroComplete={() => setIntroComplete(true)} />
        ) : null}
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}

/** Catches render errors anywhere in the route tree. */
export function ErrorBoundary({ error, retry }: ErrorBoundaryProps) {
  useEffect(() => {
    hideNativeSplash(); // a startup crash must not leave the splash stuck on screen
    logError(error, 'ErrorBoundary');
  }, [error]);

  return (
    <ScreenContainer centered>
      <AppText variant="title" align="center">
        Oops!
      </AppText>
      <AppText color="textSecondary" align="center">
        {getErrorMessage(error)}
      </AppText>
      <AppButton title="Try again" icon={RotateCcw} onPress={() => void retry()} />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: brandColors.night,
  },
});
