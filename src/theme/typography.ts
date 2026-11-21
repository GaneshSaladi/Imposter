import { Platform, type TextStyle } from 'react-native';

/**
 * System fonts for now. Rounded on iOS/web for a friendlier feel.
 * When custom fonts are added to `assets/fonts`, load them with expo-font
 * and swap the family names here.
 */
export const fontFamily = {
  regular: Platform.select({
    ios: 'ui-rounded',
    web: "ui-rounded, 'SF Pro Rounded', system-ui, sans-serif",
    default: undefined,
  }),
} as const;

export const fontSize = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 22,
  xxl: 28,
  display: 40,
} as const;

type TypographyVariantStyle = Pick<
  TextStyle,
  'fontFamily' | 'fontSize' | 'lineHeight' | 'fontWeight' | 'letterSpacing'
>;

const base = { fontFamily: fontFamily.regular } as const;

export const typography = {
  display: { ...base, fontSize: fontSize.display, lineHeight: 46, fontWeight: 800 },
  title: { ...base, fontSize: fontSize.xxl, lineHeight: 34, fontWeight: 800 },
  heading: { ...base, fontSize: fontSize.xl, lineHeight: 28, fontWeight: 700 },
  subheading: { ...base, fontSize: fontSize.lg, lineHeight: 24, fontWeight: 600 },
  body: { ...base, fontSize: fontSize.md, lineHeight: 22, fontWeight: 400 },
  bodyStrong: { ...base, fontSize: fontSize.md, lineHeight: 22, fontWeight: 600 },
  caption: { ...base, fontSize: fontSize.sm, lineHeight: 18, fontWeight: 400 },
  label: { ...base, fontSize: fontSize.xs, lineHeight: 16, fontWeight: 700, letterSpacing: 0.6 },
  button: { ...base, fontSize: fontSize.lg, lineHeight: 22, fontWeight: 700 },
} as const satisfies Record<string, TypographyVariantStyle>;

export type TypographyVariant = keyof typeof typography;
