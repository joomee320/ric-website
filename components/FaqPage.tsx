/**
 * FAQ page (/faq) — STUB (docs/decisions.md D9, D12).
 *
 * Content: Doc section `faq_list` (question, answer per item).
 *
 * TODO(faq):
 *   - Add faq_list to docs/content-model.md and the schema together.
 *   - Props: content: SiteContent['faq_list'] (import type only).
 *   - answer via RichText; consider <details>/<summary> for each question.
 */

import { StubNotice } from './StubNotice';

export function FaqPage() {
  return <StubNotice title="FAQ" />;
}
