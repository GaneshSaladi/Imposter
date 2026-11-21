import type { Tone } from '@/features/how-to-play/constants/howToPlayContent';
import { useTheme } from '@/hooks/useTheme';

export interface ToneColors {
  accent: string;
  soft: string;
}

/** Purple for general/Crewmate content, red for Imposter content. */
export function useToneColors(): Record<Tone, ToneColors> {
  const { colors } = useTheme();
  return {
    brand: { accent: colors.accent, soft: colors.secondary },
    crew: { accent: '#9C84FF', soft: 'rgba(124, 92, 255, 0.16)' },
    imposter: { accent: '#F25A6E', soft: 'rgba(242, 90, 110, 0.16)' },
  };
}
