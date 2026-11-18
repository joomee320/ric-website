// Docs API document JSON → 마크다운 섞인 평문 (ArchieML 입력용).
// 순수 함수: API 호출/파일 접근 없음.

// flatten() 이 읽는 Docs API 필드만 최소한으로 정의한다 (docs_v1.Schema$Document 의 부분집합).
interface DocsTextStyle {
  bold?: boolean | null;
  italic?: boolean | null;
  link?: { url?: string | null } | null;
}

interface DocsParagraphElement {
  textRun?: { content?: string | null; textStyle?: DocsTextStyle | null } | null;
  [key: string]: unknown;
}

interface DocsStructuralElement {
  paragraph?: { elements?: DocsParagraphElement[] | null } | null;
  [key: string]: unknown;
}

export interface DocsDocument {
  body?: { content?: DocsStructuralElement[] | null } | null;
}

export interface FlattenResult {
  text: string;
  /** 처리하지 않은 요소의 종류별 개수 (sectionBreak, table, inlineObjectElement 등) */
  skipped: Record<string, number>;
}

interface Run {
  text: string;
  bold: boolean;
  italic: boolean;
  url: string | null;
}

/**
 * @param document  documents.get 응답의 data
 */
export function flatten(document: DocsDocument | null | undefined): FlattenResult {
  const skipped: Record<string, number> = {};
  const skip = (element: object) => {
    const kind = kindOf(element);
    skipped[kind] = (skipped[kind] ?? 0) + 1;
  };

  let text = '';
  for (const element of document?.body?.content ?? []) {
    if (!element.paragraph) {
      skip(element);
      continue;
    }
    const runs: Run[] = [];
    for (const paragraphElement of element.paragraph.elements ?? []) {
      if (paragraphElement.textRun) runs.push(toRun(paragraphElement.textRun));
      else skip(paragraphElement);
    }
    text += mergeRuns(runs).map(renderRun).join('');
  }
  return { text, skipped };
}

// startIndex/endIndex 를 제외한 첫 키가 요소의 종류 (paragraph, table, inlineObjectElement ...)
function kindOf(element: object): string {
  return Object.keys(element).find((key) => !key.endsWith('Index')) ?? 'unknown';
}

function toRun(textRun: NonNullable<DocsParagraphElement['textRun']>): Run {
  const style = textRun.textStyle ?? {};
  return {
    text: (textRun.content ?? '').replace(/\u000b/g, '\n'),
    bold: Boolean(style.bold),
    italic: Boolean(style.italic),
    url: style.link?.url ?? null,
  };
}

// 서식이 완전히 같은 이웃 run 을 합친다. ("Camb" + "odia" 둘 다 bold → "Cambodia" 하나)
function mergeRuns(runs: Run[]): Run[] {
  const merged: Run[] = [];
  for (const run of runs) {
    const prev = merged.at(-1);
    if (prev && prev.bold === run.bold && prev.italic === run.italic && prev.url === run.url) {
      prev.text += run.text;
    } else {
      merged.push({ ...run });
    }
  }
  return merged;
}

// 줄바꿈과 앞뒤 공백은 서식 기호 밖에 두고, 줄마다 핵심 텍스트만 감싼다.
function renderRun({ text, bold, italic, url }: Run): string {
  if (!bold && !italic && !url) return text;
  return text
    .split('\n')
    .map((line) => {
      // 이 정규식은 모든 문자열과 매치되므로 결과는 null 이 아니다.
      const [, lead, core, trail] = line.match(/^(\s*)(.*?)(\s*)$/s)!;
      if (!core) return line;
      let wrapped = core;
      if (url) wrapped = `[${wrapped}](${url})`;
      if (italic) wrapped = `_${wrapped}_`;
      if (bold) wrapped = `**${wrapped}**`;
      return lead + wrapped + trail;
    })
    .join('\n');
}
