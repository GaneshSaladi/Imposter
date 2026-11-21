import type { ImageSource } from 'expo-image';

type IllustrationSource = number | ImageSource | null;

/**
 * Single place to swap onboarding artwork.
 *
 * `null` renders the built-in vector placeholder (DetectiveIllustration).
 * To use final art, add a square, transparent PNG/WebP (≥ 1024×1024) to
 * `assets/images/illustrations/` and point the entry at it:
 *
 *   loadingDetective: require('@/assets/images/illustrations/detective.png'),
 */
export const OnboardingIllustrations: Record<'loadingDetective', IllustrationSource> = {
  loadingDetective: null,
};
