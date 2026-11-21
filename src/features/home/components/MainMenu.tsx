import { BookOpen, History, Play, Power, Settings, UserRound, type LucideIcon } from 'lucide-react-native';
import { View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { useTheme } from '@/hooks/useTheme';

import { MenuButton, type MenuButtonVariant } from './MenuButton';

export interface MainMenuProps {
  onStartGame: () => void;
  onOpenHowToPlay: () => void;
  onOpenHistory: () => void;
  onOpenProfile: () => void;
  onOpenSettings: () => void;
  /** Omit on platforms where the app can't close itself (iOS, web). */
  onCloseGame?: () => void;
}

interface MenuEntry {
  key: string;
  label: string;
  icon: LucideIcon;
  variant: MenuButtonVariant;
  onPress: () => void;
}

export function MainMenu({
  onStartGame,
  onOpenHowToPlay,
  onOpenHistory,
  onOpenProfile,
  onOpenSettings,
  onCloseGame,
}: MainMenuProps) {
  const { spacing } = useTheme();

  const entries: MenuEntry[] = [
    { key: 'start', label: 'Start Game', icon: Play, variant: 'primary', onPress: onStartGame },
    { key: 'how-to-play', label: 'How to Play', icon: BookOpen, variant: 'secondary', onPress: onOpenHowToPlay },
    { key: 'history', label: 'Game History', icon: History, variant: 'secondary', onPress: onOpenHistory },
    { key: 'profile', label: 'Profile', icon: UserRound, variant: 'secondary', onPress: onOpenProfile },
    { key: 'settings', label: 'Settings', icon: Settings, variant: 'secondary', onPress: onOpenSettings },
  ];
  if (onCloseGame) {
    entries.push({ key: 'close', label: 'Close Game', icon: Power, variant: 'subtle', onPress: onCloseGame });
  }

  return (
    <View style={{ gap: spacing.sm }}>
      {entries.map((entry, index) => (
        <Animated.View key={entry.key} entering={FadeInDown.delay(150 + index * 70).duration(400)}>
          <MenuButton label={entry.label} icon={entry.icon} variant={entry.variant} onPress={entry.onPress} />
        </Animated.View>
      ))}
    </View>
  );
}
