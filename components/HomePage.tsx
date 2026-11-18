// Home page UI. Plain, unstyled placeholder until the Figma design is implemented.
// Presentational only: all Doc content arrives through props.
// Text that is not in the Doc (the "Mission" heading) is fixed here
// (docs/content-model.md → Page text that does not come from the Doc).

import type { SiteContent } from '@/lib/cms/schema';
import { RichText } from './RichText';

export function HomePage({ content }: { content: SiteContent['home_page'] }) {
  return (
    <main>
      <h1>{content.hero_title}</h1>
      <section>
        <h2>Mission</h2>
        <RichText markdown={content.mission_statement} />
      </section>
    </main>
  );
}
