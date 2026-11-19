/**
 * Third-party embed with a plain-link fallback — STUB (docs/decisions.md D9, D12).
 * Used by /donate (Givebutter) and /apply (Google Form).
 *
 * Planned behaviour (docs/spec.md → Error handling, "embed fails to load"):
 *   - Render the embed (an <iframe>, or Givebutter's widget script).
 *   - If it has not loaded after a timeout, show a plain link to `pageUrl`
 *     instead, so visitors can still donate or apply.
 *   - The iframe has a descriptive `title` for screen readers.
 *
 * TODO(embeds):
 *   - Check Givebutter's current embed docs: iframe vs widget script, and the
 *     Content-Security-Policy it needs.
 *   - This becomes a client component ('use client') for the load timeout (D13).
 *   - Until then it renders only the fallback link.
 */

export function EmbedFrame({ title, pageUrl }: { title: string; embedUrl: string; pageUrl: string }) {
  if (!pageUrl) return null;
  return (
    <p>
      <a href={pageUrl}>{title}</a>
    </p>
  );
}
