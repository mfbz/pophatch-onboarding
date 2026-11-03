# PopHatch onboarding

The onboarding for PopHatch, a manager for musical artists: from one pasted link to the artist's first look at the app. What it is and every decision behind it: [POPHATCH.md](POPHATCH.md).

## Running it

Node 24 (`.nvmrc`), then:

```bash
npm ci            # install; also switches on the Git hooks
npm run dev       # the app on localhost:3000
npm run check     # format:check, lint, typecheck, test
```

The stack: Next.js 16 (App Router, Cache Components), React 19, TypeScript, Tailwind CSS 4, Vitest with Testing Library.

## Try it

Run `npm run dev` and open `http://localhost:3000`. The field opens with a Spotify link for the demo artist, Noor Adeyemi; any of the seven platform names under it fills in an example from that platform. Every valid link finds Noor. The other paths:

- `https://open.spotify.com/artist/not-found` finds no one, and the flow returns to step 1 with a line saying so.
- Typing something that is not a link (a name, for example) shows the field's error line.
- "Not me" on "Found you" returns to step 1 with an empty field.
- "No link? Connect your pages one by one" skips to step 4 with nothing found; the first account connected finds Noor.
- On step 4, Facebook fails on the first try and connects on the second.
- "Start over" on the last screen clears everything.

Progress is kept for the browser tab, so a reload stays on the same step; a new tab starts fresh.

## Commands

| Command                    | What it does                                                                                            |
| -------------------------- | ------------------------------------------------------------------------------------------------------- |
| `npm run dev`              | the app on localhost:3000 (Turbopack)                                                                   |
| `npm run build`            | the production build                                                                                    |
| `npm run start`            | serve the production build                                                                              |
| `npm run check`            | the green checkpoint: `format:check`, `lint`, `typecheck`, `test`                                       |
| `npm run format`           | Prettier on everything                                                                                  |
| `npm run lint`             | ESLint, type-aware                                                                                      |
| `npm run typecheck`        | `next typegen`, then `tsc --noEmit`                                                                     |
| `npm run test`             | Vitest once, including the repo guards                                                                  |
| `npm run test:watch`       | Vitest in watch mode                                                                                    |
| `npm run reference:unpack` | decode the prototype into one HTML file per screen under `docs/design/reference/unpacked/` (gitignored) |

## Layout

| Path                    | What                                                                       |
| ----------------------- | -------------------------------------------------------------------------- |
| `src/app/`              | the app: layout, theme (`globals.css`), the onboarding screens             |
| `src/components/`       | app-wide components: the restyled shadcn ones, the stage, the top bar      |
| `public/`               | the brand logos, the demo artist's photo and covers                        |
| `DESIGN.md`             | the design system as the build reads it: tokens, rules and its Decisions   |
| `checks/`               | repo-invariant tests and the Git hooks' code                               |
| `scripts/`              | one-off repo scripts                                                       |
| `docs/design/reference` | the Stage System design system and the onboarding prototype                |
| `.agents/skills/`       | the skills coding agents load (Claude Code sees them in `.claude/skills/`) |
| `.githooks/`            | the guards on every commit                                                 |
| `.github/`              | CI and the pull request and issue templates                                |

## Working on it

How work happens, the guards and the repository settings: [CONTRIBUTING.md](CONTRIBUTING.md). Coding agents start from [AGENTS.md](AGENTS.md).
