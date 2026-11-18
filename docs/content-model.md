# RiC Website — Content Model

The only source of truth for the fields edited in the content Doc. For fields, this document takes precedence over `docs/spec.md`. The zod schema in `lib/cms/schema.ts` must match this file. Change the schema only together with this file, and record each change in the changelog below.

Format rules (ArchieML, `:end`, strict schema) are in `docs/spec.md` → Content model and Editor rules.

## Current Doc (in scope)

Only `home_page` is in the Doc and the schema. The schema is strict, so any other top-level section in the Doc is an "unknown key" error until it is added here.

### `home_page`

| Path | Type | Required | Shown on the page as |
| --- | --- | --- | --- |
| `home_page.hero_title` | text, one line | Yes | Large title over the hero image |
| `home_page.mission_statement` | rich text, multi-paragraph, must end with `:end`; bold, italic and links allowed. A blank line starts a new paragraph; Shift+Enter is a line break inside a paragraph (`docs/decisions.md` D7) | Yes | Body text under the "Mission" heading (two-column layout is done in the UI) |

### Content Doc setup

The content Doc must meet these requirements for Publish to read it:

- **One Doc tab only.** `fetchDoc()` reads the Doc's first tab (`body`); text in other Docs tabs is ignored.
- **Shared with the service account as Viewer.** No other access is needed; general access stays "Restricted".
- `DOC_ID` (from the Doc URL) is set in `.env.local` and in Vercel (Preview only for now, `docs/decisions.md` D8).
- Images, tables, fonts and colours in the Doc are ignored (Editor rule 4 in `docs/spec.md`).

### Doc template

Paste this into the content Doc as the starting point:

```
{home_page}
hero_title: Rooted in Cambodia
mission_statement: First paragraph.

Second paragraph.
:end
{}
```

## Page text that does not come from the Doc

These are managed in code, not in the Doc:

- Home: the "Mission" heading, the hero image, the navigation bar, Donate / Apply buttons, social icons.
- The Subscribe form is out of scope (see `docs/decisions.md`).

## Not yet defined (out of current scope)

Draft fields carried over from the original spec. They are not in the schema and must not be added to the Doc yet. Each needs confirmation before it moves into "Current Doc" (see `docs/spec.md` → Open questions).

| Path | Type | Required | Status |
| --- | --- | --- | --- |
| `about_us.story_text` | rich text, multi-paragraph | Yes | Confirmed in spec |
| `about_us.team[]` | `name`, `role`, `bio` | At least 1 | Draft |
| `program_info.eligibility` | rich text, multi-paragraph | Yes | Draft |
| `program_info.important_dates[]` | `label`, `date` (plain text, not parsed) | At least 1 | Draft |
| `faq_list[]` | `question`, `answer` (rich text) | At least 1; both keys in every item | Confirmed in spec |
| `itinerary[]` | `day`, `title`, `details` | At least 1 | Draft |

Draft Doc syntax for these sections (from the original spec):

```
{about_us}
story_text: Rooted in Cambodia began with two friends...
:end
[.team]
name: Sophy Yem
role: Co-founder
bio: ...
[]
{}

{program_info}
eligibility: Cambodian Americans ages 21-26...
:end
[.important_dates]
label: Application deadline
date: March 1, 2027
[]
{}

[faq_list]
question: Do I need a visa?
answer: Yes, you will need one.
question: When is the program?
answer: Summer 2027.
[]

[itinerary]
day: Day 1
title: Arrival in Phnom Penh
details: ...
[]
```

## Changelog

| Date | Change | Reason |
| --- | --- | --- |
| 2026-11-18 | Field list moved here from `docs/spec.md`. Scope narrowed to `home_page`. | Keep field decisions out of the spec |
| 2026-11-18 | Removed `home_page.hero_subtitle` (was required). | Not in the Home page design; an editable field that never shows on the page confuses editors |
| 2026-11-18 | Real content Doc created from the template above (`home_page` only). Added "Content Doc setup". | First real Doc; requirements found while connecting the Docs API |
| 2026-11-18 | `mission_statement`: Shift+Enter now shows as a line break (D7). No schema change. | The real Doc showed the break was lost on the page |
