// "Learning tests" that pin the behaviour of the archieml library itself.
// If a library upgrade changes its behaviour, these break first.
import { test } from 'vitest';
import assert from 'node:assert/strict';
import archieml from 'archieml';

const load = (text) => archieml.load(text);

test('multiple paragraphs without :end → only the first is kept, the second is silently dropped', () => {
  assert.deepEqual(load('body: First paragraph.\n\nSecond paragraph.\n'), { body: 'First paragraph.' });
});

test('with :end, multiple paragraphs including blank lines become one value', () => {
  assert.deepEqual(load('body: First paragraph.\n\nSecond paragraph.\n:end\n'), {
    body: 'First paragraph.\n\nSecond paragraph.',
  });
});

test('typo in a key (hero_titel) → no error, the misspelled key is created as is', () => {
  const result = load('hero_titel: Rooted in Cambodia\n');
  assert.deepEqual(result, { hero_titel: 'Rooted in Cambodia' });
  assert.equal(result.hero_title, undefined);
});

test('keys are case-sensitive', () => {
  assert.deepEqual(load('Hero_Title: X\nhero_title: Y\n'), { Hero_Title: 'X', hero_title: 'Y' });
});

test('{name} → object', () => {
  assert.deepEqual(load('{hero}\ntitle: A\nsubtitle: B\n{}\n'), { hero: { title: 'A', subtitle: 'B' } });
});

test('[+name] → array of {type, value} (order kept, free text is type: "text")', () => {
  assert.deepEqual(load('[+hero]\ntitle: A\nsubtitle: B\n[]\n'), {
    hero: [
      { type: 'title', value: 'A' },
      { type: 'subtitle', value: 'B' },
    ],
  });
  assert.deepEqual(load('[+paras]\nFirst.\n\nSecond.\n[]\n'), {
    paras: [
      { type: 'text', value: 'First.' },
      { type: 'text', value: 'Second.' },
    ],
  });
});

test('[faq_list] → a new object starts each time the first key (question) appears again', () => {
  assert.deepEqual(load('[faq_list]\nquestion: Q1\nanswer: A1\nquestion: Q2\nanswer: A2\n[]\n'), {
    faq_list: [
      { question: 'Q1', answer: 'A1' },
      { question: 'Q2', answer: 'A2' },
    ],
  });
});

test('[faq_list] missing answer → no error, an object without answer', () => {
  assert.deepEqual(load('[faq_list]\nquestion: Q1\nquestion: Q2\nanswer: A2\n[]\n'), {
    faq_list: [{ question: 'Q1' }, { question: 'Q2', answer: 'A2' }],
  });
});

test('[faq_list] if the first item\'s key order changes, the delimiter key changes too', () => {
  // The first object starts with answer, so answer becomes the delimiter
  assert.deepEqual(load('[faq_list]\nanswer: A1\nquestion: Q1\nanswer: A2\n[]\n'), {
    faq_list: [{ answer: 'A1', question: 'Q1' }, { answer: 'A2' }],
  });
});

test('[tags] string arrays need a "* " prefix (if Docs auto-bullets remove the *, the array is empty)', () => {
  assert.deepEqual(load('[tags]\n* a\n* b\n[]\n'), { tags: ['a', 'b'] });
  assert.deepEqual(load('[tags]\na\nb\n[]\n'), { tags: [] });
});

test('⚠️ inside a :end block, a line starting with "Word:" becomes a new key and cuts off the text', () => {
  assert.deepEqual(load('body: First.\n\nNote: second.\n:end\n'), { body: 'First.', Note: 'second.' });
  // Escaping with a backslash keeps the text
  assert.deepEqual(load('body: First.\n\n\\Note: second.\n:end\n'), { body: 'First.\n\nNote: second.' });
});

test('Markdown characters pass through archieml untouched as strings', () => {
  assert.deepEqual(load('t: **Rooted** in [x](https://a.b)\n'), { t: '**Rooted** in [x](https://a.b)' });
});
