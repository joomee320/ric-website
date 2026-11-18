// The Publish pipeline: fetch the Doc → flatten() → archieml → checkContent().
// Returns a result for every outcome and never throws, so the Publish route can
// map it straight to a response (docs/spec.md → Publish API):
//   ok                  → 200, write the snapshot
//   invalid             → 422, list the issues for the editor
//   fetch_failed        → 502, "could not read the Doc"

import archieml from 'archieml';
import { flatten, type DocsDocument } from './flatten';
import { checkContent, type SiteContent } from './schema';

export type FetchDoc = () => Promise<DocsDocument>;

export type LoadResult =
  | { ok: true; content: SiteContent }
  | { ok: false; error: 'invalid'; issues: string[] }
  | { ok: false; error: 'fetch_failed' };

/**
 * @param fetchDoc reads the content Doc from the Docs API. Passed in so the
 *                 pipeline can be tested without Google; the real one is
 *                 lib/cms/google.ts.
 */
export async function loadContent(fetchDoc: FetchDoc): Promise<LoadResult> {
  let document: DocsDocument;
  try {
    document = await fetchDoc();
  } catch (error) {
    // Status and message only: never the Doc content or credentials.
    console.error('[cms] fetchDoc failed:', describeError(error));
    return { ok: false, error: 'fetch_failed' };
  }

  const { text } = flatten(document);
  const result = checkContent(archieml.load(text), text);
  if (!result.ok) return { ok: false, error: 'invalid', issues: result.issues };
  return { ok: true, content: result.content };
}

function describeError(error: unknown): string {
  if (error && typeof error === 'object') {
    const { code, status, message } = error as { code?: unknown; status?: unknown; message?: unknown };
    const statusPart = status ?? code;
    const messagePart = typeof message === 'string' ? message : 'unknown error';
    return statusPart === undefined ? messagePart : `${String(statusPart)} ${messagePart}`;
  }
  return 'unknown error';
}
