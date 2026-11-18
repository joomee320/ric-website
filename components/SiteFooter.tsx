/**
 * Site footer — STUB (docs/decisions.md D12). Built with the Figma work (D11).
 *
 * Shows the Donate / Apply buttons and the social icons from the Home page design.
 * The "Subscribe to get the latest news" form in the design is out of scope (D5).
 * Presentational only: data arrives as props from app/layout.tsx (lib/site.ts).
 *
 * TODO(ui):
 *   - Render the Donate / Apply buttons and social links (CONTACT.social).
 *   - Social icons: SVG files in public/ (D12), each with an accessible label.
 *   - Wire into app/layout.tsx.
 */

export function SiteFooter(props: { social: readonly { label: string; href: string }[] }) {
  void props;
  return null;
}
