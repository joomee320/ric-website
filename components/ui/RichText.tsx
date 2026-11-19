// Renders a rich text field from the content Doc (Markdown produced by flatten()).
// Restricted on purpose (docs/spec.md → Tech stack, Security and secrets):
// - only p, br, strong, em and a are rendered; any other Markdown (headings,
//   lists, images, ...) is reduced to its plain text
// - a single line break (Shift+Enter in the Doc) is shown as a line break
//   (docs/decisions.md D7), a blank line starts a new paragraph
// - raw HTML in the text is dropped
// - links must be http, https or mailto; any other link becomes plain text

import Markdown, { type UrlTransform } from 'react-markdown';

const ALLOWED_ELEMENTS = ['p', 'br', 'strong', 'em', 'a'];
const SAFE_URL = /^(https?|mailto):/i;

// In Markdown a single newline is just a space. Two trailing spaces make it a
// hard break (<br>). Blank lines (paragraph breaks) are left alone.
const withHardBreaks = (markdown: string) => markdown.replace(/([^\n])\n(?=[^\n])/g, '$1  \n');

// Runs before element filtering: an unsafe href is removed here, and the
// allowElement check below then unwraps the <a> into plain text.
const urlTransform: UrlTransform = (url) => (SAFE_URL.test(url.trim()) ? url : null);

export function RichText({ markdown }: { markdown: string }) {
  return (
    <Markdown
      allowedElements={ALLOWED_ELEMENTS}
      allowElement={(element) => element.tagName !== 'a' || Boolean(element.properties.href)}
      unwrapDisallowed
      skipHtml
      urlTransform={urlTransform}
    >
      {withHardBreaks(markdown)}
    </Markdown>
  );
}
