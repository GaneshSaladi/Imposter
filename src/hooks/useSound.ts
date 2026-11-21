import { useCallback } from 'react';

import { audioService } from '@/services/audio/audioService';
import { MusicTracks, SoundEffects, type MusicTrackKey, type SoundEffectKey } from '@/services/audio/sounds';

/**
 * Component-facing access to app audio by registry key.
 * Enabled/disabled state is applied by `useSyncServiceSettings`.
 */
export function useSound() {
  const playEffect = useCallback((key: SoundEffectKey, volume?: number) => {
    void audioService.playEffect(SoundEffects[key], volume);
  }, []);

  const playMusic = useCallback((key: MusicTrackKey) => {
    void audioService.playMusic(MusicTracks[key]);
  }, []);

  return {
    playEffect,
    playMusic,
    pauseMusic: audioService.pauseMusic,
    resumeMusic: audioService.resumeMusic,
    stopMusic: audioService.stopMusic,
  };
}
