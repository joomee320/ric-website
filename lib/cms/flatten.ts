// Docs API document JSON → plain text with Markdown formatting (input for ArchieML).
// Pure function: no API calls, no file access.

// Minimal types for only the Docs API fields flatten() reads (a subset of docs_v1.Schema$Document).
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
  /** Count of unhandled elements by kind (sectionBreak, table, inlineObjectElement, ...) */
  skipped: Record<string, number>;
}

interface Run {
  text: string;
  bold: boolean;
  italic: boolean;
  url: string | null;
}

/**
 * @param document  the `data` of a documents.get response
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

// The first key other than startIndex/endIndex is the element kind (paragraph, table, inlineObjectElement, ...)
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

// Merge neighbouring runs with identical formatting. ("Camb" + "odia", both bold → one "Cambodia")
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

// Keep newlines and leading/trailing whitespace outside the markers; wrap only the core text of each line.
function renderRun({ text, bold, italic, url }: Run): string {
  if (!bold && !italic && !url) return text;
  return text
    .split('\n')
    .map((line) => {
      // This regex matches every string, so the result is never null.
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
