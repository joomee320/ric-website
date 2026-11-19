/**
 * Home mission section: the fixed "Mission" heading and the mission text
 * (Figma: Home → Mission block). Presentational only.
 * Data: home_page.mission_statement, Markdown rendered by RichText.
 * The heading is fixed text, not from the Doc (docs/content-model.md).
 *
 * TODO(ui, D11): two-column text layout from the Figma design (CSS columns, so
 *   the text flows and the container grows with it); one column on mobile.
 */

import { RichText } from '@/components/ui/RichText';

export function MissionSection({ markdown }: { markdown: string }) {
  return (
    <section>
      <h2>Mission</h2>
      <RichText markdown={markdown} />
    </section>
  );
}
