import type { LucideIcon } from 'lucide-react-native';

/** Every playable mode. Add new ids here as modes are introduced. */
export type GameTypeId = 'words';

export interface GameTypeDefinition {
  id: GameTypeId;
  title: string;
  description: string;
  icon: LucideIcon;
  /** CSS gradient used for the selection card background. */
  gradient: string;
  /** Short facts shown on the card, e.g. player range. */
  tags: readonly string[];
}
