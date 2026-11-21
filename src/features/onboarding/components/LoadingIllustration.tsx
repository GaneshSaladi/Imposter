import { Image } from 'expo-image';

import { OnboardingIllustrations } from '@/features/onboarding/constants/illustrations';

import { DetectiveIllustration } from './DetectiveIllustration';

interface LoadingIllustrationProps {
  size: number;
}

/** Renders the configured loading artwork, falling back to the vector placeholder. */
export function LoadingIllustration({ size }: LoadingIllustrationProps) {
  const source = OnboardingIllustrations.loadingDetective;

  if (source !== null) {
    return <Image source={source} style={{ width: size, height: size }} contentFit="contain" />;
  }
  return <DetectiveIllustration size={size} />;
}
