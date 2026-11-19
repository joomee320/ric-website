# Rooted in Cambodia — Website

The website for Rooted in Cambodia (RiC), an experiential program for Cambodian Americans ages 21–26. Visitors learn about the program, apply and donate. RiC's program directors edit the site's text in a Google Doc and publish it with one click; no technical help needed.

## Team

| Name | Role |
| --- | --- |
| Joomee Choi | Software co-lead: CMS, tech stack, development guidelines |
| Josh Len | Software co-lead: implementation, repository workflow, code review |
| Jeffrey Pan | Prototyping and concept direction |
| Sandra Tang | Team manager and client communication |
| Skyden Tang | Software co-lead: project code, repository, prototype checks |

## Getting started

Requires [Node.js](https://nodejs.org) 22.12 or newer.

```bash
git clone https://github.com/joomee320/ric-website.git
cd ric-website
npm install
npm run dev
```

Open http://localhost:3000. No accounts or keys are needed: the site runs on the bundled sample content (`content.fallback.json`).

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Start the development server |
| `npm test` | Run the automated tests (Vitest, in `tests/`) |
| `npm run build` | Production build, including type checking |
| `npm run lint` | Lint, including the UI/content boundary rule |

## Documentation

- [`docs/architecture.md`](docs/architecture.md): architecture overview (start here)
- [`docs/spec.md`](docs/spec.md): technical spec
- [`docs/content-model.md`](docs/content-model.md): fields edited in the Google Doc
- [`docs/decisions.md`](docs/decisions.md): design decisions made after the spec
- [`docs/progress.md`](docs/progress.md): current status and next steps, including how the Google Doc connection is set up
