/**
 * Home hero: the large title over the hero image (Figma: Home → hero block).
 * Presentational only. Data: home_page.hero_title (docs/content-model.md).
 *
 * TODO(ui, D11/D12):
 *   - Hero image from public/ with next/image (priority, alt text); title over it.
 *   - Styling from the Figma tokens.
 */

export function Hero({ title }: { title: string }) {
  return <h1>{title}</h1>;
}
