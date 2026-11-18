# RiC Website — Instructions for Claude

@AGENTS.md

## Source of truth
- docs/spec.md is the source of truth for architecture and behaviour.
- docs/content-model.md is the source of truth for Doc fields and wins over the spec for fields. The zod schema must match it.
- docs/decisions.md records later decisions; an entry wins over the part of the spec it says it replaces.
- If the code and these documents disagree, they disagree with each other, or none of them answers the question, STOP and ask. Do not guess.
- Do not edit docs/spec.md unless I explicitly ask. Record new decisions in docs/decisions.md and field changes in docs/content-model.md, and only after I agree to them.

## Current goal: CMS workflow skeleton (home page only)
Build the full Google Doc → Publish → Vercel pipeline end to end, using ONLY the home_page section. Its fields are listed in docs/content-model.md → Current Doc.

Everything in the pipeline is in scope: fetchDoc, flatten, archieml, zod, Vercel Blob snapshot, cached getContent with the cms tag, content.fallback.json, POST /api/publish with the secret, and the Apps Script "Website → Publish to website" menu with error popups.

OUT of scope for now: about_us, program_info, faq_list, itinerary, Donate, Apply, Contact, Subscribe form, Figma styling. The home page UI is a plain unstyled placeholder. Do not add these until I ask.

Done means all of these work on a Vercel preview deployment, using the content Doc (docs/decisions.md D2):
1. Edit the Doc, click Publish → popup says published → preview page shows the new text.
2. Rename a key (e.g. hero_titel) → popup lists the problem with a "did you mean" hint → page unchanged.
3. Remove :end from mission_statement → validation catches it or the dropped text is reported → page unchanged.
4. Empty Blob store → page renders from content.fallback.json.
5. Wrong publish secret → 401, page unchanged.

## Secrets
- Never read, print, cat, or log .env, .env.local, any .env* file, or any service account key file.
- I put secrets in .env.local and Vercel myself. You only need the names:
  GOOGLE_CLIENT_EMAIL, GOOGLE_PRIVATE_KEY, DOC_ID, BLOB_READ_WRITE_TOKEN, PUBLISH_SECRET
- No secret may use a NEXT_PUBLIC_ prefix.
- Modules in lib/cms/ that touch secrets or Google import 'server-only'.
- Logs contain status and message only — never key material, the secret, or full Doc content.
- Before suggesting any commit, run `git status` and confirm no secret files are staged.
- When a step needs an account action (Google Cloud, Doc sharing, Vercel, Blob, Apps Script install), STOP and give me exact instructions. Do not attempt it yourself.

## Architecture boundary
- lib/cms/ = content pipeline.
- components/ = UI (will later be implemented from Figma). Presentational only; data arrives through props.
- app/ pages = thin connectors: call getContent(), pass data as props. No layout or styling logic in page files.
- components/ must NOT import from lib/cms/, except TypeScript types from lib/cms/schema.ts.
- The SiteContent type (z.infer of the zod schema) is the contract between pipeline and UI. Do not change the schema without asking me.
- UI work must never require Google or Vercel credentials; it uses content.fallback.json.

## Environment safety
- Preview and production must not share snapshot data. Store the snapshot under a path that includes the environment (e.g. based on VERCEL_ENV), or use separate stores. Propose the approach before implementing.
- Vercel preview deployments may have Deployment Protection enabled, which blocks the Apps Script POST before it reaches /api/publish. Check current Vercel docs for the supported bypass for automation and tell me what to configure.
- Never run commands that touch production: no `vercel --prod`, no writes to the production snapshot.
- Never edit the content Doc. I make all Doc edits myself.

## Tech constraints
- Next.js 16 (App Router), TypeScript, Vercel. CMS routes run on the default Node.js runtime. Do NOT add `export const runtime = ...` (not even 'nodejs'): `cacheComponents: true` is on, and Cache Components does not support the `runtime` segment config.
- Check current docs for library APIs before using them (especially revalidateTag in Next.js 16, @vercel/blob, archieml). Do not rely on memory.
- Rich text: react-markdown, only p, strong, em, a. Links only http, https, mailto.
- No styling or UI libraries yet. Ask before adding any dependency not named in docs/spec.md.

## Commands
- `npm run dev` / `npm run build` / `npm run lint`
- `npm test`: Vitest, single run (`vitest.config.mts`, node environment, `tests/**/*.test.{js,ts}`)
- One file: `npx vitest run tests/cms/flatten.test.js`; one test: add `-t "<name>"`
- Baseline: the spike tests ported in `tests/cms/` are 32 tests: 30 pass, 2 todo (flatten 20, archieml 12). `archieml.test.js` contains learning tests that pin the archieml 0.5 behaviour the content format relies on.

## Workflow
- One step at a time. Give a short plan before each step and wait for my OK.
- Run tests before saying a step is done. Report failures honestly; never skip or weaken tests to make them pass.
- Test names reference a requirement ID or spec section where one applies (e.g. "Publish API: wrong secret returns 401").
