import { Check } from 'lucide-react-native';
import { StyleSheet, View } from 'react-native';
import Animated, { ZoomIn } from 'react-native-reanimated';

import { AppPressable, AppText } from '@/components';
import type { CategoryOption } from '@/features/game-setup/types/category.types';
import { useTheme } from '@/hooks/useTheme';

import { CategoryIcon } from './CategoryIcon';

interface CategoryCardProps {
  category: CategoryOption;
  onToggle: (categoryId: string) => void;
  width: number;
}

const INDICATOR = 26;

export function CategoryCard({ category, onToggle, width }: CategoryCardProps) {
  const { colors, radius, spacing } = useTheme();
  const { selected } = category;

  return (
    <AppPressable
      onPress={() => onToggle(category.id)}
      feedback="selection"
      debounceMs={0}
      pressedScale={0.95}
      accessibilityRole="checkbox"
      accessibilityState={{ checked: selected }}
      accessibilityLabel={`${category.name}, ${category.wordCount} words`}
      accessibilityHint={category.description}
      containerStyle={{ width }}
      style={({ pressed }) => [
        styles.card,
        {
          gap: spacing.md,
          padding: spacing.lg,
          borderRadius: radius.lg,
          borderColor: selected ? colors.primary : colors.border,
          backgroundColor: selected ? colors.secondary : pressed ? colors.surfaceElevated : colors.surface,
        },
        selected && styles.selectedGlow,
      ]}>
      <View style={styles.topRow}>
        <View
          style={[
            styles.iconBubble,
            { borderRadius: radius.md, backgroundColor: selected ? colors.primary : colors.secondary },
          ]}>
          <CategoryIcon
            iconKey={category.icon}
            size={22}
            color={selected ? colors.onPrimary : colors.accent}
            strokeWidth={2.3}
          />
        </View>
        {selected ? (
          <Animated.View
            key="checked"
            entering={ZoomIn.duration(160)}
            style={[styles.indicator, { backgroundColor: colors.primary, borderColor: colors.primary }]}>
            <Check size={16} color={colors.onPrimary} strokeWidth={3.2} />
          </Animated.View>
        ) : (
          <View style={[styles.indicator, { borderColor: colors.border }]} />
        )}
      </View>
      <View>
        <AppText variant="subheading" numberOfLines={1} style={!selected && { color: colors.textSecondary }}>
          {category.name}
        </AppText>
        <AppText variant="caption" color={selected ? 'accent' : 'textMuted'}>
          {category.wordCount} words
        </AppText>
      </View>
    </AppPressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 2,
  },
  selectedGlow: {
    boxShadow: '0 6px 18px rgba(124, 92, 255, 0.28)',
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  iconBubble: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  indicator: {
    width: INDICATOR,
    height: INDICATOR,
    borderRadius: INDICATOR / 2,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
