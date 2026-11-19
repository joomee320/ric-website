/**
 * Main navigation links — STUB (docs/decisions.md D12, D13, D14).
 * Part of SiteHeader. Items come from NAV_ITEMS in lib/site.ts (via props).
 *
 * UI states:
 *   - current page: the matching link gets aria-current="page" and a highlight.
 *   - mobile: links collapse behind a menu button (open / closed).
 * Both need browser-side state (the pathname, the open flag), so this becomes a
 * client component ('use client') — one of the two client components in D13.
 *
 * TODO(ui):
 *   - usePathname() for the current page; a button toggling the mobile menu
 *     (aria-expanded, closes on navigation and on Escape).
 */

export interface NavItem {
  href: string;
  label: string;
}

export function NavLinks(props: { items: readonly NavItem[] }) {
  void props;
  return null;
}
