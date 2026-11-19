/**
 * Home page (/). Composes the Home sections from the Figma design (D14).
 * Presentational only: all Doc content arrives through props.
 * Plain and unstyled until the Figma work starts (D11).
 *
 * Sections, top to bottom (Figma: Home):
 *   Hero            hero image + home_page.hero_title
 *   MissionSection  "Mission" + home_page.mission_statement
 *   CtaRow          Donate / Apply buttons            — TODO(ui): stub, not rendered yet
 * The header, footer and social links come from the root layout, not this page.
 */

import type { SiteContent } from '@/lib/cms/schema';
import { Hero } from '@/components/home/Hero';
import { MissionSection } from '@/components/home/MissionSection';

export function HomePage({ content }: { content: SiteContent['home_page'] }) {
  return (
    <main>
      <Hero title={content.hero_title} />
      <MissionSection markdown={content.mission_statement} />
    </main>
  );
}
