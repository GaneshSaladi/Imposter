import { View, type ViewProps } from 'react-native';

import { useTheme } from '@/hooks/useTheme';
import type { SpacingToken } from '@/theme';

export interface AppCardProps extends ViewProps {
  /** Raised cards get a soft shadow and the elevated surface color. */
  elevated?: boolean;
  padding?: SpacingToken;
}

export function AppCard({ elevated = false, padding = 'lg', style, ...rest }: AppCardProps) {
  const { colors, radius, spacing, scheme } = useTheme();

  return (
    <View
      style={[
        {
          backgroundColor: elevated ? colors.surfaceElevated : colors.surface,
          borderRadius: radius.xl,
          padding: spacing[padding],
          borderWidth: 1,
          borderColor: colors.border,
        },
        elevated && {
          boxShadow: scheme === 'dark' ? '0 6px 20px rgba(0, 0, 0, 0.45)' : '0 6px 20px rgba(82, 51, 199, 0.12)',
        },
        style,
      ]}
      {...rest}
    />
  );
}
