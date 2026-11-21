import { ArrowRight } from 'lucide-react-native';
import { StyleSheet, View } from 'react-native';

import { AppPressable, AppText } from '@/components';
import type { GameTypeDefinition } from '@/features/game-types/types';
import { useTheme } from '@/hooks/useTheme';

interface GameTypeCardProps {
  gameType: GameTypeDefinition;
  onPress: () => void;
}

const ON_CARD = '#FFFFFF';
const ON_CARD_SOFT = 'rgba(255, 255, 255, 0.82)';

export function GameTypeCard({ gameType, onPress }: GameTypeCardProps) {
  const { radius, spacing } = useTheme();
  const Icon = gameType.icon;

  return (
    <AppPressable
      onPress={onPress}
      pressedScale={0.96}
      accessibilityRole="button"
      accessibilityLabel={`${gameType.title}. ${gameType.description}`}
      accessibilityHint="Selects this game mode"
      style={[
        styles.card,
        {
          borderRadius: radius.xl,
          padding: spacing.xl,
          gap: spacing.lg,
          backgroundImage: gameType.gradient,
        },
      ]}>
      {/* Oversized faded icon for depth */}
      <View style={styles.watermark} pointerEvents="none">
        <Icon size={170} color={ON_CARD} strokeWidth={1.5} opacity={0.1} />
      </View>

      <View style={[styles.iconBox, { borderRadius: radius.lg }]}>
        <Icon size={32} color={ON_CARD} strokeWidth={2.2} />
      </View>

      <View style={{ gap: spacing.xs }}>
        <AppText variant="title" style={styles.title}>
          {gameType.title}
        </AppText>
        <AppText style={{ color: ON_CARD_SOFT }}>{gameType.description}</AppText>
      </View>

      <View style={[styles.footer, { gap: spacing.sm }]}>
        <View style={[styles.tags, { gap: spacing.sm }]}>
          {gameType.tags.map((tag) => (
            <View
              key={tag}
              style={[styles.tag, { borderRadius: radius.pill, paddingHorizontal: spacing.md, paddingVertical: spacing.xs }]}>
              <AppText variant="caption" style={styles.tagText}>
                {tag}
              </AppText>
            </View>
          ))}
        </View>
        <View style={[styles.arrow, { borderRadius: radius.pill }]}>
          <ArrowRight size={22} color="#4A2FB8" strokeWidth={2.6} />
        </View>
      </View>
    </AppPressable>
  );
}

const styles = StyleSheet.create({
  card: {
    overflow: 'hidden',
    boxShadow: '0 14px 32px rgba(104, 69, 240, 0.4)',
  },
  watermark: {
    position: 'absolute',
    right: -28,
    bottom: -34,
  },
  iconBox: {
    width: 60,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
  },
  title: {
    color: ON_CARD,
    letterSpacing: 3,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  tags: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tag: {
    backgroundColor: 'rgba(255, 255, 255, 0.16)',
  },
  tagText: {
    color: ON_CARD,
    fontWeight: 600,
  },
  arrow: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: ON_CARD,
  },
});
