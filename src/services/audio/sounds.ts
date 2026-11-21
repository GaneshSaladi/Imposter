import type { AudioSource } from 'expo-audio';

/**
 * Registry of bundled sound files in `assets/sounds`. Play by key via
 * `useSound()` or `feedbackService`. To swap a sound, replace the file
 * (same name) or point the entry at a new file.
 */
export const SoundEffects = {
  /** Placeholder UI tick (synthesized). Replace with final audio when ready. */
  click: require('@/assets/sounds/ui-click.wav'),
} as const satisfies Record<string, AudioSource>;

export const MusicTracks = {} as const satisfies Record<string, AudioSource>;

export type SoundEffectKey = keyof typeof SoundEffects;
export type MusicTrackKey = keyof typeof MusicTracks;
