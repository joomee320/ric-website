// Renders a rich text field from the content Doc (Markdown produced by flatten()).
// Restricted on purpose (docs/spec.md → Tech stack, Security and secrets):
// - only p, strong, em and a are rendered; any other Markdown (headings, lists,
//   images, ...) is reduced to its plain text
// - raw HTML in the text is dropped
// - links must be http, https or mailto; any other link becomes plain text

import Markdown, { type UrlTransform } from 'react-markdown';

const ALLOWED_ELEMENTS = ['p', 'strong', 'em', 'a'];
const SAFE_URL = /^(https?|mailto):/i;

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
      {markdown}
    </Markdown>
  );
}
