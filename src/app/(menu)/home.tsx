import { router } from 'expo-router';

import { ScreenContainer } from '@/components';
import { Routes } from '@/constants/routes';
import { CloseGameDialog } from '@/features/home/components/CloseGameDialog';
import { HomeHero } from '@/features/home/components/HomeHero';
import { MainMenu } from '@/features/home/components/MainMenu';
import { useCloseGame } from '@/features/home/hooks/useCloseGame';
import { useTheme } from '@/hooks/useTheme';
import { useGameSetupStore, useGameStore } from '@/store';

export default function HomeScreen() {
  const { spacing } = useTheme();
  const resetSetup = useGameSetupStore((s) => s.resetSetup);
  const resetGame = useGameStore((s) => s.resetGame);
  const closeGame = useCloseGame();

  return (
    <ScreenContainer scrollable centered ambient contentStyle={{ gap: spacing.xl, paddingVertical: spacing.lg }}>
      <HomeHero />
      <MainMenu
        onStartGame={() => {
          resetSetup(); // every Start Game begins a fresh setup...
          resetGame(); // ...and drops any leftover session (roles, word)
          router.navigate(Routes.gameType);
        }}
        onOpenHowToPlay={() => router.navigate(Routes.howToPlay)}
        onOpenHistory={() => router.navigate(Routes.history)}
        onOpenProfile={() => router.navigate(Routes.profile)}
        onOpenSettings={() => router.navigate(Routes.settings)}
        onCloseGame={closeGame.canClose ? closeGame.requestClose : undefined}
      />
      <CloseGameDialog
        visible={closeGame.confirmVisible}
        onCancel={closeGame.cancelClose}
        onConfirm={closeGame.confirmClose}
      />
    </ScreenContainer>
  );
}
