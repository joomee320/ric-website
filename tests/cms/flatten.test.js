import { test } from 'vitest';
import assert from 'node:assert/strict';
import { flatten } from '../../lib/cms/flatten';

// Builders for fake Docs API JSON
const run = (content, textStyle = {}) => ({ textRun: { content, textStyle } });
const paragraph = (...elements) => ({ paragraph: { elements } });
const doc = (...content) => ({ body: { content } });
const flat = (...elements) => flatten(doc(paragraph(...elements))).text;

const BOLD = { bold: true };
const ITALIC = { italic: true };
const link = (url, extra = {}) => ({ link: { url }, ...extra });

test('plain text', () => {
  assert.equal(flat(run('hero_title: Rooted in Cambodia\n')), 'hero_title: Rooted in Cambodia\n');
});

test('bold', () => {
  assert.equal(flat(run('Rooted in '), run('Cambodia', BOLD), run('\n')), 'Rooted in **Cambodia**\n');
});

test('italic', () => {
  assert.equal(flat(run('a '), run('word', ITALIC), run(' b\n')), 'a _word_ b\n');
});

test('link', () => {
  assert.equal(flat(run('by '), run('SEAFN', link('https://x.org')), run('.\n')), 'by [SEAFN](https://x.org).\n');
});

test('bold + link together → bold is outside', () => {
  assert.equal(flat(run('SEAFN', link('https://x.org', BOLD)), run('\n')), '**[SEAFN](https://x.org)**\n');
});

test('bold + italic together', () => {
  assert.equal(flat(run('wow', { bold: true, italic: true }), run('\n')), '**_wow_**\n');
});

test('bold with leading/trailing spaces → spaces go outside the markers', () => {
  assert.equal(flat(run('Rooted in'), run(' Cambodia ', BOLD), run('now\n')), 'Rooted in **Cambodia** now\n');
});

test('a bold run with only whitespace gets no markers', () => {
  assert.equal(flat(run('a'), run(' ', BOLD), run('b\n')), 'a b\n');
});

test('bold ending in a newline → newline goes outside the markers', () => {
  assert.equal(flat(run('Rooted in '), run('Cambodia\n', BOLD)), 'Rooted in **Cambodia**\n');
});

test('\\u000b (Shift+Enter) → \\n', () => {
  assert.equal(flat(run('line1\u000bline2\n')), 'line1\nline2\n');
});

test('\\u000b inside bold → each line wrapped separately', () => {
  assert.equal(flat(run('a\u000bb\n', BOLD)), '**a**\n**b**\n');
});

test('consecutive textRuns split with the same style → merged into one', () => {
  assert.equal(flat(run('Camb', BOLD), run('odia', BOLD), run('\n')), '**Cambodia**\n');
});

test('consecutive runs of the same link → one link', () => {
  const style = link('https://x.org');
  assert.equal(flat(run('SE', style), run('AFN', style), run('\n')), '[SEAFN](https://x.org)\n');
});

test('neighbouring links with different URLs are not merged', () => {
  assert.equal(
    flat(run('A', link('https://a.org')), run('B', link('https://b.org')), run('\n')),
    '[A](https://a.org)[B](https://b.org)\n',
  );
});

test('bold: false / no textStyle → no formatting', () => {
  assert.equal(flat(run('a', { bold: false }), { textRun: { content: 'b\n' } }), 'ab\n');
});

test('multiple paragraphs are joined in order', () => {
  const { text } = flatten(doc(paragraph(run('{hero}\n')), paragraph(run('title: A\n')), paragraph(run('{}\n'))));
  assert.equal(text, '{hero}\ntitle: A\n{}\n');
});

test('tables, images etc. are ignored and counted by kind', () => {
  const { text, skipped } = flatten(
    doc(
      { sectionBreak: {} },
      paragraph(run('before '), { inlineObjectElement: { inlineObjectId: 'img1' } }, run('after\n')),
      { startIndex: 10, endIndex: 20, table: {} },
      { table: {} },
    ),
  );
  assert.equal(text, 'before after\n');
  assert.deepEqual(skipped, { sectionBreak: 1, inlineObjectElement: 1, table: 2 });
});

test('empty document / no body', () => {
  assert.deepEqual(flatten({}), { text: '', skipped: {} });
});

// Known limitation: when styles overlap only partially, run-by-run rendering cannot nest them cleanly.
// todo: needs style-tree rendering
test('partial overlap: bold "Camb" + bold-italic "odia"', { todo: true }, () => {
  assert.equal(flat(run('Camb', BOLD), run('odia', { bold: true, italic: true }), run('\n')), '**Camb_odia_**\n');
});

// todo: needs grouping by link first
test('partial overlap: only part of a link is bold', { todo: true }, () => {
  const url = 'https://x.org';
  assert.equal(flat(run('SE', link(url, BOLD)), run('AFN', link(url)), run('\n')), '[**SE**AFN](https://x.org)\n');
});
