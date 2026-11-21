import { ArrowRight, Check, RotateCcw } from 'lucide-react-native';
import { ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { AppButton, AppPressable, AppText } from '@/components';
import { Breakpoints, HitSlop, Layout } from '@/constants/dimensions';
import { useCategories } from '@/features/game-setup/hooks/useCategories';
import { useTheme } from '@/hooks/useTheme';

import { CategoryCard } from './CategoryCard';

interface CategorySelectionProps {
  onContinue: () => void;
  /** 'setup' = step in the new-game flow; 'settings' = standalone editor from Settings. */
  variant?: 'setup' | 'settings';
}

const COPY = {
  setup: {
    title: 'Pick categories',
    subtitle: 'Secret words will be drawn from the categories you choose.',
    action: 'Continue',
  },
  settings: {
    title: 'Word categories',
    subtitle: 'New games draw secret words from these categories. Your choice is saved.',
    action: 'Done',
  },
} as const;

function ToolbarAction({ label, onPress, disabled }: { label: string; onPress: () => void; disabled: boolean }) {
  const { colors, radius, spacing } = useTheme();
  return (
    <AppPressable
      onPress={onPress}
      disabled={disabled}
      feedback="selection"
      hitSlop={HitSlop}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
      style={({ pressed }) => [
        styles.pill,
        {
          borderRadius: radius.pill,
          paddingHorizontal: spacing.md,
          backgroundColor: pressed ? colors.secondaryPressed : colors.secondary,
          opacity: disabled ? 0.45 : 1,
        },
      ]}>
      <AppText variant="caption" style={[styles.pillText, { color: colors.onSecondary }]}>
        {label}
      </AppText>
    </AppPressable>
  );
}

export function CategorySelection({ onContinue, variant = 'setup' }: CategorySelectionProps) {
  const copy = COPY[variant];
  const { colors, spacing } = useTheme();
  const { width } = useWindowDimensions();
  const {
    categories,
    selectedCount,
    totalCount,
    selectedWordCount,
    hasSelection,
    allSelected,
    toggleCategory,
    selectAllCategories,
    clearAllCategories,
    restoreDefaultCategories,
  } = useCategories();

  // Two columns on phones, three on tablets; sized from the live window width.
  const columns = width >= Breakpoints.tablet ? 3 : 2;
  const gap = spacing.md;
  const contentWidth = Math.min(width, Layout.maxContentWidth) - Layout.screenGutter * 2;
  const cardWidth = Math.floor((contentWidth - gap * (columns - 1)) / columns);

  return (
    <View style={[styles.root, { gap: spacing.md }]}>
      <Animated.View entering={FadeInDown.duration(350)} style={{ gap: spacing.xs }}>
        <AppText variant="title">{copy.title}</AppText>
        <AppText color="textSecondary">{copy.subtitle}</AppText>
      </Animated.View>

      <View style={[styles.toolbar, { gap: spacing.sm }]}>
        <AppText variant="caption" color="textSecondary" style={styles.flex} accessibilityLiveRegion="polite">
          <AppText variant="caption" color="accent" style={styles.pillText}>
            {selectedCount} of {totalCount}
          </AppText>{' '}
          selected · {selectedWordCount} words
        </AppText>
        <ToolbarAction label="Select all" onPress={selectAllCategories} disabled={allSelected} />
        <ToolbarAction label="Clear" onPress={clearAllCategories} disabled={!hasSelection} />
      </View>

      <ScrollView style={styles.flex} showsVerticalScrollIndicator={false} contentContainerStyle={{ gap: spacing.lg }}>
        <View style={[styles.grid, { gap }]}>
          {categories.map((category) => (
            <CategoryCard key={category.id} category={category} onToggle={toggleCategory} width={cardWidth} />
          ))}
        </View>
        <AppPressable
          onPress={restoreDefaultCategories}
          feedback="selection"
          accessibilityRole="button"
          accessibilityLabel="Restore default categories"
          style={[styles.restore, { gap: spacing.xs, paddingVertical: spacing.sm }]}>
          <RotateCcw size={14} color={colors.textMuted} />
          <AppText variant="caption" color="textMuted">
            Restore default categories
          </AppText>
        </AppPressable>
      </ScrollView>

      <View style={{ gap: spacing.xs }}>
        <AppButton
          title={copy.action}
          icon={variant === 'settings' ? Check : ArrowRight}
          iconPosition={variant === 'settings' ? 'start' : 'end'}
          disabled={!hasSelection}
          onPress={onContinue}
          accessibilityHint={hasSelection ? undefined : 'Select at least one category first'}
        />
        {hasSelection ? null : (
          <AppText variant="caption" color="textMuted" align="center">
            Select at least one category
          </AppText>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  toolbar: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pill: {
    minHeight: 32,
    justifyContent: 'center',
  },
  pillText: {
    fontWeight: 700,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  restore: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
