import { MessageSquareText } from 'lucide-react-native';

import { SetupLimits } from '@/features/game-setup/constants';
import type { GameTypeDefinition, GameTypeId } from '@/features/game-types/types';

/**
 * Registry of game modes shown on the selection screen.
 * To add a mode: extend `GameTypeId`, then add an entry here.
 */
export const GAME_TYPES: readonly GameTypeDefinition[] = [
  {
    id: 'words',
    title: 'WORDS',
    description: 'Find the Imposter using secret words and clever clues.',
    icon: MessageSquareText,
    gradient: 'linear-gradient(140deg, #9479FF 0%, #6845F0 55%, #4A2FB8 100%)',
    tags: [`${SetupLimits.minPlayers}–${SetupLimits.maxPlayers} players`, 'Pass & play'],
  },
];

export function getGameType(id: GameTypeId): GameTypeDefinition | undefined {
  return GAME_TYPES.find((type) => type.id === id);
}
