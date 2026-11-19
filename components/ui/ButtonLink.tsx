/**
 * A link styled as a button — STUB (docs/decisions.md D12, D14).
 * Used for the Donate / Apply buttons in the header, the Home CTA row and the footer.
 *
 * Variants (Figma: Home header):
 *   outline  "Donate"     — bordered, transparent background
 *   solid    "Apply Now"  — filled
 *
 * TODO(ui, D11):
 *   - Render next/link with Tailwind classes for each variant.
 *   - Visible focus style; minimum 44px touch target.
 *   - Until then it renders a plain link (no styling).
 */

import Link from 'next/link';

export type ButtonVariant = 'outline' | 'solid';

export function ButtonLink({ href, children }: { href: string; variant: ButtonVariant; children: string }) {
  return <Link href={href}>{children}</Link>;
}
