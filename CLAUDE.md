# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Commands

- `npm run dev`: dev server on http://localhost:3000
- `npm run build`: production build (also runs type-checking)
- `npm run start`: serve the production build
- `npm run lint`: ESLint (flat config with `eslint-config-next` core-web-vitals + typescript)

No test framework is set up yet. Testing guides for this Next.js version are in `node_modules/next/dist/docs/01-app/02-guides/testing/`.

## Stack

Next.js 16.4.5 (App Router only, no `pages/`), React 19.3, TypeScript (strict), Tailwind CSS v4. The project is still the unmodified `create-next-app` template; `app/page.tsx` and the metadata in `app/layout.tsx` are placeholders.

## Things that differ from older Next.js

Read the bundled docs in `node_modules/next/dist/docs/` before relying on memory. Settings in `next.config.ts` that change how code must be written:

- **`cacheComponents: true`**: caching uses the Cache Components model (`"use cache"` directive and related APIs), not the old `fetch` cache / `revalidate` segment config. See `01-app/01-getting-started/08-caching.md`. Ignore `caching-without-cache-components.md`, which describes the old model.
- **`partialPrefetching: true`**: a `<Link>` prefetches one shared App Shell per route. Use `<Link prefetch={true}>` only when URL-dependent content should also be prefetched. See `01-app/02-guides/adopting-partial-prefetching.md`.
- **Turbopack** handles CSS through the `@tailwindcss/turbopack` loader configured in `next.config.ts`. There is no `postcss.config` or `tailwind.config` file.
- Layout/page props use the global generated types (for example, `LayoutProps<"/">` in `app/layout.tsx`). These are generated into `.next/types` by `next dev` or `next build`.

## Styling

Tailwind v4 is configured CSS-first in `app/globals.css`: `@import "tailwindcss"` plus an `@theme inline` block that maps the CSS variables (`--background`, `--foreground`, Geist font variables) to Tailwind tokens. Add theme tokens there, not in a JS config. Dark mode follows `prefers-color-scheme`.

The Geist fonts are loaded with `next/font/google` in `app/layout.tsx` and exposed as CSS variables. The import alias `@/*` maps to the repo root.
