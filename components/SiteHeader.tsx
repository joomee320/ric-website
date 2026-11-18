/**
 * Site header — STUB (docs/decisions.md D12). Built with the Figma work (D11).
 *
 * Shows the site name, the navigation and the Donate / Apply Now buttons from the
 * Home page design. Presentational only: items arrive as props from
 * app/layout.tsx, which reads them from lib/site.ts (NAV_ITEMS, CTA_ITEMS).
 *
 * TODO(ui):
 *   - Render the site name linking to "/", the nav links, and the two buttons
 *     (Donate outlined, Apply Now filled) with next/link.
 *   - Mark the current page (aria-current="page"); this needs the pathname, so
 *     the nav list may become a small client component.
 *   - Mobile: collapse the nav into a menu button.
 *   - Wire into app/layout.tsx.
 */

export interface NavItem {
  href: string;
  label: string;
}

export function SiteHeader(props: { navItems: readonly NavItem[]; ctaItems: readonly NavItem[] }) {
  void props;
  return null;
}
