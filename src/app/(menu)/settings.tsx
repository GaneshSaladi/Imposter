import { router } from 'expo-router';
import { LayoutGrid, RotateCcw } from 'lucide-react-native';

import { AppButton, AppCard, AppText, ScreenContainer } from '@/components';
import { AppConfig } from '@/constants/config';
import { Routes } from '@/constants/routes';
import { useCategories } from '@/features/game-setup/hooks/useCategories';
import { SettingsLinkRow } from '@/features/settings/components/SettingsLinkRow';
import { SettingsToggleRow } from '@/features/settings/components/SettingsToggleRow';
import { ThemePreferencePicker } from '@/features/settings/components/ThemePreferencePicker';
import { useSettingsStore } from '@/store';

export default function SettingsScreen() {
  const soundEffectsEnabled = useSettingsStore((s) => s.soundEffectsEnabled);
  const musicEnabled = useSettingsStore((s) => s.musicEnabled);
  const hapticsEnabled = useSettingsStore((s) => s.hapticsEnabled);
  const setSoundEffectsEnabled = useSettingsStore((s) => s.setSoundEffectsEnabled);
  const setMusicEnabled = useSettingsStore((s) => s.setMusicEnabled);
  const setHapticsEnabled = useSettingsStore((s) => s.setHapticsEnabled);
  const resetSettings = useSettingsStore((s) => s.resetSettings);
  const { selectedCount, totalCount, selectedWordCount } = useCategories();

  return (
    <ScreenContainer scrollable edges={['bottom', 'left', 'right']}>
      <AppText variant="label" color="textMuted">
        GAME
      </AppText>
      <AppCard padding="sm">
        <SettingsLinkRow
          label="Word categories"
          detail={`${selectedCount} of ${totalCount} selected · ${selectedWordCount} words`}
          icon={LayoutGrid}
          onPress={() => router.navigate(Routes.wordCategories)}
        />
      </AppCard>

      <AppText variant="label" color="textMuted">
        APPEARANCE
      </AppText>
      <AppCard>
        <ThemePreferencePicker />
      </AppCard>

      <AppText variant="label" color="textMuted">
        FEEDBACK
      </AppText>
      <AppCard padding="sm">
        <SettingsToggleRow label="Sound effects" value={soundEffectsEnabled} onValueChange={setSoundEffectsEnabled} />
        <SettingsToggleRow label="Music" value={musicEnabled} onValueChange={setMusicEnabled} />
        <SettingsToggleRow label="Vibration" value={hapticsEnabled} onValueChange={setHapticsEnabled} />
      </AppCard>

      <AppButton title="Reset settings" icon={RotateCcw} variant="ghost" size="md" onPress={resetSettings} />

      <AppText variant="caption" color="textMuted" align="center">
        {AppConfig.name} v{AppConfig.version}
      </AppText>
    </ScreenContainer>
  );
}
