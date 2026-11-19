/**
 * About page (/about) — STUB (docs/decisions.md D9, D12).
 *
 * Content: Doc section `about_us` (story_text, team[]); team photos are files in
 * public/ matched by team member name (D12; see docs/spec.md → Open questions,
 * "Team bios").
 *
 * TODO(about):
 *   - Confirm the about_us fields, then add them to docs/content-model.md and
 *     the schema (lib/cms/schema.ts) together.
 *   - Props: content: SiteContent['about_us'] (import type only).
 *   - story_text via RichText; one card per team member.
 */

import { StubNotice } from '@/components/ui/StubNotice';

export function AboutPage() {
  return <StubNotice title="About" />;
}
