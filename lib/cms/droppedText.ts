// Finds text that is in the Doc but missing from the parsed ArchieML result
// (docs/decisions.md D1). The usual cause is a multi-paragraph field without
// `:end`: archieml keeps the first paragraph and silently drops the rest, and the
// remaining value is still non-empty, so the zod schema cannot see the loss.
//
// Pure function: no I/O.

export interface DroppedLine {
  /** Top-level section the line was in, e.g. "home_page". */
  section: string;
  /** The line as it appears in the Doc text, trimmed. */
  text: string;
}

// These patterns mirror the ones in archieml 0.5 (node_modules/archieml/archieml.js),
// so a line is classified the same way the parser classifies it.
// A key is any run of characters except whitespace and [ \ ] { } :
const KEY_LINE = /^\s*[^\s[\\\]{}:]+[ \t\r]*:[ \t\r]*(.*)$/;
const COMMAND_LINE = /^\s*:[ \t\r]*(endskip|ignore|skip|end)/i;
const SCOPE_LINE = /^\s*[[{][ \t\r]*([+.]*)[ \t\r]*([^\s[\\\]{}:]*)[ \t\r]*[\]}]/;
const ARRAY_ELEMENT_LINE = /^\s*\*[ \t\r]*(.*)$/;

/**
 * @param sourceText the text that was given to archieml.load()
 * @param parsed     what archieml.load() returned for that text
 */
export function findDroppedLines(sourceText: string, parsed: unknown): DroppedLine[] {
  const kept = new Set<string>();
  collectValueLines(parsed, kept);

  const dropped: DroppedLine[] = [];
  // Open scopes. Text outside every scope (e.g. editor instructions above the
  // first section) is ignored by archieml on purpose, so it is not checked.
  let scopes: string[] = [];
  let skipping = false;

  for (const rawLine of sourceText.split('\n')) {
    const command = rawLine.match(COMMAND_LINE)?.[1]?.toLowerCase();
    if (command === 'ignore') break; // archieml stops reading here
    if (command === 'skip') skipping = true;
    if (command === 'endskip') skipping = false;
    if (command || skipping) continue;

    const scope = rawLine.match(SCOPE_LINE);
    if (scope) {
      const [, flags, name] = scope;
      if (!name) scopes.pop(); // {} or [] closes the current scope
      else if (flags.includes('.')) scopes.push(name); // {.name} nests
      else scopes = [name]; // {name} starts a new top-level section
      continue;
    }
    if (scopes.length === 0) continue;

    const candidate = valueTextOf(rawLine);
    if (!candidate) continue;
    if (!kept.has(candidate)) dropped.push({ section: scopes[0], text: rawLine.trim() });
  }
  return dropped;
}

// The text a line contributes to a parsed value, trimmed; '' if none.
function valueTextOf(line: string): string {
  const key = line.match(KEY_LINE);
  if (key) return key[1].trim();
  const element = line.match(ARRAY_ELEMENT_LINE);
  if (element) return element[1].trim();
  // archieml removes one leading backslash (the escape for lines like "\Note: ...").
  return line.trim().replace(/^\\/, '').trim();
}

// Adds every trimmed line of every string value in `value` to `out`.
// Known gap: a dropped line whose text also appears elsewhere in a kept value is
// not reported. Acceptable, since the duplicate text still reaches the page.
function collectValueLines(value: unknown, out: Set<string>): void {
  if (typeof value === 'string') {
    for (const line of value.split('\n')) {
      const trimmed = line.trim();
      if (trimmed) out.add(trimmed);
    }
  } else if (Array.isArray(value)) {
    for (const item of value) collectValueLines(item, out);
  } else if (value && typeof value === 'object') {
    for (const item of Object.values(value)) collectValueLines(item, out);
  }
}
