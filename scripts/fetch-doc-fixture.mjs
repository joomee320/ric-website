// Fetches the real content Doc once and saves its Docs API JSON as a test fixture,
// so flatten() and loadContent() can be tested against real API output.
//
// Run from the repo root:
//   node --conditions=react-server scripts/fetch-doc-fixture.mjs
// (--conditions=react-server lets lib/cms/google.ts import 'server-only' outside Next.js)
//
// Reads credentials from .env.local. Prints variable NAMES only, never values.
// Review the fixture before committing: it contains the Doc's text.

import { mkdirSync, writeFileSync } from 'node:fs';
import { fetchDoc } from '../lib/cms/google.ts';

const OUT = 'tests/fixtures/real-doc.json';
// Identifiers and revision data are not needed for tests and are dropped.
const DROP_KEYS = ['documentId', 'revisionId', 'suggestionsViewMode'];

try {
  process.loadEnvFile('.env.local');
} catch {
  console.error('Could not read .env.local in the current directory.');
  process.exit(1);
}

let document;
try {
  document = await fetchDoc();
} catch (error) {
  if (error?.name === 'MissingEnvError') {
    console.error(`Missing in .env.local: ${error.names.join(', ')}`);
  } else {
    const status = error?.status ?? error?.code ?? '';
    console.error(`fetchDoc failed: ${status} ${error?.message ?? 'unknown error'}`.trim());
  }
  process.exit(1);
}

for (const key of DROP_KEYS) delete document[key];

mkdirSync('tests/fixtures', { recursive: true });
writeFileSync(OUT, `${JSON.stringify(document, null, 2)}\n`);

const elements = document.body?.content ?? [];
console.log(`Saved ${OUT}`);
console.log(`Top-level keys: ${Object.keys(document).join(', ')}`);
console.log(`body.content elements: ${elements.length}`);
console.log(`Has inlineObjects (images): ${Boolean(document.inlineObjects)}`);
console.log(`Has tabs: ${Boolean(document.tabs)}`);
