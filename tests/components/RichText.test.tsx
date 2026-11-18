import { describe, expect, test } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { RichText } from '../../components/RichText';

const html = (markdown: string) => renderToStaticMarkup(<RichText markdown={markdown} />);

describe('Tech stack: rich text renders only p, strong, em, a', () => {
  test('bold, italic and links from flatten() render as HTML', () => {
    expect(html('An **experiential** _journey_ with [SEAFN](https://seafn.org).')).toBe(
      '<p>An <strong>experiential</strong> <em>journey</em> with <a href="https://seafn.org">SEAFN</a>.</p>',
    );
  });

  test('bold link (flatten puts bold outside)', () => {
    expect(html('**[SEAFN](https://seafn.org)**')).toBe(
      '<p><strong><a href="https://seafn.org">SEAFN</a></strong></p>',
    );
  });

  test('blank line separates paragraphs', () => {
    expect(html('First.\n\nSecond.')).toBe('<p>First.</p>\n<p>Second.</p>');
  });

  test('D7: a single line break (Shift+Enter in the Doc) renders as <br>', () => {
    expect(html('Line one.\nLine two.')).toBe('<p>Line one.<br/>\nLine two.</p>');
  });

  test('D7: line breaks inside bold (flatten wraps each line) render as <br>', () => {
    expect(html('**a**\n**b**')).toBe('<p><strong>a</strong><br/>\n<strong>b</strong></p>');
  });

  test('D7: a line break next to a paragraph break does not add an extra <br>', () => {
    expect(html('First.\n\nSecond.\nThird.')).toBe('<p>First.</p>\n<p>Second.<br/>\nThird.</p>');
  });

  test('headings and lists are reduced to plain text', () => {
    const out = html('# Big\n\n* item');
    expect(out).not.toMatch(/<(h\d|ul|ol|li)\b/);
    expect(out).toContain('Big');
    expect(out).toContain('item');
  });

  test('images are dropped', () => {
    expect(html('Before ![alt](https://example.org/x.png) after')).toBe('<p>Before  after</p>');
  });
});

describe('Security and secrets: links only http, https, mailto', () => {
  test('mailto links are kept', () => {
    expect(html('[Email us](mailto:info@example.org)')).toBe('<p><a href="mailto:info@example.org">Email us</a></p>');
  });

  test('http links are kept', () => {
    expect(html('[x](http://example.org)')).toBe('<p><a href="http://example.org">x</a></p>');
  });

  test.each([
    ['javascript:', 'javascript:alert(1)'],
    ['JavaScript: with spaces', ' JavaScript:alert(1)'],
    ['data:', 'data:text/html;base64,PHNjcmlwdD5hbGVydCgxKTwvc2NyaXB0Pg=='],
    ['relative path', '/admin'],
    ['other protocol', 'ftp://example.org'],
  ])('%s link becomes plain text', (_name, url) => {
    expect(html(`[click](<${url}>)`)).toBe('<p>click</p>');
  });
});

describe('Security and secrets: no raw HTML from the Doc reaches the page', () => {
  test('script tags are dropped', () => {
    const out = html('Hi <script>alert(1)</script> there');
    expect(out).not.toContain('<script');
    expect(out).toBe('<p>Hi alert(1) there</p>');
  });

  test('HTML tags typed into the Doc are not rendered as elements', () => {
    expect(html('<b>bold?</b> <img src=x onerror=alert(1)>')).toBe('<p>bold? </p>');
  });
});
