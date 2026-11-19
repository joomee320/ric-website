/**
 * Itinerary page (/itinerary) — STUB (docs/decisions.md D9, D12).
 *
 * Content: Doc section `itinerary` (day, title, details per item).
 *
 * TODO(itinerary):
 *   - The item shape is an open question (docs/spec.md → Open questions,
 *     "Itinerary shape"); decide it, then update docs/content-model.md and the schema.
 *   - Props: content: SiteContent['itinerary'] (import type only).
 *   - details via RichText.
 */

import { StubNotice } from '@/components/ui/StubNotice';

export function ItineraryPage() {
  return <StubNotice title="Itinerary" />;
}
