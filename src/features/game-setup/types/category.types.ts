/** Stable category id from the word database (e.g. "animals"). */
export type CategoryId = string;

/** One category as stored in `src/data/wordCategories.json`. */
export interface WordCategory {
  id: CategoryId;
  name: string;
  /** Icon key, mapped to an icon component in the UI layer. */
  icon: string;
  description: string;
  words: readonly string[];
}

/** Root shape of `src/data/wordCategories.json`. */
export interface WordDatabase {
  categories: readonly WordCategory[];
}

/** The user's chosen categories for the next game. */
export interface CategorySelection {
  selectedCategoryIds: readonly CategoryId[];
}

/** A category prepared for display: no word list, plus derived values. */
export interface CategoryOption extends Omit<WordCategory, 'words'> {
  wordCount: number;
  selected: boolean;
}
