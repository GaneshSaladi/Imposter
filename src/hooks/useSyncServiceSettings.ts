import { useEffect } from 'react';

import { useAppState } from '@/hooks/useAppState';
import { audioService } from '@/services/audio/audioService';
import { hapticsService } from '@/services/haptics/hapticsService';
import { useSettingsStore } from '@/store/settingsStore';

/**
 * Pushes user settings into the stateless services, so services stay
 * independent of the store. Mounted once in the root layout.
 */
export function useSyncServiceSettings(): void {
  const soundEffectsEnabled = useSettingsStore((s) => s.soundEffectsEnabled);
  const musicEnabled = useSettingsStore((s) => s.musicEnabled);
  const hapticsEnabled = useSettingsStore((s) => s.hapticsEnabled);

  useEffect(() => audioService.setEffectsEnabled(soundEffectsEnabled), [soundEffectsEnabled]);
  useEffect(() => audioService.setMusicEnabled(musicEnabled), [musicEnabled]);
  useEffect(() => hapticsService.setEnabled(hapticsEnabled), [hapticsEnabled]);

  useAppState({
    onBackground: audioService.pauseMusic,
    onForeground: audioService.resumeMusic,
  });
}
