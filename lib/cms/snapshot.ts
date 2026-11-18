/**
 * STUB (docs/decisions.md D12). Implemented in step 4 (docs/progress.md).
 *
 * Reads and writes the published content snapshot: one JSON file in Vercel Blob
 * holding the last content that passed validation (docs/spec.md → Architecture
 * and data flow).
 *
 * Planned behaviour:
 * - The path includes the environment (D3): production / preview / development.
 *   Local runs (no VERCEL_ENV) use development, so local Publish tests never
 *   touch preview or production data.
 * - writeSnapshot() is called only by POST /api/publish, only after validation passed.
 * - readSnapshot() is called only by getContent(). It returns null when there is
 *   no snapshot yet or the store cannot be reached; getContent() then uses
 *   content.fallback.json.
 * - Server-only: uses BLOB_READ_WRITE_TOKEN.
 *
 * TODO(step 4):
 *   - Check the current @vercel/blob docs (CLAUDE.md → Tech constraints) and
 *     propose the storage approach (path format, private vs public access,
 *     overwrite and CDN caching behaviour) before implementing.
 *   - Install @vercel/blob; add `import 'server-only'`.
 *   - Validate what is read with SiteContentSchema before returning it.
 *   - Tests with a mocked store: path per environment, null on missing/failed read.
 */

import type { SiteContent } from './schema';

/** Snapshot location for the current environment. */
export function snapshotPath(): string {
  // TODO(step 4): e.g. `cms/${environment}/content.json`, environment from VERCEL_ENV.
  throw new Error('snapshotPath() is not implemented yet (step 4)');
}

/** The last published content, or null if there is none or it cannot be read. */
export async function readSnapshot(): Promise<SiteContent | null> {
  // TODO(step 4): read the JSON at snapshotPath(), validate, return; null on any failure.
  return null;
}

/** Saves validated content as the new snapshot. Throws if the write fails. */
export async function writeSnapshot(content: SiteContent): Promise<void> {
  // TODO(step 4): write JSON to snapshotPath(), overwriting the previous one.
  void content;
  throw new Error('writeSnapshot() is not implemented yet (step 4)');
}
