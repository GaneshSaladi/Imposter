import type { ImageSource } from 'expo-image';

import type { RoleType } from '@/features/gameplay/types/game.types';

type IllustrationSource = number | ImageSource | null;

/**
 * Single place to swap role-card artwork.
 *
 * `null` renders the built-in vector placeholders (detective for crewmates,
 * ImposterIllustration for imposters). To use final art, add a square,
 * transparent PNG/WebP (≥ 1024×1024) to `assets/images/illustrations/` and set:
 *
 *   imposter: require('@/assets/images/illustrations/imposter.png'),
 */
export const GameplayIllustrations: Record<RoleType, IllustrationSource> = {
  crewmate: null,
  imposter: null,
};
