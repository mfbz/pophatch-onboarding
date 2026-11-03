---
name: pophatch-workflow
description: "Use when starting, planning, building or finishing any change in the PopHatch onboarding repo. Covers trunk-based branches, commits, pull requests to main, CI, every command, the reference files, and keeping every doc in sync in the same change."
---

# PopHatch workflow

`POPHATCH.md` says what the onboarding is and why, with every decision and its reasoning. There are no per-feature spec documents: a change is a branch, and what it decided lands in `POPHATCH.md` in the same change.

## Steps

1. Know what done looks like before writing code: the behavior, the tests that prove it, the screens to look at, the docs it touches. A change to what an artist sees or does is a product decision: confirm the scope with the owner first, unless the task already settles it.
2. Trunk-based: `main` is the only long-lived branch and is always green. Branch from an up-to-date `main` (or a git worktree), one topic per branch: `feat/…`, `fix/…`, `perf/…`, `docs/…`, `chore/…` or `ci/…`. Conventional commits with the area as scope (`feat(onboarding): …`, `fix(ui): …`, `chore(deps): …`).
3. A plan for a bigger change is scratch in `docs/superpowers/` (gitignored); anything worth keeping goes into `POPHATCH.md` or the skill for its area.
4. Before opening the pull request: `npm run check` green; a UI change seen in a real browser at 375, 768 and 1440 wide, with screenshots in the pull request; every doc the change makes wrong is fixed (below).
5. Before opening the pull request, get an independent, adversarial review of the branch from a fresh context that didn't write it (Claude Code: `/code-review high`; `/security-review` too when the change parses input from outside or adds a dependency). Findings are claims to verify: reproduce each one before fixing it, or reject it with a reason, and record what was found, fixed and rejected in the pull request's Evidence.
6. A change reaches `main` only through a pull request whose checks pass: push the branch and open it against `main` (`gh pr create`), filling in the template, with a conventional-commit title, because it is squash-merged and the title becomes its one commit on `main`. Link the issue with `Closes #n`. **Agents never merge their own pull request.** Behind `main`? Merge `main` into the branch (no rebase of pushed work, no force-push). List follow-ups instead of widening scope.
7. Once the owner has merged it, close any issue the merge did not close, with a comment linking the pull request, and delete the local branch and worktree.

## Working from a GitHub issue

The "Task" issue form says what to do and when it is done. Work in a worktree on its own branch, open a pull request against `main`, report the link. Never push to `main`, never merge your own pull request.

## Every command

```bash
npm ci                     # install (Node 24); also switches on the Git hooks
npm run dev                # the app on localhost:3000 (Turbopack)
npm run build              # production build
npm run start              # serve the production build
npm run check              # green checkpoint: format:check, lint, typecheck, test
npm run format             # Prettier on everything
npm run lint               # ESLint, type-aware
npm run typecheck          # next typegen (route and layout types), then tsc --noEmit
npm run test               # Vitest once: the app project (jsdom) and the checks project (node)
npm run test:watch         # Vitest in watch mode
npm run reference:unpack   # decode the prototype into docs/design/reference/unpacked/ (gitignored)
```

## The reference files

Read before any structural or copy decision; when code and spec disagree, **flag it, never silently drift**.

- `POPHATCH.md` — the product spec: the flow, the backend contract, every decision with its reasoning
- `README.md` — how to run and test the repo, the layout
- `CONTRIBUTING.md` — how work happens, the guards, the repository settings
- `docs/design/reference/stage-system.html` — the design system; its tokens are used verbatim
- `docs/design/reference/onboarding-prototype.html` — the flow as first designed; read it through `npm run reference:unpack`

## Docs are part of the change, never a follow-up

`README.md`, `POPHATCH.md`, `CONTRIBUTING.md`, `AGENTS.md` and the skills in `.agents/skills/` MUST always describe what actually exists. A change that makes any of them wrong is not finished until they are corrected **in the same change**: no "update the docs later", no stale-doc TODOs.

- `POPHATCH.md` — if a decision changed, rewrite the reasoning; don't just flip the value. A reversed decision keeps its record (what was chosen, what was rejected, why). Decision records carry no dates.
- `README.md` — the newcomer's document: commands, layout, environment. A new script or folder changes it in the same pass.
- `AGENTS.md` and `.agents/skills/` — invariants, conventions and commands: the short rule in `AGENTS.md`, the detail in the skill for its area. `CLAUDE.md` only imports `AGENTS.md` and adds what is Claude Code only.

Every doc reads as the project's own: what it does and why it is built that way, never who asked for it or the conversation behind a change.

## CI

A green checkpoint = `npm run check`. CI is **one job** in `.github/workflows/ci.yml` (Node 24, one `npm ci`): the message guards on a pull request (`checks/messages.ts`), then format, lint, typecheck, test, build, each a step that runs even after an earlier one failed, so one run reports everything. It runs on every pull request and every push to `main`.
