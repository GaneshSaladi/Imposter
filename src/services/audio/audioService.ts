import { createAudioPlayer, setAudioModeAsync, type AudioPlayer, type AudioSource } from 'expo-audio';

import { logError } from '@/utils/errors';
import { clamp } from '@/utils/helpers';

/**
 * Global audio for sound effects and background music.
 * Players are created lazily on first use and cached per source,
 * so nothing is loaded at startup.
 */

const effectPlayers = new Map<AudioSource, AudioPlayer>();
let musicPlayer: AudioPlayer | null = null;
let isConfigured = false;
let effectsEnabled = true;
let musicEnabled = true;
let musicVolume = 0.5;

async function ensureConfigured(): Promise<void> {
  if (isConfigured) return;
  isConfigured = true;
  try {
    // Respect the iOS silent switch (UI clicks shouldn't ignore it) and never stop other apps' audio.
    await setAudioModeAsync({ playsInSilentMode: false, interruptionMode: 'mixWithOthers' });
  } catch (error) {
    logError(error, 'audio.configure');
  }
}

function getEffectPlayer(source: AudioSource): AudioPlayer {
  let player = effectPlayers.get(source);
  if (!player) {
    player = createAudioPlayer(source);
    effectPlayers.set(source, player);
  }
  return player;
}

export const audioService = {
  setEffectsEnabled(enabled: boolean): void {
    effectsEnabled = enabled;
  },

  setMusicEnabled(enabled: boolean): void {
    musicEnabled = enabled;
    if (!enabled) musicPlayer?.pause();
  },

  /** Creates the player ahead of time so the first playback has no load delay. */
  async preloadEffect(source: AudioSource): Promise<void> {
    try {
      await ensureConfigured();
      getEffectPlayer(source);
    } catch (error) {
      logError(error, 'audio.preloadEffect');
    }
  },

  async playEffect(source: AudioSource, volume = 1): Promise<void> {
    if (!effectsEnabled) return;
    try {
      await ensureConfigured();
      const player = getEffectPlayer(source);
      player.volume = volume;
      await player.seekTo(0);
      player.play();
    } catch (error) {
      logError(error, 'audio.playEffect');
    }
  },

  async playMusic(source: AudioSource): Promise<void> {
    if (!musicEnabled) return;
    try {
      await ensureConfigured();
      musicPlayer?.release();
      musicPlayer = createAudioPlayer(source);
      musicPlayer.loop = true;
      musicPlayer.volume = musicVolume;
      musicPlayer.play();
    } catch (error) {
      logError(error, 'audio.playMusic');
    }
  },

  pauseMusic(): void {
    musicPlayer?.pause();
  },

  resumeMusic(): void {
    if (musicEnabled) musicPlayer?.play();
  },

  stopMusic(): void {
    musicPlayer?.release();
    musicPlayer = null;
  },

  setMusicVolume(volume: number): void {
    musicVolume = clamp(volume, 0, 1);
    if (musicPlayer) musicPlayer.volume = musicVolume;
  },

  /** Frees all native players. Call when audio is no longer needed. */
  releaseAll(): void {
    effectPlayers.forEach((player) => player.release());
    effectPlayers.clear();
    audioService.stopMusic();
  },
};
