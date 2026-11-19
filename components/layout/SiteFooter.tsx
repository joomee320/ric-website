/**
 * Site footer — STUB (docs/decisions.md D12, D14). Built with the Figma work (D11).
 *
 * Composition (Figma: Home, bottom):
 *   SocialLinks  icons from CONTACT.social
 * The Donate / Apply buttons above the icons belong to the Home page (CtaRow).
 * The "Subscribe to get the latest news" form is out of scope (D5).
 * Presentational only: data arrives as props from app/layout.tsx (lib/site.ts).
 *
 * TODO(ui): render SocialLinks; wire into app/layout.tsx.
 */

export function SiteFooter(props: { social: readonly { label: string; href: string }[] }) {
  void props;
  return null;
}
