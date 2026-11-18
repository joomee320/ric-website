/**
 * POST /api/publish — STUB (docs/decisions.md D12). Implemented in step 5
 * (docs/progress.md). Until then it answers 501 Not Implemented.
 *
 * Called by the Apps Script "Website → Publish to website" menu in the content Doc.
 * Validates the Doc and either publishes it or returns what to fix; never leaves
 * the site half-updated (docs/spec.md → Publish API).
 *
 * Planned steps:
 *   1. Compare header `x-publish-secret` with PUBLISH_SECRET using
 *      crypto.timingSafeEqual → 401 { ok: false, error: 'unauthorized' }.
 *   2. loadContent(fetchDoc) (lib/cms/loadContent.ts, lib/cms/google.ts).
 *      - error 'fetch_failed' → 502 { ok: false, error: 'fetch_failed' }
 *      - error 'invalid'      → 422 { ok: false, issues }   (nothing written)
 *   3. writeSnapshot(content) (lib/cms/snapshot.ts)
 *      → 500 { ok: false, error: 'store_failed' } if it throws (cache untouched).
 *   4. revalidateTag('cms', { expire: 0 }) so the next page load shows the new
 *      content. (Next.js 16: the one-argument form is deprecated and updateTag()
 *      only works in Server Actions.)
 *   5. 200 { ok: true, publishedAt }.
 *
 * Constraints:
 * - Only POST. GET must not publish (link previews and crawlers).
 * - No `export const runtime`: Cache Components is on (CLAUDE.md → Tech constraints).
 * - Logs: status and message only, never the secret, keys or Doc content.
 *
 * TODO(step 5): implement the steps above; route tests with fetchDoc and the
 *   snapshot store mocked: 401, 422 with no write, 502, 500, 200 with write.
 */

export async function POST(): Promise<Response> {
  return Response.json({ ok: false, error: 'not_implemented' }, { status: 501 });
}
