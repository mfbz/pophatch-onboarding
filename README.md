# PopHatch onboarding

The onboarding for PopHatch, a manager for musical artists: from one pasted link to the artist's first look at the app. What it is and every decision behind it: [POPHATCH.md](POPHATCH.md).

## Running it

Node 24 (`.nvmrc`), then:

```bash
npm ci            # install; also switches on the Git hooks
npm run check     # format:check, lint, typecheck, test
```

## Commands

| Command                    | What it does                                                                                            |
| -------------------------- | ------------------------------------------------------------------------------------------------------- |
| `npm run check`            | the green checkpoint: `format:check`, `lint`, `typecheck`, `test`                                       |
| `npm run format`           | Prettier on everything                                                                                  |
| `npm run lint`             | ESLint, type-aware                                                                                      |
| `npm run typecheck`        | `tsc --noEmit`                                                                                          |
| `npm run test`             | Vitest once, including the repo guards                                                                  |
| `npm run test:watch`       | Vitest in watch mode                                                                                    |
| `npm run reference:unpack` | decode the prototype into one HTML file per screen under `docs/design/reference/unpacked/` (gitignored) |

## Layout

| Path                    | What                                                                       |
| ----------------------- | -------------------------------------------------------------------------- |
| `checks/`               | repo-invariant tests and the Git hooks' code                               |
| `scripts/`              | one-off repo scripts                                                       |
| `docs/design/reference` | the Stage System design system and the onboarding prototype                |
| `.agents/skills/`       | the skills coding agents load (Claude Code sees them in `.claude/skills/`) |
| `.githooks/`            | the guards on every commit                                                 |
| `.github/`              | CI and the pull request and issue templates                                |

## Working on it

How work happens, the guards and the repository settings: [CONTRIBUTING.md](CONTRIBUTING.md). Coding agents start from [AGENTS.md](AGENTS.md).
