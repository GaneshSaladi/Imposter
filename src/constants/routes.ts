import type { Href } from 'expo-router';

/**
 * Central list of app routes. Route groups like `(menu)` don't appear in URLs,
 * so `src/app/(menu)/home.tsx` is `/home`.
 */
export const Routes = {
  root: '/',
  // (menu)
  home: '/home',
  settings: '/settings',
  profile: '/profile',
  wordCategories: '/word-categories',
  history: '/history',
  howToPlay: '/how-to-play',
  // (setup) — new game flow
  gameType: '/game-type',
  playerSetup: '/player-setup',
  playerRegistration: '/player-registration',
  setupComplete: '/setup-complete',
  categories: '/categories',
  // (game) — active match
  getReady: '/get-ready',
  reveal: '/reveal',
  gameReady: '/game-ready',
  play: '/play',
  results: '/results',
} as const satisfies Record<string, Href>;
