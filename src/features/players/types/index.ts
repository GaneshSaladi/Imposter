import type { EntityId } from '@/types/common';

export interface Player {
  id: EntityId;
  name: string;
  /** Hex color from PLAYER_COLORS. */
  color: string;
}

export interface PlayerColorOption {
  name: string;
  value: string;
}

export interface NewPlayerInput {
  name: string;
  color: string;
}
