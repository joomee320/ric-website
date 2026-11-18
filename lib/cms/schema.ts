// The content schema: the contract between the CMS pipeline and the UI.
// Fields must match docs/content-model.md. Do not change them without updating
// that file (and its changelog) first.
//
// Also turns validation problems into plain-English messages for editors.
// UI code may import the SiteContent type from this file, nothing else.

import { z } from 'zod';
import { findDroppedLines } from './droppedText';

const requiredText = () => z.string().trim().min(1);
const oneLine = () =>
  requiredText().refine((value) => !value.includes('\n'), { message: 'one_line' });

export const SiteContentSchema = z.strictObject({
  home_page: z.strictObject({
    hero_title: oneLine(),
    mission_statement: requiredText(), // Markdown: bold, italic, links
  }),
});

export type SiteContent = z.infer<typeof SiteContentSchema>;

export type CheckResult =
  | { ok: true; content: SiteContent }
  | { ok: false; issues: string[] };

// ---------------------------------------------------------------------------
// Editor-facing messages. DRAFT wording: the final text is an open question in
// docs/spec.md (to be written with Jeff and checked with Sophy and Navin).
// Every message an editor can see is defined here and nowhere else.
// ---------------------------------------------------------------------------

const SECTION_LABELS: Record<string, string> = {
  home_page: 'Home page',
};

const FIELD_LABELS: Record<string, string> = {
  'home_page.hero_title': 'Home page title',
  'home_page.mission_statement': 'Home page mission statement',
};

/** Max dropped lines listed one by one; the rest are summarised in one message. */
const MAX_DROPPED_LINES_LISTED = 3;
/** Long Doc lines are shortened in messages. */
const MAX_EXCERPT_LENGTH = 60;

export const MESSAGES = {
  sectionMissing: (section: string) =>
    `The ${section} section is missing. Add a line {${section}} before its fields and a line {} after them.`,
  sectionWrongShape: (section: string) =>
    `${section} must be a section: a line {${section}}, then its fields, then a line {}.`,
  unknownSection: (name: string, suggestion: string | null, allowed: string[]) =>
    suggestion
      ? `Unknown section "${name}". Did you mean ${suggestion}?`
      : `Unknown section "${name}". Only these sections can be in the Doc right now: ${allowed.join(', ')}.`,
  keyOutsideSection: (key: string, section: string) =>
    `${key} must be inside the ${section} section: put it between the lines {${section}} and {}.`,
  fieldMissing: (label: string, key: string) =>
    `${label} is missing. Check that the line starts with ${key}:`,
  fieldNotText: (label: string, key: string) =>
    `${label} must be text. Check the line that starts with ${key}:`,
  fieldEmpty: (label: string, key: string) => `${label} is empty. Add text after ${key}:`,
  fieldOneLine: (label: string, key: string) =>
    `${label} must be a single line. Remove the extra lines after ${key}: and the :end line.`,
  unknownKey: (name: string, section: string, suggestion: string | null, allowed: string[]) =>
    suggestion
      ? `${name}: did you mean ${suggestion}? (${section} section)`
      : `Unknown key "${name}" in the ${section} section. Allowed keys: ${allowed.join(', ')}.`,
  droppedText: (section: string, excerpt: string) =>
    `Some text in the ${section} section was not saved: "${excerpt}". If it belongs to a field with more than one paragraph, put :end on its own line after that field's last paragraph.`,
  droppedTextMore: (count: number) =>
    `${count} more line${count === 1 ? ' was' : 's were'} not saved for the same reason.`,
  unexpected: (path: string, detail: string) => `Problem at ${path}: ${detail}`,
};

// ---------------------------------------------------------------------------

/**
 * Validates parsed ArchieML against the schema and checks that no Doc text was
 * dropped during parsing (docs/decisions.md D1). Never throws on bad content.
 *
 * @param parsed     what archieml.load() returned
 * @param sourceText the text that was given to archieml.load()
 */
export function checkContent(parsed: unknown, sourceText: string): CheckResult {
  const result = SiteContentSchema.safeParse(parsed);
  const issues = result.success ? [] : schemaIssues(result.error.issues, parsed);
  issues.push(...droppedTextIssues(sourceText, parsed));

  if (result.success && issues.length === 0) return { ok: true, content: result.data };
  return { ok: false, issues };
}

function schemaIssues(zodIssues: z.core.$ZodIssue[], input: unknown): string[] {
  // A misspelled key shows up twice: as an unknown key and as a missing required
  // key. Report it once, as "did you mean", and drop the matching "missing".
  const explainedByTypo = new Set<string>();
  for (const issue of zodIssues) {
    if (issue.code !== 'unrecognized_keys') continue;
    const allowed = allowedKeysAt(issue.path);
    for (const key of issue.keys) {
      const suggestion = closestKey(key, allowed);
      if (suggestion) explainedByTypo.add(pathKey([...issue.path, suggestion]));
    }
  }

  const messages: string[] = [];
  for (const issue of zodIssues) {
    if (issue.code === 'unrecognized_keys') {
      messages.push(...issue.keys.map((key) => unknownKeyMessage(key, issue.path)));
      continue;
    }
    if (explainedByTypo.has(pathKey(issue.path))) continue;
    messages.push(fieldMessage(issue, input));
  }
  return messages;
}

function unknownKeyMessage(key: string, path: PropertyKey[]): string {
  const allowed = allowedKeysAt(path);
  const suggestion = closestKey(key, allowed);
  if (path.length === 0) {
    // A field written at the top level, e.g. the {home_page} line was deleted.
    const owner = allowed.find((section) => allowedKeysAt([section]).includes(key));
    if (owner) return MESSAGES.keyOutsideSection(key, owner);
    return MESSAGES.unknownSection(key, suggestion, allowed);
  }
  return MESSAGES.unknownKey(key, sectionLabel(path[0]), suggestion, allowed);
}

function fieldMessage(issue: z.core.$ZodIssue, input: unknown): string {
  const { path } = issue;
  const key = String(path.at(-1));
  const missing = valueAt(input, path) === undefined;

  if (path.length === 1) {
    const section = String(path[0]);
    return missing ? MESSAGES.sectionMissing(section) : MESSAGES.sectionWrongShape(section);
  }

  const label = FIELD_LABELS[pathKey(path)];
  if (path.length === 2 && label) {
    if (issue.code === 'invalid_type') {
      return missing ? MESSAGES.fieldMissing(label, key) : MESSAGES.fieldNotText(label, key);
    }
    if (issue.code === 'too_small') return MESSAGES.fieldEmpty(label, key);
    if (issue.code === 'custom' && issue.message === 'one_line') return MESSAGES.fieldOneLine(label, key);
  }
  return MESSAGES.unexpected(pathKey(path) || '(top level)', issue.message);
}

function droppedTextIssues(sourceText: string, parsed: unknown): string[] {
  const dropped = findDroppedLines(sourceText, parsed);
  const messages = dropped
    .slice(0, MAX_DROPPED_LINES_LISTED)
    .map((line) => MESSAGES.droppedText(sectionLabel(line.section), excerpt(line.text)));
  const rest = dropped.length - MAX_DROPPED_LINES_LISTED;
  if (rest > 0) messages.push(MESSAGES.droppedTextMore(rest));
  return messages;
}

// --- helpers ---------------------------------------------------------------

function sectionLabel(section: PropertyKey): string {
  return SECTION_LABELS[String(section)] ?? String(section);
}

function pathKey(path: PropertyKey[]): string {
  return path.map(String).join('.');
}

function excerpt(text: string): string {
  return text.length > MAX_EXCERPT_LENGTH ? `${text.slice(0, MAX_EXCERPT_LENGTH - 1)}…` : text;
}

function valueAt(input: unknown, path: PropertyKey[]): unknown {
  let current = input;
  for (const segment of path) {
    if (!current || typeof current !== 'object') return undefined;
    current = (current as Record<PropertyKey, unknown>)[segment];
  }
  return current;
}

// Keys the schema allows in the object at `path`.
function allowedKeysAt(path: PropertyKey[]): string[] {
  let schema: z.ZodType = SiteContentSchema;
  for (const segment of path) {
    if (!(schema instanceof z.ZodObject)) return [];
    schema = schema.shape[String(segment)];
  }
  return schema instanceof z.ZodObject ? Object.keys(schema.shape) : [];
}

// The allowed key a typo most likely meant, or null if none is close.
// Case-only differences (Hero_title) always match; otherwise up to 2 edits.
function closestKey(key: string, allowed: string[]): string | null {
  const sameIgnoringCase = allowed.find((candidate) => candidate.toLowerCase() === key.toLowerCase());
  if (sameIgnoringCase) return sameIgnoringCase;

  let best: string | null = null;
  let bestDistance = 3;
  for (const candidate of allowed) {
    const distance = editDistance(key.toLowerCase(), candidate.toLowerCase());
    if (distance < bestDistance) {
      best = candidate;
      bestDistance = distance;
    }
  }
  return best;
}

// Damerau-Levenshtein distance (optimal string alignment), so a swap of two
// neighbouring letters (titel → title) counts as one edit.
function editDistance(a: string, b: string): number {
  const d: number[][] = Array.from({ length: a.length + 1 }, (_, i) =>
    Array.from({ length: b.length + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0)),
  );
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + cost);
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) {
        d[i][j] = Math.min(d[i][j], d[i - 2][j - 2] + 1);
      }
    }
  }
  return d[a.length][b.length];
}
