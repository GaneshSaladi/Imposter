// Validates src/data/wordCategories.json and prints a report.
// Usage: npm run validate:words   (exit code 1 if any problem is found)
//
// Runs the app's own TypeScript validator directly — requires Node 22.18+
// (built-in TypeScript type stripping), no extra dependencies.
import { readFileSync } from 'node:fs';

import {
  formatValidationReport,
  validateWordDatabase,
} from '../src/features/game-setup/logic/wordDatabaseValidation.ts';

const databaseUrl = new URL('../src/data/wordCategories.json', import.meta.url);

function readDatabase() {
  try {
    return { ok: true, data: JSON.parse(readFileSync(databaseUrl, 'utf8')) };
  } catch (error) {
    return { ok: false, message: error instanceof Error ? error.message : String(error) };
  }
}

const loaded = readDatabase();
if (loaded.ok) {
  const result = validateWordDatabase(loaded.data);
  console.log(formatValidationReport(result));
  // exitCode (not process.exit) lets stdout flush first.
  process.exitCode = result.valid ? 0 : 1;
} else {
  console.error(`Could not read or parse ${databaseUrl.pathname}:\n${loaded.message}`);
  process.exitCode = 1;
}
