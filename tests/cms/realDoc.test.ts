// Runs the pipeline against real Docs API output (tests/fixtures/real-doc.json,
// saved by scripts/fetch-doc-fixture.mjs). Hand-made fixtures in the other tests
// only contain the fields we expected; this one has everything the API returns.
// Assertions check behaviour, not the full text, so editing the Doc copy and
// re-fetching does not require rewriting these tests.

import { describe, expect, test } from 'vitest';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import realDoc from '../fixtures/real-doc.json';
import { RichText } from '../../components/ui/RichText';
import { flatten, type DocsDocument } from '../../lib/cms/flatten';
import { loadContent } from '../../lib/cms/loadContent';

const document = realDoc as DocsDocument;

describe('Real Doc fixture: flatten()', () => {
  const { text, skipped } = flatten(document);

  test('only the leading sectionBreak is skipped', () => {
    expect(skipped).toEqual({ sectionBreak: 1 });
  });

  test('a bold run becomes **…**', () => {
    expect(text).toContain('mission_statement: **Rooted in Cambodia** is a');
  });

  test('an italic run with a trailing space keeps the space outside the markers', () => {
    expect(text).toContain('allows _first time travelers to Cambodia_ to engage');
  });

  test('Shift+Enter (\\u000b) becomes a newline', () => {
    expect(text).not.toContain('\u000b');
    expect(text).toContain('in Cambodia.\nRooted in Cambodia cohorts');
  });
});

describe('Real Doc fixture: loadContent()', () => {
  test('passes validation with no dropped text (D1 has no false positives)', async () => {
    const result = await loadContent(async () => document);
    expect(result.ok).toBe(true);
  });

  test('mission_statement keeps both paragraphs and the formatting', async () => {
    const result = await loadContent(async () => document);
    if (!result.ok) throw new Error('expected ok');
    const mission = result.content.home_page.mission_statement;
    expect(mission.startsWith('**Rooted in Cambodia**')).toBe(true);
    expect(mission).toContain('_first time travelers to Cambodia_');
    expect(mission.split('\n\n')).toHaveLength(2);
  });

  test('D7: on the page, the Shift+Enter break shows as <br> and formatting as tags', async () => {
    const result = await loadContent(async () => document);
    if (!result.ok) throw new Error('expected ok');
    const html = renderToStaticMarkup(
      createElement(RichText, { markdown: result.content.home_page.mission_statement }),
    );
    expect(html).toContain('<strong>Rooted in Cambodia</strong> is a');
    expect(html).toContain('<em>first time travelers to Cambodia</em> to engage');
    expect(html).toContain('in Cambodia.<br/>\nRooted in Cambodia cohorts');
    expect(html.match(/<p>/g)).toHaveLength(2);
  });
});
