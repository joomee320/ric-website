import { test } from 'vitest';
import assert from 'node:assert/strict';
import { flatten } from '../../lib/cms/flatten';

// 가짜 Docs API JSON 빌더
const run = (content, textStyle = {}) => ({ textRun: { content, textStyle } });
const paragraph = (...elements) => ({ paragraph: { elements } });
const doc = (...content) => ({ body: { content } });
const flat = (...elements) => flatten(doc(paragraph(...elements))).text;

const BOLD = { bold: true };
const ITALIC = { italic: true };
const link = (url, extra = {}) => ({ link: { url }, ...extra });

test('일반 텍스트', () => {
  assert.equal(flat(run('hero_title: Rooted in Cambodia\n')), 'hero_title: Rooted in Cambodia\n');
});

test('굵게', () => {
  assert.equal(flat(run('Rooted in '), run('Cambodia', BOLD), run('\n')), 'Rooted in **Cambodia**\n');
});

test('기울임', () => {
  assert.equal(flat(run('a '), run('word', ITALIC), run(' b\n')), 'a _word_ b\n');
});

test('링크', () => {
  assert.equal(flat(run('by '), run('SEAFN', link('https://x.org')), run('.\n')), 'by [SEAFN](https://x.org).\n');
});

test('굵게 + 링크 동시 적용 → 굵게가 바깥', () => {
  assert.equal(flat(run('SEAFN', link('https://x.org', BOLD)), run('\n')), '**[SEAFN](https://x.org)**\n');
});

test('굵게 + 기울임 동시 적용', () => {
  assert.equal(flat(run('wow', { bold: true, italic: true }), run('\n')), '**_wow_**\n');
});

test('앞뒤 공백 포함 굵게 → 공백은 기호 밖으로', () => {
  assert.equal(flat(run('Rooted in'), run(' Cambodia ', BOLD), run('now\n')), 'Rooted in **Cambodia** now\n');
});

test('공백만 있는 굵게 run 은 기호를 붙이지 않음', () => {
  assert.equal(flat(run('a'), run(' ', BOLD), run('b\n')), 'a b\n');
});

test('줄바꿈이 붙은 굵게 → 줄바꿈은 기호 밖으로', () => {
  assert.equal(flat(run('Rooted in '), run('Cambodia\n', BOLD)), 'Rooted in **Cambodia**\n');
});

test('\\u000b (Shift+Enter) → \\n', () => {
  assert.equal(flat(run('line1\u000bline2\n')), 'line1\nline2\n');
});

test('굵게 안의 \\u000b → 줄마다 따로 감쌈', () => {
  assert.equal(flat(run('a\u000bb\n', BOLD)), '**a**\n**b**\n');
});

test('연속으로 쪼개진 같은 서식 textRun → 하나로 병합', () => {
  assert.equal(flat(run('Camb', BOLD), run('odia', BOLD), run('\n')), '**Cambodia**\n');
});

test('연속으로 쪼개진 같은 링크 → 하나의 링크', () => {
  const style = link('https://x.org');
  assert.equal(flat(run('SE', style), run('AFN', style), run('\n')), '[SEAFN](https://x.org)\n');
});

test('URL 이 다른 이웃 링크는 병합하지 않음', () => {
  assert.equal(
    flat(run('A', link('https://a.org')), run('B', link('https://b.org')), run('\n')),
    '[A](https://a.org)[B](https://b.org)\n',
  );
});

test('bold: false / textStyle 없음 → 서식 없음', () => {
  assert.equal(flat(run('a', { bold: false }), { textRun: { content: 'b\n' } }), 'ab\n');
});

test('여러 문단은 순서대로 이어짐', () => {
  const { text } = flatten(doc(paragraph(run('{hero}\n')), paragraph(run('title: A\n')), paragraph(run('{}\n'))));
  assert.equal(text, '{hero}\ntitle: A\n{}\n');
});

test('표·이미지 등은 무시하고 종류별 개수를 셈', () => {
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

test('빈 문서 / body 없음', () => {
  assert.deepEqual(flatten({}), { text: '', skipped: {} });
});

// 알려진 한계: 서식이 "부분적으로" 겹치면 run 단위 렌더링으로는 깔끔하게 중첩되지 않는다.
// todo: 스타일 트리 렌더링 필요
test('부분 겹침: bold "Camb" + bold-italic "odia"', { todo: true }, () => {
  assert.equal(flat(run('Camb', BOLD), run('odia', { bold: true, italic: true }), run('\n')), '**Camb_odia_**\n');
});

// todo: 링크 단위로 먼저 묶는 처리 필요
test('부분 겹침: 링크 안 일부만 굵게', { todo: true }, () => {
  const url = 'https://x.org';
  assert.equal(flat(run('SE', link(url, BOLD)), run('AFN', link(url)), run('\n')), '[**SE**AFN](https://x.org)\n');
});
