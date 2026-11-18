/**
 * Site settings that live in code, not in the content Doc (docs/decisions.md D9, D10).
 *
 * Pages read these and pass them to components as props, like CMS content.
 * Nothing here is secret: it is all shown on the public site.
 */

/** Navigation, in the order of the Home page design. */
export const NAV_ITEMS = [
  { href: '/', label: 'Home' },
  { href: '/about', label: 'About' },
  { href: '/itinerary', label: 'Itinerary' },
  { href: '/photo-archive', label: 'Photo archive' },
  { href: '/faq', label: 'FAQ' },
  { href: '/contact', label: 'Contact' },
] as const;

/** Call-to-action buttons shown next to the navigation. */
export const CTA_ITEMS = [
  { href: '/donate', label: 'Donate' },
  { href: '/apply', label: 'Apply Now' },
] as const;

/**
 * Contact details for /contact and the footer (D10).
 * TODO(contact): fill in with RiC's real email and social profile URLs.
 */
export const CONTACT = {
  email: '',
  social: [] as { label: string; href: string }[],
};

/**
 * Third-party embeds (docs/spec.md → Tech stack: Donations, Applications).
 * TODO(embeds): add the Givebutter campaign URL and the Google Form URL.
 *   - Each needs the embed URL (for the iframe/widget) and the plain page URL
 *     (shown as a link when the embed fails to load).
 */
export const EMBEDS = {
  givebutter: { embedUrl: '', pageUrl: '' },
  applicationForm: { embedUrl: '', pageUrl: '' },
};
