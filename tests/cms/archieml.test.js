// archieml 라이브러리 자체의 동작을 확인하는 "학습 테스트".
// 라이브러리 버전이 바뀌어 동작이 달라지면 여기서 먼저 깨진다.
import { test } from 'vitest';
import assert from 'node:assert/strict';
import archieml from 'archieml';

const load = (text) => archieml.load(text);

test(':end 없이 여러 문단 → 첫 문단만 남고 두 번째 문단은 조용히 버려짐', () => {
  assert.deepEqual(load('body: First paragraph.\n\nSecond paragraph.\n'), { body: 'First paragraph.' });
});

test(':end 를 쓰면 빈 줄 포함 여러 문단이 하나의 값', () => {
  assert.deepEqual(load('body: First paragraph.\n\nSecond paragraph.\n:end\n'), {
    body: 'First paragraph.\n\nSecond paragraph.',
  });
});

test('키 이름 오타(hero_titel) → 에러 없이 오타 키 그대로 생성', () => {
  const result = load('hero_titel: Rooted in Cambodia\n');
  assert.deepEqual(result, { hero_titel: 'Rooted in Cambodia' });
  assert.equal(result.hero_title, undefined);
});

test('키는 대소문자를 구분', () => {
  assert.deepEqual(load('Hero_Title: X\nhero_title: Y\n'), { Hero_Title: 'X', hero_title: 'Y' });
});

test('{name} → 객체', () => {
  assert.deepEqual(load('{hero}\ntitle: A\nsubtitle: B\n{}\n'), { hero: { title: 'A', subtitle: 'B' } });
});

test('[+name] → {type, value} 배열 (순서 보존, 자유 텍스트는 type: "text")', () => {
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

test('[faq_list] → 첫 키(question)가 다시 나올 때마다 새 객체 시작', () => {
  assert.deepEqual(load('[faq_list]\nquestion: Q1\nanswer: A1\nquestion: Q2\nanswer: A2\n[]\n'), {
    faq_list: [
      { question: 'Q1', answer: 'A1' },
      { question: 'Q2', answer: 'A2' },
    ],
  });
});

test('[faq_list] answer 누락 → 에러 없이 answer 없는 객체', () => {
  assert.deepEqual(load('[faq_list]\nquestion: Q1\nquestion: Q2\nanswer: A2\n[]\n'), {
    faq_list: [{ question: 'Q1' }, { question: 'Q2', answer: 'A2' }],
  });
});

test('[faq_list] 첫 항목 순서가 바뀌면 구분 기준 키도 바뀜', () => {
  // 첫 객체가 answer 로 시작했으므로 answer 가 구분자가 된다
  assert.deepEqual(load('[faq_list]\nanswer: A1\nquestion: Q1\nanswer: A2\n[]\n'), {
    faq_list: [{ answer: 'A1', question: 'Q1' }, { answer: 'A2' }],
  });
});

test('[tags] 문자열 배열은 "* " 접두사가 있어야 함 (Docs 자동 글머리표가 * 를 지우면 빈 배열)', () => {
  assert.deepEqual(load('[tags]\n* a\n* b\n[]\n'), { tags: ['a', 'b'] });
  assert.deepEqual(load('[tags]\na\nb\n[]\n'), { tags: [] });
});

test('⚠️ :end 블록 안에서 "단어:" 로 시작하는 줄은 새 키가 되어 본문이 잘림', () => {
  assert.deepEqual(load('body: First.\n\nNote: second.\n:end\n'), { body: 'First.', Note: 'second.' });
  // 백슬래시로 이스케이프하면 본문 유지
  assert.deepEqual(load('body: First.\n\n\\Note: second.\n:end\n'), { body: 'First.\n\nNote: second.' });
});

test('마크다운 기호는 archieml 이 건드리지 않고 문자열로 통과', () => {
  assert.deepEqual(load('t: **Rooted** in [x](https://a.b)\n'), { t: '**Rooted** in [x](https://a.b)' });
});
