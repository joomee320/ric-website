import { describe, expect, test } from 'vitest';
import archieml from 'archieml';
import { checkContent, MESSAGES, type SiteContent } from '../../lib/cms/schema';

// Runs a Doc text through the same steps as Publish: archieml, then checkContent.
const check = (text: string) => checkContent(archieml.load(text), text);

const VALID_DOC = `{home_page}
hero_title: Rooted in Cambodia
mission_statement: First paragraph with **bold**, _italic_ and [a link](https://example.org).

Second paragraph.
:end
{}
`;

const issuesOf = (text: string) => {
  const result = check(text);
  if (result.ok) throw new Error('expected validation to fail');
  return result.issues;
};

describe('Content model: home_page', () => {
  test('valid Doc passes and returns the content', () => {
    const result = check(VALID_DOC);
    const expected: SiteContent = {
      home_page: {
        hero_title: 'Rooted in Cambodia',
        mission_statement:
          'First paragraph with **bold**, _italic_ and [a link](https://example.org).\n\nSecond paragraph.',
      },
    };
    expect(result).toEqual({ ok: true, content: expected });
  });

  test('editor instructions above and below the section are allowed', () => {
    const text = `How to edit: change only the words after the colon.\n\n${VALID_DOC}\nLast edited by Sophy.\n`;
    expect(check(text).ok).toBe(true);
  });

  test('values are trimmed', () => {
    const result = check('{home_page}\nhero_title:   Rooted   \nmission_statement: M\n{}\n');
    expect(result.ok && result.content.home_page.hero_title).toBe('Rooted');
  });

  test('missing hero_title is reported with the key to check', () => {
    expect(issuesOf('{home_page}\nmission_statement: M\n{}\n')).toEqual([
      MESSAGES.fieldMissing('Home page title', 'hero_title'),
    ]);
  });

  test('empty mission_statement is reported', () => {
    expect(issuesOf('{home_page}\nhero_title: T\nmission_statement:\n{}\n')).toEqual([
      MESSAGES.fieldEmpty('Home page mission statement', 'mission_statement'),
    ]);
  });

  test('whitespace-only value counts as empty', () => {
    expect(issuesOf('{home_page}\nhero_title:    \nmission_statement: M\n{}\n')).toEqual([
      MESSAGES.fieldEmpty('Home page title', 'hero_title'),
    ]);
  });

  test('hero_title must be one line', () => {
    expect(issuesOf('{home_page}\nhero_title: Line one\nLine two\n:end\nmission_statement: M\n{}\n')).toEqual([
      MESSAGES.fieldOneLine('Home page title', 'hero_title'),
    ]);
  });

  test('Doc with no sections reports the missing {home_page} section', () => {
    expect(issuesOf('Just some notes, no sections yet.\n')).toEqual([MESSAGES.sectionMissing('home_page')]);
  });

  test('fields without the {home_page} line are reported as outside the section', () => {
    expect(issuesOf('hero_title: T\nmission_statement: M\n')).toEqual([
      MESSAGES.sectionMissing('home_page'),
      MESSAGES.keyOutsideSection('hero_title', 'home_page'),
      MESSAGES.keyOutsideSection('mission_statement', 'home_page'),
    ]);
  });

  test('all problems are reported at once', () => {
    expect(issuesOf('{home_page}\n{}\n')).toEqual([
      MESSAGES.fieldMissing('Home page title', 'hero_title'),
      MESSAGES.fieldMissing('Home page mission statement', 'mission_statement'),
    ]);
  });
});

describe('Done #2 / spec Error handling: unknown keys', () => {
  test('typo hero_titel gets one "did you mean" message, not also "missing"', () => {
    expect(issuesOf('{home_page}\nhero_titel: Rooted\nmission_statement: M\n{}\n')).toEqual([
      'hero_titel: did you mean hero_title? (Home page section)',
    ]);
  });

  test('auto-capitalised key Hero_title suggests hero_title (Editor rule 6)', () => {
    expect(issuesOf('{home_page}\nHero_title: Rooted\nmission_statement: M\n{}\n')).toEqual([
      MESSAGES.unknownKey('Hero_title', 'Home page', 'hero_title', ['hero_title', 'mission_statement']),
    ]);
  });

  test('unrelated unknown key lists the allowed keys', () => {
    expect(issuesOf('{home_page}\nhero_title: T\nmission_statement: M\nbutton_text: Go\n{}\n')).toEqual([
      MESSAGES.unknownKey('button_text', 'Home page', null, ['hero_title', 'mission_statement']),
    ]);
  });

  test('a section outside current scope (about_us) is rejected', () => {
    expect(issuesOf(`${VALID_DOC}\n{about_us}\nstory_text: S\n{}\n`)).toEqual([
      MESSAGES.unknownSection('about_us', null, ['home_page']),
    ]);
  });

  test('misspelled section name gets one "did you mean", not also "section missing"', () => {
    expect(issuesOf('{homepage}\nhero_title: T\nmission_statement: M\n{}\n')).toEqual([
      MESSAGES.unknownSection('homepage', 'home_page', ['home_page']),
    ]);
  });

  test('"Word:" line inside a :end field is caught as an unknown key (Editor rule 3)', () => {
    const issues = issuesOf('{home_page}\nhero_title: T\nmission_statement: First.\n\nNote: second.\n:end\n{}\n');
    expect(issues).toEqual([
      MESSAGES.unknownKey('Note', 'Home page', null, ['hero_title', 'mission_statement']),
    ]);
  });
});

describe('Done #3 / D1: text dropped by a missing :end', () => {
  test('second paragraph without :end is reported', () => {
    const text = '{home_page}\nhero_title: T\nmission_statement: First paragraph.\n\nSecond paragraph.\n{}\n';
    expect(issuesOf(text)).toEqual([MESSAGES.droppedText('Home page', 'Second paragraph.')]);
  });

  test('only the first 3 dropped lines are listed, the rest are counted', () => {
    const text = '{home_page}\nhero_title: T\nmission_statement: P1\n\nP2\n\nP3\n\nP4\n\nP5\n{}\n';
    expect(issuesOf(text)).toEqual([
      MESSAGES.droppedText('Home page', 'P2'),
      MESSAGES.droppedText('Home page', 'P3'),
      MESSAGES.droppedText('Home page', 'P4'),
      MESSAGES.droppedTextMore(1),
    ]);
  });

  test('long dropped lines are shortened in the message', () => {
    const long = 'x'.repeat(100);
    const [issue] = issuesOf(`{home_page}\nhero_title: T\nmission_statement: P1\n\n${long}\n{}\n`);
    expect(issue).toBe(MESSAGES.droppedText('Home page', `${'x'.repeat(59)}…`));
  });

  test('escaped "\\Note:" line inside :end is kept, not reported (Editor rule 3)', () => {
    expect(check('{home_page}\nhero_title: T\nmission_statement: First.\n\n\\Note: second.\n:end\n{}\n').ok).toBe(true);
  });

  test('uppercase :END works like :end', () => {
    expect(check('{home_page}\nhero_title: T\nmission_statement: First.\n\nSecond.\n:END\n{}\n').ok).toBe(true);
  });

  test('text inside :skip ... :endskip is intentionally hidden, not reported', () => {
    expect(check(`{home_page}\n:skip\nnote to self\n:endskip\nhero_title: T\nmission_statement: M\n{}\n`).ok).toBe(true);
  });
});
