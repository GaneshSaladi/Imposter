import { Palette } from '@/constants/colors';

/** Semantic color tokens. Every theme must provide all of them. */
export interface ThemeColors {
  background: string;
  surface: string;
  surfaceElevated: string;
  border: string;
  overlay: string;

  text: string;
  textSecondary: string;
  textMuted: string;
  textInverse: string;

  primary: string;
  primaryPressed: string;
  onPrimary: string;
  secondary: string;
  secondaryPressed: string;
  onSecondary: string;
  accent: string;

  success: string;
  warning: string;
  danger: string;
  dangerPressed: string;
  onDanger: string;

  disabled: string;
  onDisabled: string;
}

export const lightColors: ThemeColors = {
  background: Palette.cream,
  surface: Palette.white,
  surfaceElevated: Palette.white,
  border: Palette.sand200,
  overlay: 'rgba(29, 26, 38, 0.55)',

  text: Palette.ink,
  textSecondary: Palette.stone700,
  textMuted: Palette.stone500,
  textInverse: Palette.white,

  primary: Palette.grape500,
  primaryPressed: Palette.grape600,
  onPrimary: Palette.white,
  secondary: Palette.grape100,
  secondaryPressed: Palette.grape300,
  onSecondary: Palette.grape700,
  accent: Palette.sunshine500,

  success: Palette.mint600,
  warning: Palette.sunshine500,
  danger: Palette.coral500,
  dangerPressed: Palette.coral600,
  onDanger: Palette.white,

  disabled: Palette.sand200,
  onDisabled: Palette.stone400,
};

/**
 * Fixed brand colors for always-dark branded surfaces (loading screen,
 * future splash-like moments). Independent of the light/dark preference.
 */
export const brandColors = {
  night: '#171322',
  nightDeep: '#0F0C18',
  violet: '#7C5CFF',
  violetDeep: '#5233C7',
  violetGlow: 'rgba(124, 92, 255, 0.55)',
  lavender: '#C9B8FF',
  lavenderSoft: '#A99BD1',
  white: Palette.white,
} as const;

/** Role card palettes. Crewmate = violet, imposter = crimson — always clearly different. */
export const roleColors = {
  crewmate: {
    gradient: 'linear-gradient(165deg, #9C84FF 0%, #6845F0 48%, #3B2391 100%)',
    glow: 'rgba(124, 92, 255, 0.55)',
    border: 'rgba(230, 221, 255, 0.45)',
    soft: '#E6DDFF',
    panel: 'rgba(20, 12, 48, 0.38)',
  },
  imposter: {
    gradient: 'linear-gradient(165deg, #F25A6E 0%, #B81F3B 48%, #560A1A 100%)',
    glow: 'rgba(242, 74, 98, 0.55)',
    border: 'rgba(255, 214, 220, 0.45)',
    soft: '#FFD6DC',
    panel: 'rgba(40, 4, 12, 0.4)',
  },
} as const;

/** The game's signature look: cozy violet-on-night. */
export const darkColors: ThemeColors = {
  background: brandColors.night,
  surface: '#211C30',
  surfaceElevated: '#2A2440',
  border: '#3A3352',
  overlay: 'rgba(8, 6, 14, 0.72)',

  text: Palette.cream,
  textSecondary: '#CFC8DD',
  textMuted: '#948DA8',
  textInverse: Palette.ink,

  primary: brandColors.violet,
  primaryPressed: Palette.grape600,
  onPrimary: Palette.white,
  secondary: '#2F2748',
  secondaryPressed: '#3D3360',
  onSecondary: '#DCD2FF',
  accent: brandColors.lavender,

  success: Palette.mint400,
  warning: Palette.sunshine400,
  danger: Palette.coral400,
  dangerPressed: Palette.coral500,
  onDanger: Palette.night900,

  disabled: '#2F2A40',
  onDisabled: '#6E6784',
};
