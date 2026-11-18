# RiC Website — Decisions

Decisions made after `docs/spec.md` was written, excluding field changes (those are in `docs/content-model.md`). If an entry says it replaces part of the spec, the entry wins. Newest entries go at the bottom. To change a decision, add a new entry that replaces the old one; do not rewrite history.

## D1. Detecting a missing `:end` (2026-11-18)

**Decision:** After parsing, compare the flattened Doc text with the parsed values. Any non-empty text line inside the content that does not appear in a parsed value is reported as a problem ("text was dropped, check for a missing `:end`"), and Publish fails.

**Why:** Without `:end`, archieml silently drops every paragraph after the first (`tests/cms/archieml.test.js`). The first paragraph is still non-empty, so zod alone cannot see the loss.

**Replaces:** `docs/spec.md` → Error handling, the row "missing `:end` that drops text … detected by zod".

## D2. Use the real content Doc from the start (2026-11-18)

**Decision:** No test copy. The real content Doc is created now and contains only `home_page`. The schema stays strict. Claude never edits the Doc; the project owner does all Doc edits.

**Why:** The real Doc does not exist yet and nobody else edits it, so a copy adds nothing.

**Replaces:** "using a COPY of the content Doc" in the original goal.

## D3. Snapshots are separated by environment (2026-11-18)

**Decision:** The snapshot path includes the environment (`production`, `preview`, `development`). Local runs (no `VERCEL_ENV`) write to `development`, so local Publish tests never touch preview or production data. `BLOB_READ_WRITE_TOKEN` may therefore live in `.env.local` as well as in Vercel. Exact path format is finalised in the snapshot step.

**Why:** Local Publish testing is wanted, and preview and production must not share data.

**Replaces:** `docs/spec.md` → Security and secrets, "`BLOB_READ_WRITE_TOKEN` … Vercel env only".

## D4. Apps Script source lives in git and is pasted into the Doc (2026-11-18)

**Decision:** `apps-script/Code.gs` in this repo is the source. It is installed by pasting it into the Doc's Extensions → Apps Script editor. `PUBLISH_URL` and `PUBLISH_SECRET` go in Script Properties, never in the code. No clasp.

**Why:** One small file that rarely changes; clasp adds a login, a tool and config for little gain. The script only sends the request and shows popups, so an outdated copy cannot publish bad content. Re-paste whenever the request format changes.

## D5. Subscribe form is out of scope (2026-11-18)

**Decision:** The "Subscribe to get the latest news" form in the Home design is not built now.

**Why:** Not in the spec, and it needs an email service (a new backend dependency).

## D6. Use `@googleapis/docs` instead of `googleapis` (2026-11-18)

**Decision:** The Docs API client is `@googleapis/docs` (official, Docs API only). Its `auth.JWT` is used for the service account, so `google-auth-library` is not a direct dependency. `flatten()` uses the official `docs_v1.Schema$Document` type from this package.

**Why:** `googleapis` bundles every Google API; the Docs-only package has the same client API and keeps the install and the Vercel function small.

**Replaces:** `docs/spec.md` → Tech stack, "Google Docs API v1 via `googleapis`".
