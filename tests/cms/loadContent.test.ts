import { afterEach, describe, expect, test, vi } from 'vitest';
import { loadContent } from '../../lib/cms/loadContent';
import { MESSAGES } from '../../lib/cms/schema';
import type { DocsDocument } from '../../lib/cms/flatten';

// Builders for fake Docs API JSON (same shape as documents.get).
type Style = { bold?: boolean; italic?: boolean; link?: { url: string } };
const run = (content: string, textStyle: Style = {}) => ({ textRun: { content, textStyle } });
const paragraph = (...elements: ReturnType<typeof run>[]) => ({ paragraph: { elements } });
const line = (content: string) => paragraph(run(`${content}\n`));
type DocElement = NonNullable<NonNullable<DocsDocument['body']>['content']>[number];
const doc = (...content: DocElement[]): DocsDocument => ({ body: { content } });
const fetchOf = (document: DocsDocument) => async () => document;

const validDoc = () =>
  doc(
    line('{home_page}'),
    line('hero_title: Rooted in Cambodia'),
    paragraph(
      run('mission_statement: An '),
      run('experiential', { bold: true }),
      run(' journey with '),
      run('SEAFN', { link: { url: 'https://seafn.org' } }),
      run('.\n'),
    ),
    line(''),
    line('Second paragraph.'),
    line(':end'),
    line('{}'),
  );

afterEach(() => {
  vi.restoreAllMocks();
});

describe('Architecture: loadContent pipeline (fetch → flatten → archieml → zod)', () => {
  test('valid Doc returns content with formatting as Markdown', async () => {
    expect(await loadContent(fetchOf(validDoc()))).toEqual({
      ok: true,
      content: {
        home_page: {
          hero_title: 'Rooted in Cambodia',
          mission_statement:
            'An **experiential** journey with [SEAFN](https://seafn.org).\n\nSecond paragraph.',
        },
      },
    });
  });

  test('images and tables in the Doc are ignored (Editor rule 4)', async () => {
    const document = validDoc();
    document.body!.content!.splice(1, 0, { table: {} }, { sectionBreak: {} });
    const result = await loadContent(fetchOf(document));
    expect(result.ok).toBe(true);
  });

  test('Done #2: typo in a key from the Doc is reported as invalid', async () => {
    const result = await loadContent(
      fetchOf(doc(line('{home_page}'), line('hero_titel: Rooted'), line('mission_statement: M'), line('{}'))),
    );
    expect(result).toEqual({
      ok: false,
      error: 'invalid',
      issues: ['hero_titel: did you mean hero_title? (Home page section)'],
    });
  });

  test('Done #3 / D1: missing :end in the Doc is reported as invalid', async () => {
    const result = await loadContent(
      fetchOf(
        doc(
          line('{home_page}'),
          line('hero_title: T'),
          line('mission_statement: First paragraph.'),
          line(''),
          line('Second paragraph.'),
          line('{}'),
        ),
      ),
    );
    expect(result).toEqual({
      ok: false,
      error: 'invalid',
      issues: [MESSAGES.droppedText('Home page', 'Second paragraph.')],
    });
  });

  test('Shift+Enter line breaks (\\u000b) are read as new lines', async () => {
    const result = await loadContent(
      fetchOf(
        doc(
          line('{home_page}'),
          line('hero_title: T'),
          line('mission_statement: Line one\u000bLine two'),
          line(':end'),
          line('{}'),
        ),
      ),
    );
    expect(result.ok && result.content.home_page.mission_statement).toBe('Line one\nLine two');
  });
});

describe('Error handling: Doc cannot be read', () => {
  test('a failing fetch returns fetch_failed and does not throw', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const fetchDoc = async () => {
      throw Object.assign(new Error('The caller does not have permission'), { status: 403 });
    };
    expect(await loadContent(fetchDoc)).toEqual({ ok: false, error: 'fetch_failed' });
  });

  test('the log has status and message only, never Doc content', async () => {
    const log = vi.spyOn(console, 'error').mockImplementation(() => {});
    const fetchDoc = async () => {
      throw Object.assign(new Error('Requested entity was not found.'), {
        status: 404,
        response: { data: 'SECRET DOC CONTENT' },
        config: { headers: { Authorization: 'Bearer SECRET-TOKEN' } },
      });
    };
    await loadContent(fetchDoc);
    const logged = log.mock.calls.flat().join(' ');
    expect(logged).toContain('404 Requested entity was not found.');
    expect(logged).not.toContain('SECRET');
  });

  test('a non-Error rejection is still handled', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const fetchDoc = () => Promise.reject('boom');
    expect(await loadContent(fetchDoc)).toEqual({ ok: false, error: 'fetch_failed' });
  });
});
