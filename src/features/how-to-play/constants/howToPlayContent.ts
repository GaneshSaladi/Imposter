import {
  CircleCheck,
  Megaphone,
  Scale,
  Settings2,
  UserX,
  VenetianMask,
  Vote,
  type LucideIcon,
} from 'lucide-react-native';

/**
 * All How to Play text lives here (not in components), so wording can be
 * edited in one place. Keep it short and simple — it's read by first-timers.
 */

/** brand = general tips, crew = Crewmates (purple), imposter = Imposters (red). */
export type Tone = 'brand' | 'crew' | 'imposter';

export interface Highlight {
  text: string;
  tone: Tone;
}

export interface Outcome {
  title: string;
  text: string;
  tone: Tone;
  icon: LucideIcon;
}

export interface InstructionStep {
  id: string;
  step: number;
  title: string;
  icon: LucideIcon;
  intro?: string;
  bullets?: readonly string[];
  /** Shows the Crewmate vs Imposter role cards inside this step. */
  showRoleCards?: boolean;
  outcomes?: readonly Outcome[];
  highlight?: Highlight;
}

/** A head-count snapshot used in the win examples. */
export interface TeamCount {
  imposters: number;
  crewmates: number;
  /** Imposters already voted out (shown crossed out). */
  caughtImposters?: number;
}

export interface WinExample {
  label: string;
  count: TeamCount;
  result: string;
  /** false = "the game keeps going" counter-example. */
  isWin: boolean;
}

export interface WinCondition {
  side: 'crew' | 'imposter';
  title: string;
  subtitle: string;
  rule: string;
  examples: readonly WinExample[];
  highlight?: string;
}

export const INTRO = {
  title: 'HOW TO PLAY',
  subtitle: 'One secret word. One hidden imposter. Can you find them?',
};

export const OBJECTIVE = {
  title: "What's the game about?",
  text:
    'Everyone gets a secret role. Most players are Crewmates and get the same secret word. ' +
    "But one or more players are secretly Imposters — and they don't know the word!",
};

export const ROLE_CARDS = {
  crew: {
    title: 'CREWMATE',
    tagline: 'Knows the secret word',
    goal: 'Find and vote out every Imposter.',
    detail: 'You get the secret word. Give clues that prove you know it — without making them too obvious.',
  },
  imposter: {
    title: 'IMPOSTER',
    tagline: "Doesn't know the word",
    goal: "Blend in, don't get caught, and outlast the Crewmates.",
    detail:
      "You don't get the secret word! Listen carefully to everyone's clues, pretend you know it, and try not to get caught.",
  },
} as const;

export const STEPS: readonly InstructionStep[] = [
  {
    id: 'setup',
    step: 1,
    title: 'Get your team ready',
    icon: Settings2,
    bullets: [
      'Add everyone who wants to play.',
      'Choose how many Imposters there will be.',
      'Pick your favourite word categories.',
      'Choose 2 or 3 clue rounds per cycle.',
      'Pass the phone around so each player can secretly see their role.',
    ],
    highlight: { text: 'Keep your role secret! Never show your screen to another player.', tone: 'brand' },
  },
  {
    id: 'roles',
    step: 2,
    title: 'Discover your role',
    icon: VenetianMask,
    showRoleCards: true,
  },
  {
    id: 'clues',
    step: 3,
    title: 'Give clues and observe',
    icon: Megaphone,
    intro: 'Take turns saying one clue out loud that is related to the secret word.',
    bullets: [
      'Each player gives one clue per round.',
      'Speak in the random order shown on the phone.',
      'A clue cycle has 2 or 3 rounds (you choose before the game).',
      'The speaking order stays the same for the whole cycle.',
      "Don't say the secret word itself!",
      'Listen for clues that sound strange or too vague.',
    ],
    highlight: { text: 'Imposters must listen carefully and try to blend in!', tone: 'imposter' },
  },
  {
    id: 'vote',
    step: 4,
    title: 'Discuss and vote',
    icon: Vote,
    intro:
      'When all clue rounds are done, talk about who seems suspicious. Then everyone votes in secret on the phone.',
    bullets: [
      'Every player still in the game votes once.',
      "You can't vote for yourself.",
      "Eliminated players don't vote.",
      'The vote count updates after each vote.',
      'Nobody can see who voted for whom.',
    ],
    highlight: { text: 'The player with the most votes is eliminated.', tone: 'brand' },
  },
  {
    id: 'results',
    step: 5,
    title: 'Elimination or another round?',
    icon: UserX,
    intro: 'If one player gets the most votes, they are eliminated and their role is revealed.',
    outcomes: [
      {
        title: 'An Imposter is caught',
        text: 'Great job, Crewmates! If any Imposters are still hidden, the game continues.',
        tone: 'crew',
        icon: CircleCheck,
      },
      {
        title: 'A Crewmate is voted out',
        text: 'The Imposters fooled the group! That Crewmate is out for the rest of the game.',
        tone: 'imposter',
        icon: UserX,
      },
      {
        title: "It's a tie",
        text: 'Nobody is eliminated. Everyone plays a fresh clue cycle with a new speaking order.',
        tone: 'brand',
        icon: Scale,
      },
    ],
    highlight: { text: "Eliminated players are out — they can't give clues or vote anymore.", tone: 'imposter' },
  },
];

export const WIN_CONDITIONS: readonly WinCondition[] = [
  {
    side: 'crew',
    title: 'CREWMATES WIN',
    subtitle: 'Find every Imposter!',
    rule: 'Crewmates win when ALL Imposters have been eliminated.',
    examples: [
      {
        label: '5 players: 1 Imposter, 4 Crewmates. The group votes out the Imposter.',
        count: { imposters: 0, crewmates: 4, caughtImposters: 1 },
        result: 'CREWMATES WIN!',
        isWin: true,
      },
    ],
    highlight: 'The team found every Imposter — 0 Imposters left.',
  },
  {
    side: 'imposter',
    title: 'IMPOSTERS WIN',
    subtitle: 'Take control of the game!',
    rule: 'Imposters win when there are as many Imposters as Crewmates left — or more.',
    examples: [
      { label: '1 Imposter vs 1 Crewmate', count: { imposters: 1, crewmates: 1 }, result: 'IMPOSTERS WIN!', isWin: true },
      { label: '2 Imposters vs 2 Crewmates', count: { imposters: 2, crewmates: 2 }, result: 'IMPOSTERS WIN!', isWin: true },
      { label: '2 Imposters vs 1 Crewmate', count: { imposters: 2, crewmates: 1 }, result: 'IMPOSTERS WIN!', isWin: true },
      { label: '1 Imposter vs 2 Crewmates', count: { imposters: 1, crewmates: 2 }, result: 'Game continues', isWin: false },
    ],
    highlight:
      "Imposters don't need to eliminate everyone. They only need to equal or outnumber the remaining Crewmates.",
  },
];

export const QUICK_RULES: readonly string[] = [
  'Never reveal your secret role.',
  'Never say the secret word out loud.',
  "Imposters don't know the secret word.",
  'Every player still in the game must vote.',
  "You can't vote for yourself.",
  'Eliminated players are out for good.',
  'A tie means nobody is eliminated.',
  'Crewmates win when no Imposters are left.',
  'Imposters win when they equal or outnumber the Crewmates.',
];

export const CLOSING = {
  button: "GOT IT! LET'S PLAY",
  note: 'Good luck! Trust nobody. 👀',
};
