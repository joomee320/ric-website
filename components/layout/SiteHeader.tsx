/**
 * Site header — STUB (docs/decisions.md D12, D14). Built with the Figma work (D11).
 *
 * Composition (Figma: Home header):
 *   site name "Rooted in Cambodia" (link to /)
 *   NavLinks      Home, About, Itinerary, Photo archive, FAQ, Contact
 *   ButtonLink×2  Donate (outline), Apply Now (solid)
 * Presentational only: items arrive as props from app/layout.tsx, which reads
 * NAV_ITEMS and CTA_ITEMS from lib/site.ts.
 *
 * TODO(ui):
 *   - Render the composition above; wire into app/layout.tsx.
 *   - Mobile: NavLinks collapses behind a menu button (see NavLinks).
 */

import type { NavItem } from './NavLinks';

export function SiteHeader(props: { navItems: readonly NavItem[]; ctaItems: readonly NavItem[] }) {
  void props;
  return null;
}
