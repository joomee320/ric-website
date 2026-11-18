/**
 * Photo archive page (/photo-archive) — STUB (docs/decisions.md D9, D12).
 *
 * Content: images in public/ (D9, D12); nothing from the Doc.
 *
 * TODO(photo-archive):
 *   - Decide the folder layout (e.g. public/photos/<year>/) and how captions and
 *     alt text are stored (a small list in code).
 *   - Grid of next/image thumbnails with alt text; lazy loading.
 */

import { StubNotice } from './StubNotice';

export function PhotoArchivePage() {
  return <StubNotice title="Photo archive" />;
}
