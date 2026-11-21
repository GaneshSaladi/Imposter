import type { ColorScheme } from '@/types/common';

import { darkColors, lightColors, type ThemeColors } from './colors';
import { radius, spacing } from './spacing';
import { typography } from './typography';

export interface AppTheme {
  scheme: ColorScheme;
  colors: ThemeColors;
  spacing: typeof spacing;
  radius: typeof radius;
  typography: typeof typography;
}

export const lightTheme: AppTheme = {
  scheme: 'light',
  colors: lightColors,
  spacing,
  radius,
  typography,
};

export const darkTheme: AppTheme = {
  scheme: 'dark',
  colors: darkColors,
  spacing,
  radius,
  typography,
};

export const themes: Record<ColorScheme, AppTheme> = {
  light: lightTheme,
  dark: darkTheme,
};

export { brandColors, roleColors, type ThemeColors } from './colors';
export { radius, spacing, type RadiusToken, type SpacingToken } from './spacing';
export { fontFamily, fontSize, typography, type TypographyVariant } from './typography';
