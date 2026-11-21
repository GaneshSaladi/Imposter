import { audioService } from '@/services/audio/audioService';
import { SoundEffects } from '@/services/audio/sounds';
import { hapticsService } from '@/services/haptics/hapticsService';

/**
 * The single entry point for UI interaction feedback (click sound + light
 * haptic). Components never call audio/haptics directly for button presses —
 * `AppPressable` (and everything built on it) calls this.
 *
 * Sound and haptics respect the user's settings: the underlying services are
 * kept in sync by `useSyncServiceSettings`.
 */

export type FeedbackKind = 'tap' | 'selection' | 'success' | 'error' | 'none';

/** Minimum gap between click sounds, so rapid presses don't stack audio. */
const CLICK_THROTTLE_MS = 90;
let lastClickAt = 0;

function playClick(volume: number): void {
  const now = Date.now();
  if (now - lastClickAt < CLICK_THROTTLE_MS) return;
  lastClickAt = now;
  void audioService.playEffect(SoundEffects.click, volume);
}

export const feedbackService = {
  /** Warm up the click sound so the first tap plays instantly. */
  prepare(): void {
    void audioService.preloadEffect(SoundEffects.click);
  },

  /** Standard button press. */
  tap(): void {
    hapticsService.light();
    playClick(0.55);
  },

  /** Picking an option (swatches, toggles, segmented controls). */
  selection(): void {
    hapticsService.selection();
    playClick(0.4);
  },

  /** A completed action (e.g. player added). */
  success(): void {
    hapticsService.success();
    playClick(0.55);
  },

  /** A rejected action (e.g. validation failed). Haptic only — no "click" for failures. */
  error(): void {
    hapticsService.warning();
  },

  trigger(kind: FeedbackKind): void {
    if (kind !== 'none') feedbackService[kind]();
  },
};
