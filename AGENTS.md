# AGENTS.md — PopHatch onboarding

PopHatch is a manager for musical artists: it knows the business, reads the artist's own streams, fans, releases and money, and decides what to do next. This repository is its **onboarding**, the flow that takes an artist from one link to their first look at the app. This file is for every coding agent; keep it short and move detail into skills.

Read in this order, only as far as the task needs:

1. `POPHATCH.md`: the product spec, the flow, every decision with its reasoning (the source of truth). When code and spec disagree, flag it; never drift silently.
2. The skill for the area you touch (`.agents/skills/`, also visible to Claude Code as `.claude/skills/`).

Other reference files: `README.md` (run, test, the layout), `CONTRIBUTING.md` (how work happens, the guards), `docs/design/reference/` (the design inputs, below).

## Map

| Path                    | What                                                                                    |
| ----------------------- | --------------------------------------------------------------------------------------- |
| `src/app`               | the Next.js 16 app (App Router): the onboarding screens, layout and theme               |
| `checks`                | repo-invariant tests (guards, agent instructions, skills), the Git hooks' and CI's code |
| `scripts`               | one-off repo scripts, run with `tsx` (`unpack-reference.ts`)                            |
| `docs/design/reference` | `stage-system.html` (the design system) and `onboarding-prototype.html` (the flow mock) |
| `.agents/skills`        | the skills below                                                                        |
| `.githooks`, `.github`  | the guards on every commit; CI, the pull request and issue templates                    |

## Skills

| Skill                                                  | Use when                                                                  |
| ------------------------------------------------------ | ------------------------------------------------------------------------- |
| `pophatch-workflow`                                    | starting, planning or finishing any change: branches, PRs, CI, commands   |
| `pophatch-conventions`                                 | writing or reviewing code                                                 |
| `pophatch-ui`                                          | any screen: the design references, tokens, motion, responsive, a11y, copy |
| `vercel-react-best-practices`, `web-design-guidelines` | vendored React and interface guidelines                                   |

## Commands

```bash
npm ci                     # install (Node 24); also switches on the Git hooks
npm run dev                # the app on localhost:3000
npm run build              # production build (CI runs it too)
npm run check              # green checkpoint: format:check, lint, typecheck, test
npm run format             # Prettier (a Claude hook also formats each edited file)
npm run reference:unpack   # decode the prototype into readable screens (gitignored)
```

Every command, with what it does, is in the `pophatch-workflow` skill and `README.md`.

## Decisions that bind

- The backend is mocked in the browser behind a typed client; no server, no database, no third-party calls (`POPHATCH.md`, Backend).
- The design references are inputs, not a spec to trace: the Stage System sets tokens and components, the prototype sets the flow, and where the build departs from either the reason is a decision in `POPHATCH.md`.
- Built for artists: every screen works on a phone first, and the copy speaks like a manager, not a dashboard.
- No secrets in the repo, ever. `.secrets/` and every `.env` stay out of Git and out of agent transcripts.

## Code conventions

Details: skill `pophatch-conventions` (and `pophatch-ui` for screens).

- Next.js 16 App Router, React 19, Tailwind CSS 4, all under `src/`. TypeScript strict everywhere, ES modules, `@/*` → `./src/*`. kebab-case files and folders, named exports (default only where the framework requires it), no `index.ts`, no barrels.
- File order: imports → types → constants → private helpers → exported functions last. Comments explain why, never what.
- zod at the boundary. Tests co-located as `*.test.ts(x)` (Vitest).
- Always the latest package versions, checked against current docs, never from memory.

## Working rules for agents

- A change to what an artist sees or does is a product decision: confirm the scope with the owner before building it, unless the task already settles it. Everything else goes straight to a branch.
- Stay inside the change's scope; note anything else as a follow-up.
- Docs are part of the change, never a follow-up: `README.md`, `POPHATCH.md`, `CONTRIBUTING.md`, this file and the skills describe what exists, so fix any of them a change makes wrong in the same change.
- Docs, comments, commits and pull requests talk about the product and the code only: what it does and why it is built that way. Never about who asked for it, why the repository exists, or the conversation that produced a change. Nothing personal: no names, addresses or accounts of real people; mock data uses invented artists and example domains.
- Run `npm run check` before saying you are done, and quote its result. A UI change is also seen in a real browser, at phone and desktop widths, before it is called done.
- Don't ask before editing files, running builds, linters or tests. Do ask before anything destructive or anything that leaves this machine beyond a push to your own branch.
- Save tokens: read the files the task needs, use skills instead of re-reading the codebase, never paste large generated files.

## Git

- Trunk-based: `main` is the only long-lived branch and is always green. Every change starts on a short branch from an up-to-date `main` (`feat/…`, `fix/…`, `perf/…`, `docs/…`, `chore/…`, `ci/…`), one topic per branch, or a worktree. Conventional commits (`feat(onboarding): …`, `fix(ui): …`).
- A change reaches `main` only through a pull request whose checks pass. When `npm run check` is green and an independent review from a fresh context is done (findings reproduced, fixed or rejected with a reason, recorded in the PR's Evidence), push the branch and open the PR against `main` with the template; its title is a conventional commit, because it is squash-merged. Agents never merge their own PR.
- Behind `main`? Merge `main` into your branch (no rebase of pushed work). Never push to `main`, never force-push, never commit secrets or `.env` files.
- Never credit an AI tool as an author: no `Co-Authored-By` trailers for coding agents, no "Generated with …" lines, in commits, PRs, issues or docs.
- Guards check every commit (Git hooks from `npm install`) and every committable file (`npm test`): no keys or tokens, no home-folder paths, no real email addresses, no AI attribution, nothing over 1 MB ([CONTRIBUTING.md](CONTRIBUTING.md), "Guards"). Fix the cause; never weaken a guard, never `--no-verify`, never change `core.hooksPath`.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
