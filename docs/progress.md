# RiC Website — Progress

Where the CMS skeleton stands, so work can resume without re-reading the history. Last updated 2026-11-18.

Goal and "Done" criteria: `CLAUDE.md` → Current goal. Architecture: `docs/spec.md`. Fields: `docs/content-model.md`. Decisions after the spec: `docs/decisions.md`.

## Steps

The order changed on 2026-11-18: Google access was moved before the snapshot/cache step so the pipeline could be checked against real Docs API JSON first.

| # | Step | Status | Commit |
| --- | --- | --- | --- |
| 0 | Port spike (`flatten`, archieml learning tests), Vitest, docs setup | Done | `9493029`, `7a43224` |
| 1 | Schema: strict zod schema, editor messages, missing-`:end` check (D1) | Done | `94350d7` |
| 2 | `loadContent()`: fetch → flatten → archieml → validate, never throws | Done | `94350d7` |
| 3 | Page: `content.fallback.json`, `getContent()` (fallback only), `RichText`, `HomePage` | Done | `94350d7` |
| A | Google Cloud service account, real content Doc shared with it | Done (by people) | — |
| B | `fetchDoc()` with `@googleapis/docs` (D6) | Done | `bddc42f` |
| C | Real Doc fetched once into `tests/fixtures/real-doc.json` | Done | `bddc42f`, `d972a0c` |
| D | Pipeline checked against the real fixture; Shift+Enter fix (D7) | Done | `d972a0c`, `009ba74` |
| — | Vercel project, `production` branch, Preview env vars (D8) | Done (by people) | — |
| — | Architecture overview (`docs/architecture.md`), site map and remaining decisions (D9–D12), documented stubs for every planned module | Done | this commit |
| 4 | Snapshot in Vercel Blob (per environment, D3) + cached `getContent()` with the `cms` tag | **Next**: propose the storage approach first, after checking `@vercel/blob` and Next.js 16 cache docs | — |
| 5 | `POST /api/publish` (secret, 200/401/422/502/500, `revalidateTag('cms', { expire: 0 })`) | Not started | — |
| 6 | Apps Script menu and popups (`apps-script/Code.gs`, D4); Deployment Protection bypass | Not started | — |
| 7 | Run the five "Done" checks on a Preview deployment | Not started | — |

Tests: 99 (97 pass, 2 todo; the 2 todo are known `flatten()` limits for overlapping styles).

After the CMS skeleton (steps 4–7), the remaining pages are built from their stubs (D9, D12) and the Figma design is applied (D11). Search the code for `TODO(` to list the planned work.

## Current state of accounts and services

| Service | State |
| --- | --- |
| GitHub | `joomee320/ric-website` (private). `main` = development. `production` = what Vercel serves as Production; still at `2a60692` (template page). |
| Google Cloud | Project with the Docs API enabled and a service account (no project roles). Key values are in `.env.local` and Vercel only; the key file is not in the repo. |
| Content Doc | Real Doc, `home_page` only, one tab, shared with the service account as Viewer. Contains bold, italic and a Shift+Enter break; no link yet. |
| Vercel | Project imported. Production tracks `production`; `main` pushes are Preview. Google env vars on Preview only. Deployment Protection: default. **No Blob store yet** (created in step 4). |

## Code map

The spec's code layout table (`docs/spec.md` → Architecture and data flow) plus files it does not list:

| Path | Role |
| --- | --- |
| `lib/cms/flatten.ts` | Docs JSON → Markdown-flavoured text |
| `lib/cms/schema.ts` | zod schema, `SiteContent` type, editor messages (`MESSAGES`, draft wording), `checkContent()` |
| `lib/cms/droppedText.ts` | D1: finds Doc lines archieml dropped (not in the spec table) |
| `lib/cms/loadContent.ts` | Publish pipeline; `fetchDoc` is passed in |
| `lib/cms/google.ts` | `fetchDoc()`, `server-only` |
| `lib/cms/getContent.ts` | Page read; returns the fallback until step 4 |
| `components/RichText.tsx`, `components/HomePage.tsx` | Unstyled UI; data via props only |
| `content.fallback.json` | Placeholder text for now (see Follow-ups) |
| `types/archieml.d.ts` | Types for archieml (it ships none) |
| `scripts/fetch-doc-fixture.mjs` | Re-fetch the real Doc into the fixture (not in the spec table) |
| `eslint.config.mjs` | Lint rule: `components/` may only `import type` from `lib/cms/schema` |
| `lib/site.ts` | Navigation, contact details and embed URLs kept in code (D9, D10) |
| Stubs (D12) | `lib/cms/snapshot.ts`, `app/api/publish/route.ts` (501), `apps-script/Code.gs`, routes `/about` `/itinerary` `/photo-archive` `/faq` `/contact` `/donate` `/apply` with their components, `SiteHeader`, `SiteFooter`, `EmbedFrame`, `StubNotice` |

Full overview with a component diagram: `docs/architecture.md`.

Re-fetch the fixture after changing the Doc (needs `.env.local`):

```
node --conditions=react-server scripts/fetch-doc-fixture.mjs
```

Review `tests/fixtures/real-doc.json` before committing it: it contains the Doc's text.

## Follow-ups

- **Preview page check:** open the latest Preview deployment (Vercel → Deployments) and confirm the title, "Mission" heading and fallback text show. Previews need a Vercel login, so this is checked by a person.
- **Links and smart quotes in real JSON:** not yet in the real Doc. Add a link (and an apostrophe such as "Cambodia's") to the Doc, re-fetch the fixture, and extend `tests/cms/realDoc.test.ts`.
- **Fallback content:** replace `content.fallback.json` with the first successfully published content (agreed 2026-11-18).
- **Editor message wording:** still draft; to be written with Jeff and checked with Sophy and Navin (`docs/spec.md` → Open questions). All wording is in `MESSAGES` in `lib/cms/schema.ts`.
- **Template leftovers:** `public/*.svg` and the layout's metadata `description` are from create-next-app; left as is on purpose.
