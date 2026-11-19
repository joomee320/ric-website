/**
 * Home call-to-action row: the Donate and Apply buttons below the Mission section
 * (Figma: Home, under the divider) — STUB (docs/decisions.md D12, D14).
 * Items come from CTA_ITEMS in lib/site.ts (via props from the page).
 *
 * TODO(ui):
 *   - Two ButtonLinks: Donate (outline) and Apply (solid, with an arrow).
 *   - Render it in HomePage once app/page.tsx passes CTA_ITEMS.
 */

import type { NavItem } from '@/components/layout/NavLinks';

export function CtaRow(props: { items: readonly NavItem[] }) {
  void props;
  return null;
}
