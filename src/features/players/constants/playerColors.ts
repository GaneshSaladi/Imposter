import type { PlayerColorOption } from '@/features/players/types';

/**
 * Player colors, tuned to stay vivid on the dark purple background.
 * Keep at least `SetupLimits.maxPlayers` entries so every player can get a unique color.
 */
export const PLAYER_COLORS: readonly PlayerColorOption[] = [
  { name: 'Violet', value: '#8B6CFF' },
  { name: 'Pink', value: '#FF6FB5' },
  { name: 'Coral', value: '#FF7A6B' },
  { name: 'Tangerine', value: '#FF9F43' },
  { name: 'Sunshine', value: '#FFD25C' },
  { name: 'Lime', value: '#A8E063' },
  { name: 'Mint', value: '#4FD6A4' },
  { name: 'Teal', value: '#2EC4B6' },
  { name: 'Sky', value: '#5DB6FF' },
  { name: 'Cobalt', value: '#6F86FF' },
  { name: 'Berry', value: '#C86BFA' },
  { name: 'Silver', value: '#C9C3D9' },
];

/** Text/icon color used on top of any player color. */
export const ON_PLAYER_COLOR = '#1D1A26';
