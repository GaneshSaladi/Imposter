import {
  getAllCategories,
  getSelectedCategories,
  getTotalWordCount,
} from '@/features/game-setup/services/categoryService';
import type { CategoryOption } from '@/features/game-setup/types/category.types';
import { useGameSetupStore } from '@/store';

/**
 * Category data for screens: available categories (from the word database)
 * merged with the saved selection (from the store), plus selection actions.
 */
export function useCategories() {
  const selectedCategoryIds = useGameSetupStore((s) => s.selectedCategoryIds);
  const toggleCategory = useGameSetupStore((s) => s.toggleCategory);
  const selectAllCategories = useGameSetupStore((s) => s.selectAllCategories);
  const clearAllCategories = useGameSetupStore((s) => s.clearAllCategories);
  const restoreDefaultCategories = useGameSetupStore((s) => s.restoreDefaultCategories);

  const allCategories = getAllCategories();
  const selected = new Set(selectedCategoryIds);

  const categories: CategoryOption[] = allCategories.map(({ words, ...category }) => ({
    ...category,
    wordCount: words.length, // always derived from the JSON word list
    selected: selected.has(category.id),
  }));

  return {
    categories,
    selectedCategoryIds,
    selectedCategories: getSelectedCategories(selectedCategoryIds),
    selectedCount: selectedCategoryIds.length,
    totalCount: allCategories.length,
    selectedWordCount: getTotalWordCount(selectedCategoryIds),
    hasSelection: selectedCategoryIds.length > 0,
    allSelected: selectedCategoryIds.length === allCategories.length,
    toggleCategory,
    selectAllCategories,
    clearAllCategories,
    restoreDefaultCategories,
  };
}
