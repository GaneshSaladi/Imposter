import type { WordDatabase } from '@/features/game-setup/types/category.types';

/**
 * Validation for the word database. Reports every problem it finds and never
 * modifies or filters the data.
 *
 * This module is intentionally dependency-free (type-only imports) so it can
 * run both inside the app and directly in Node via
 * `npm run validate:words`.
 */

export interface WordDatabaseRules {
  /** Minimum words for every category. */
  minWordsPerCategory: number;
  /** Categories that must exist and meet `minPriorityWords`. */
  priorityCategoryIds: readonly string[];
  minPriorityWords: number;
  /** Categories that must exist. */
  requiredCategoryIds: readonly string[];
  maxWordLength: number;
}

export const WORD_DATABASE_RULES: WordDatabaseRules = {
  minWordsPerCategory: 100,
  priorityCategoryIds: ['animals', 'fruits', 'food', 'objects', 'sports'],
  minPriorityWords: 100,
  requiredCategoryIds: [
    'animals',
    'fruits',
    'food',
    'objects',
    'sports',
    'movies',
    'brands',
    'games',
    'anime',
    'hollywood',
    'cities',
    'hobbies',
  ],
  maxWordLength: 40,
};

export interface WordDatabaseIssue {
  /** Category the issue belongs to, or null for database-level issues. */
  categoryId: string | null;
  message: string;
}

export interface CategoryStats {
  id: string;
  name: string;
  wordCount: number;
  priority: boolean;
}

export interface WordDatabaseValidationResult {
  valid: boolean;
  errors: WordDatabaseIssue[];
  categories: CategoryStats[];
  totalWords: number;
}

const CATEGORY_ID_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

/** Comparison key: case-, accent- and spacing-insensitive ("Pokémon" == "pokemon"). */
export function wordKey(word: string): string {
  return word
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/\s+/g, ' ')
    .trim()
    .toLocaleLowerCase();
}

function validateWords(
  categoryId: string,
  words: unknown,
  rules: WordDatabaseRules,
  report: (message: string) => void,
): number {
  if (!Array.isArray(words)) {
    report('"words" must be an array.');
    return 0;
  }
  if (words.length === 0) {
    report('"words" must not be empty.');
    return 0;
  }

  const firstSeenAt = new Map<string, number>();
  words.forEach((word: unknown, index) => {
    const position = `word #${index + 1}`;
    if (typeof word !== 'string') {
      report(`${position} is not a string (${JSON.stringify(word)}).`);
      return;
    }
    if (word.trim().length === 0) {
      report(`${position} is empty.`);
      return;
    }
    if (word !== word.trim() || /\s{2,}/.test(word)) {
      report(`${position} "${word}" has leading, trailing or repeated spaces.`);
    }
    if (word.length > rules.maxWordLength) {
      report(`${position} "${word}" is longer than ${rules.maxWordLength} characters.`);
    }
    const key = wordKey(word);
    const previous = firstSeenAt.get(key);
    if (previous !== undefined) {
      report(`Duplicate word "${word}" (${position}) — same as word #${previous + 1}.`);
    } else {
      firstSeenAt.set(key, index);
    }
  });

  const minimum = rules.priorityCategoryIds.includes(categoryId)
    ? Math.max(rules.minPriorityWords, rules.minWordsPerCategory)
    : rules.minWordsPerCategory;
  if (words.length < minimum) {
    report(`Has ${words.length} words; at least ${minimum} are required.`);
  }
  return words.length;
}

export function validateWordDatabase(
  data: unknown,
  rules: WordDatabaseRules = WORD_DATABASE_RULES,
): WordDatabaseValidationResult {
  const errors: WordDatabaseIssue[] = [];
  const categories: CategoryStats[] = [];

  if (!isRecord(data) || !Array.isArray(data.categories)) {
    errors.push({ categoryId: null, message: 'Database must be an object with a "categories" array.' });
    return { valid: false, errors, categories, totalWords: 0 };
  }
  if (data.categories.length === 0) {
    errors.push({ categoryId: null, message: '"categories" must not be empty.' });
  }

  const seenIds = new Set<string>();
  const seenNames = new Set<string>();

  data.categories.forEach((category: unknown, index) => {
    const fallbackLabel = `category #${index + 1}`;
    if (!isRecord(category)) {
      errors.push({ categoryId: null, message: `${fallbackLabel} is not an object.` });
      return;
    }

    const id = isNonEmptyString(category.id) ? category.id : null;
    const label = id ?? fallbackLabel;
    const report = (message: string) => errors.push({ categoryId: label, message });

    if (id === null) {
      report('Missing or empty "id".');
    } else {
      if (!CATEGORY_ID_PATTERN.test(id)) report(`Invalid id "${id}" (use lowercase letters, numbers and dashes).`);
      if (seenIds.has(id)) report(`Duplicate category id "${id}".`);
      seenIds.add(id);
    }

    const name = isNonEmptyString(category.name) ? category.name.trim() : null;
    if (name === null) {
      report('Missing or empty "name".');
    } else {
      if (seenNames.has(name.toLocaleLowerCase())) report(`Duplicate category name "${name}".`);
      seenNames.add(name.toLocaleLowerCase());
    }

    if (!isNonEmptyString(category.icon)) report('Missing or empty "icon".');
    if (typeof category.description !== 'string') report('"description" must be a string.');

    const wordCount = validateWords(label, category.words, rules, report);
    categories.push({
      id: label,
      name: name ?? label,
      wordCount,
      priority: id !== null && rules.priorityCategoryIds.includes(id),
    });
  });

  const requiredIds = new Set([...rules.requiredCategoryIds, ...rules.priorityCategoryIds]);
  requiredIds.forEach((requiredId) => {
    if (!seenIds.has(requiredId)) {
      errors.push({ categoryId: requiredId, message: 'Required category is missing.' });
    }
  });

  return {
    valid: errors.length === 0,
    errors,
    categories,
    totalWords: categories.reduce((sum, category) => sum + category.wordCount, 0),
  };
}

/** Type guard built on the full validation. */
export function isValidWordDatabase(data: unknown): data is WordDatabase {
  return validateWordDatabase(data).valid;
}

/** Human-readable report for the console / CI. */
export function formatValidationReport(result: WordDatabaseValidationResult): string {
  const lines: string[] = [];
  lines.push(`Word database validation: ${result.valid ? 'PASSED' : 'FAILED'}`);
  lines.push('');
  lines.push(`  ${'Category'.padEnd(12)} ${'Words'.padStart(5)}  Notes`);
  result.categories.forEach((category) => {
    lines.push(
      `  ${category.name.padEnd(12)} ${String(category.wordCount).padStart(5)}  ${category.priority ? 'priority' : ''}`,
    );
  });
  lines.push('');
  lines.push(`  Total: ${result.categories.length} categories, ${result.totalWords} words`);

  if (result.errors.length > 0) {
    lines.push('');
    lines.push(`  ${result.errors.length} problem(s):`);
    result.errors.forEach((issue) => {
      lines.push(`   - [${issue.categoryId ?? 'database'}] ${issue.message}`);
    });
  }
  return lines.join('\n');
}
