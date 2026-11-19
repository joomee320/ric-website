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

## D7. Show Shift+Enter line breaks on the page (2026-11-18)

**Decision:** A single line break inside a rich text field (Shift+Enter in the Doc) is rendered as `<br>`. A blank line (Enter twice) still starts a new paragraph. The rich text renderer allows `br` in addition to `p`, `strong`, `em`, `a`. Implemented in `components/RichText.tsx` without new dependencies.

**Why:** Checked against the real Doc (tests/fixtures/real-doc.json): an editor's Shift+Enter arrives as a newline, but Markdown treats a single newline as a space, so the break the editor typed disappeared on the page.

**Replaces:** `docs/spec.md` → Tech stack, "Rich text rendering … only `p`, `strong`, `em`, `a` allowed" (now also `br`).

## D8. Vercel: `production` branch for Production, everything else is Preview (2026-11-18)

**Decision:**
- The Vercel project tracks the `production` branch for Production. Pushes to `main` (and any other branch) create Preview deployments only.
- Launch, later, means updating `production` from `main`; no Vercel setting changes.
- Google env vars (`GOOGLE_CLIENT_EMAIL`, `GOOGLE_PRIVATE_KEY`, `DOC_ID`) are set for **Preview only** (all non-production branches), not Production or Development. Local development uses `.env.local`.
- Deployment Protection stays at the default (Vercel Authentication on previews) until the Apps Script step.

**Why:** Day-to-day work is pushed to `main`, and production must not be touched before launch (CLAUDE.md → Environment safety). A real `production` branch was used instead of a non-existent branch name because Vercel only accepts a branch it has already deployed, and it makes launch a plain merge.

**Notes:**
- Vercel always deploys a new project's first import to Production. That one deployment (`2a60692`, the create-next-app template) is what the production URL shows until launch.
- Verified after pushing `009ba74` to `main`: the production URL still served the template, so the push went to Preview.

## D9. Site map: one route per menu item; Program Info on the Apply page (2026-11-18)

**Decision:** The site has one App Router route per item in the design's navigation:

| Route | Content | Source |
| --- | --- | --- |
| `/` | Home: hero title, mission | Doc `home_page` |
| `/about` | Story and team | Doc `about_us`; team photos in code |
| `/itinerary` | Day-by-day itinerary | Doc `itinerary` |
| `/photo-archive` | Photo gallery | Images in code (`public/`), not in the Doc |
| `/faq` | Questions and answers | Doc `faq_list` |
| `/contact` | Contact details | Code (D10) |
| `/donate` | Givebutter donation widget | Embed, hardcoded |
| `/apply` | Program Info (eligibility, important dates), then the Google Form | Doc `program_info` + embed |

Program Info has no menu item in the design, so it is shown at the top of `/apply`, where applicants need it. Donate and Apply each get their own page with the embed; if an embed fails to load, the page shows a plain link to the Givebutter / Google Forms page (`docs/spec.md` → Error handling).

**Why:** Matches the Home page design's navigation. Photo archive is not in the spec; it is added as a code-managed gallery so it needs no Doc fields and no new services.

**Scope:** Only `/` is built now. The other routes exist as stubs (D12) until their sections are added to `docs/content-model.md`.

## D10. Contact page is static (2026-11-18)

**Decision:** `/contact` shows an email address (`mailto:` link) and social links, defined in code (`lib/site.ts`). No contact form.

**Why:** A form would need an email-sending service and an API route: a new backend dependency for little gain. The text can move into a Doc section later if editors need to change it.

## D11. Styling: Tailwind CSS v4 with design tokens from Figma (2026-11-18)

**Decision:** The Figma design will be implemented with Tailwind CSS v4, which the project already has (CSS-first config, no `tailwind.config` file). Figma colours, fonts and spacing become `@theme` tokens in `app/globals.css`; components use Tailwind classes. Layout uses Flexbox and containers that grow with the text (`docs/spec.md` → Tech stack).

**Why:** Already installed and configured with Turbopack, so no new dependency. Tokens in one file keep the Figma values in one place.

**Scope:** Styling starts when the Figma work starts. Until then, pages stay unstyled (CLAUDE.md → Current goal).

## D12. Images live in the repo; planned modules exist as documented stubs (2026-11-18)

**Decision:**
- Images (hero, team photos, photo archive) are files in `public/`, shown with `next/image`. They are not edited from the Doc (`docs/spec.md` → Out of scope).
- Every planned module that is not built yet exists as a stub: the file, its exported names, a doc comment saying what it will do, and `TODO` notes. Stubs contain no working logic. Stub pages render a short "not built yet" placeholder; the stub Publish route answers `501 Not Implemented`.

**Why:** The course's architecture assignment asks for the planned structure to exist in the repository. Stubs make the architecture visible and reviewable while keeping the build passing.

**Rule:** A stub is not permission to implement it. Implementation follows the step order in `docs/progress.md` and needs the user's OK (CLAUDE.md → Workflow).

## D13. Rendering: server-rendered pages, client code only where needed (2026-11-19)

**Decision:** Pages are React Server Components, pre-rendered and cached (Cache Components). The site is a set of separate pages linked with Next.js `<Link>`, not a single-page app with its own client-side state. Only two pieces run code in the browser (`'use client'`):

- `EmbedFrame`: the load timeout that swaps a failed Givebutter / Google Forms embed for a plain link.
- `NavLinks`: the current-page highlight and the mobile menu toggle.

**Why:** The site is mostly reading. Pre-rendered HTML loads fast on phones and works without JavaScript for the main content. Little client state means little that can break. `<Link>` still gives fast page changes through prefetching.

## D14. Component structure: folders by role, one component per Figma section (2026-11-19)

**Decision:** `components/` is split by role:

| Folder | Holds | Examples |
| --- | --- | --- |
| `layout/` | Parts shared by every page, rendered by `app/layout.tsx` | `SiteHeader`, `NavLinks`, `SiteFooter`, `SocialLinks` |
| `pages/` | One component per route; composes sections | `HomePage`, `ApplyPage` |
| `home/` (later `about/`, `faq/`, …) | Sections of one page, one per Figma section | `Hero`, `MissionSection`, `CtaRow` |
| `ui/` | Small reusable pieces | `RichText`, `ButtonLink`, `EmbedFrame`, `StubNotice` |

Only the Home page is split into sections now, because it is the only page with a Figma frame. Other pages get their section components when their designs exist; until then they are listed as "planned" in `docs/architecture.md`.

**Why:** A Figma frame maps to one file, so design and code can be compared side by side. Shared pieces live in one place. The import boundary (CLAUDE.md, lint rule) applies to all of `components/`.
