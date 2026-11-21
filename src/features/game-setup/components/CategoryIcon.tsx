import {
  Apple,
  Building2,
  Clapperboard,
  Gamepad2,
  Lamp,
  Palette,
  PawPrint,
  Shapes,
  Sparkles,
  Star,
  Tag,
  Trophy,
  UtensilsCrossed,
  type LucideIcon,
  type LucideProps,
} from 'lucide-react-native';

/** Maps the JSON `icon` keys to icon components (a UI concern, kept out of the data). */
const CATEGORY_ICONS: Readonly<Record<string, LucideIcon>> = {
  paw: PawPrint,
  apple: Apple,
  utensils: UtensilsCrossed,
  lamp: Lamp,
  trophy: Trophy,
  clapperboard: Clapperboard,
  tag: Tag,
  gamepad: Gamepad2,
  sparkles: Sparkles,
  star: Star,
  building: Building2,
  palette: Palette,
};

interface CategoryIconProps extends LucideProps {
  /** `icon` value from the word database; unknown keys show a generic shape. */
  iconKey: string;
}

export function CategoryIcon({ iconKey, ...iconProps }: CategoryIconProps) {
  const Icon = CATEGORY_ICONS[iconKey] ?? Shapes;
  return <Icon {...iconProps} />;
}
