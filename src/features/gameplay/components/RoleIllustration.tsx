import { Image } from 'expo-image';

import { GameplayIllustrations } from '@/features/gameplay/constants/illustrations';
import type { RoleType } from '@/features/gameplay/types/game.types';
import { DetectiveIllustration } from '@/features/onboarding/components/DetectiveIllustration';

import { ImposterIllustration } from './ImposterIllustration';

interface RoleIllustrationProps {
  role: RoleType;
  size: number;
}

/** Configured role artwork, falling back to the vector placeholders. */
export function RoleIllustration({ role, size }: RoleIllustrationProps) {
  const source = GameplayIllustrations[role];

  if (source !== null) {
    return <Image source={source} style={{ width: size, height: size }} contentFit="contain" />;
  }
  return role === 'imposter' ? <ImposterIllustration size={size} /> : <DetectiveIllustration size={size} />;
}
