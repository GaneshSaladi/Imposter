import rawDatabase from '@/data/wordCategories.json';
import {
  formatValidationReport,
  validateWordDatabase,
} from '@/features/game-setup/logic/wordDatabaseValidation';
import type { CategoryId, WordCategory, WordDatabase } from '@/features/game-setup/types/category.types';
import { logError } from '@/utils/errors';

/**
 * Read-only access to the word database (src/data/wordCategories.json).
 * The only module that touches the JSON — UI and game logic go through here.
 */

// Assigning to the interface makes TypeScript check the JSON's shape at compile time.
const database: WordDatabase = rawDatabase;

// Development safety net: report data problems loudly. Data is never altered.
if (__DEV__) {
  const result = validateWordDatabase(database);
  if (!result.valid) logError(new Error(formatValidationReport(result)), 'wordDatabase');
}

const categoriesById = new Map<CategoryId, WordCategory>(
  database.categories.map((category) => [category.id, category]),
);

export function getAllCategories(): readonly WordCategory[] {
  return database.categories;
}

export function getAllCategoryIds(): CategoryId[] {
  return database.categories.map((category) => category.id);
}

export function getCategoryById(categoryId: CategoryId): WordCategory | undefined {
  return categoriesById.get(categoryId);
}

/** Words for a category, or an empty list for unknown ids. */
export function getWordsByCategory(categoryId: CategoryId): readonly string[] {
  return categoriesById.get(categoryId)?.words ?? [];
}

/** Categories for the given ids, in database order. Unknown ids are ignored. */
export function getSelectedCategories(categoryIds: readonly CategoryId[]): WordCategory[] {
  const wanted = new Set(categoryIds);
  return database.categories.filter((category) => wanted.has(category.id));
}

/** Total words across the given categories (each category counted once). */
export function getTotalWordCount(categoryIds: readonly CategoryId[]): number {
  return getSelectedCategories(categoryIds).reduce((sum, category) => sum + category.words.length, 0);
}

/** Keeps only known ids, removes duplicates and sorts into database order. */
export function normalizeCategoryIds(categoryIds: readonly CategoryId[]): CategoryId[] {
  return getSelectedCategories(categoryIds).map((category) => category.id);
}
