/**
 * Raw brand palette. Components should not use these directly —
 * use the semantic tokens from `@/theme` (via `useTheme()`) instead.
 */
export const Palette = {
  // Brand
  grape50: '#F4F0FF',
  grape100: '#E6DDFF',
  grape300: '#B9A3FF',
  grape500: '#7C5CFF',
  grape600: '#6845F0',
  grape700: '#5233C7',

  coral100: '#FFE1DC',
  coral400: '#FF8A7A',
  coral500: '#FF6B5B',
  coral600: '#E8513F',

  sunshine100: '#FFF3C9',
  sunshine400: '#FFD25C',
  sunshine500: '#FFC233',

  mint100: '#D7F7EA',
  mint400: '#4FD6A4',
  mint500: '#26C48B',
  mint600: '#14A673',

  sky100: '#DDF0FF',
  sky400: '#5DB6FF',
  sky500: '#3A9BF0',

  // Neutrals (warm-tinted for a cozy feel)
  white: '#FFFFFF',
  cream: '#FFF9F2',
  sand100: '#F6EFE6',
  sand200: '#EADFD2',
  stone400: '#A39A90',
  stone500: '#7A7168',
  stone700: '#4A433C',
  night700: '#2E2A3D',
  night800: '#231F30',
  night900: '#181524',
  ink: '#1D1A26',
  black: '#000000',
} as const;

export type PaletteColor = keyof typeof Palette;
