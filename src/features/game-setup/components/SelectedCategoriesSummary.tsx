import { LayoutGrid } from 'lucide-react-native';
import { StyleSheet, View } from 'react-native';

import { AppCard, AppText } from '@/components';
import type { WordCategory } from '@/features/game-setup/types/category.types';
import { useTheme } from '@/hooks/useTheme';

import { CategoryIcon } from './CategoryIcon';

interface SelectedCategoriesSummaryProps {
  categories: readonly WordCategory[];
  wordCount: number;
}

/** Card listing chosen categories as chips (names only — never words). */
export function SelectedCategoriesSummary({ categories, wordCount }: SelectedCategoriesSummaryProps) {
  const { colors, radius, spacing } = useTheme();

  return (
    <AppCard style={{ gap: spacing.md }}>
      <View style={[styles.row, styles.between]}>
        <View style={[styles.row, { gap: spacing.sm }]}>
          <LayoutGrid size={18} color={colors.accent} />
          <AppText variant="subheading">Categories</AppText>
        </View>
        <AppText variant="caption" color="textMuted">
          {wordCount} words
        </AppText>
      </View>
      <View style={[styles.chips, { gap: spacing.sm }]}>
        {categories.map((category) => (
          <View
            key={category.id}
            style={[
              styles.row,
              {
                gap: spacing.xs,
                paddingHorizontal: spacing.md,
                paddingVertical: spacing.xs,
                borderRadius: radius.pill,
                backgroundColor: colors.secondary,
              },
            ]}>
            <CategoryIcon iconKey={category.icon} size={14} color={colors.accent} />
            <AppText variant="caption" style={{ color: colors.onSecondary }}>
              {category.name}
            </AppText>
          </View>
        ))}
      </View>
    </AppCard>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  between: {
    justifyContent: 'space-between',
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
});
