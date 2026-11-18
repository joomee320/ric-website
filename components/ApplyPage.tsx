/**
 * Apply page (/apply) — STUB (docs/decisions.md D9, D12).
 *
 * Content: Program Info from the Doc section `program_info` (eligibility,
 * important_dates[]) at the top, then the Google Form (hardcoded embed, D9).
 *
 * TODO(apply):
 *   - Confirm the program_info fields, then add them to docs/content-model.md and
 *     the schema together.
 *   - Props: content: SiteContent['program_info'] (import type only) and the
 *     form URLs (EMBEDS.applicationForm in lib/site.ts).
 *   - eligibility via RichText; important dates as a list; then EmbedFrame.
 */

import { StubNotice } from './StubNotice';

export function ApplyPage() {
  return <StubNotice title="Apply" />;
}
