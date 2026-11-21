import { Text, type TextProps, type TextStyle } from 'react-native';

import { useTheme } from '@/hooks/useTheme';
import type { ThemeColors, TypographyVariant } from '@/theme';

export interface AppTextProps extends TextProps {
  variant?: TypographyVariant;
  /** Semantic color token from the theme. */
  color?: keyof ThemeColors;
  align?: TextStyle['textAlign'];
}

export function AppText({ variant = 'body', color = 'text', align, style, ...rest }: AppTextProps) {
  const { colors, typography } = useTheme();

  return (
    <Text
      maxFontSizeMultiplier={1.4}
      style={[typography[variant], { color: colors[color], textAlign: align }, style]}
      {...rest}
    />
  );
}
