/**
 * Social media icon links — STUB (docs/decisions.md D10, D12, D14).
 * Used in SiteFooter (Figma: Home → row of icons above the footer).
 * Items come from CONTACT.social in lib/site.ts (via props).
 *
 * TODO(ui):
 *   - One icon link per item; SVG icons in public/ (D12).
 *   - Each link has an accessible name (aria-label = platform name), since the
 *     icon has no visible text.
 */

export function SocialLinks(props: { items: readonly { label: string; href: string }[] }) {
  void props;
  return null;
}
