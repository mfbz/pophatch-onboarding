# Contributing

This repository is built by people and by coding agents working with them, with the same rules for both. Agents start from [AGENTS.md](AGENTS.md) and the skills in `.agents/skills/`.

## Setup

Node 24, then `npm ci`. That also switches on the Git hooks (below). Everything else is in [README.md](README.md).

## How work happens

1. A change to what an artist sees or does starts by agreeing its scope with the owner. Everything else goes straight to a branch.
2. Trunk-based: `main` is the only long-lived branch. One short branch per change from an up-to-date `main` (`feat/`, `fix/`, `perf/`, `docs/`, `chore/` or `ci/`), conventional commits.
3. `npm run check` must pass locally and in CI.
4. The change updates `POPHATCH.md`, `README.md`, `AGENTS.md` or a skill wherever it made one of them wrong.
5. A finished branch gets an independent review from a fresh context, then a pull request against `main` with the template filled in and a conventional-commit title. It is squash-merged by the owner; an agent never merges its own.
6. Nobody pushes to `main`.

Issues created with the "Task" form are ready for an agent to pick up.

## Guards

Every change passes the same guards, whoever writes it. They run twice:

- **On every commit.** The Git hooks in `.githooks/` are switched on by `npm install` (`core.hooksPath`). `pre-commit` checks what is staged and `commit-msg` checks the message, so nothing bad ever becomes a commit.
- **In `npm test`.** `checks/guards-repo.test.ts` runs locally and in CI on every file Git would commit, so a skipped hook is still caught.

Claude Code is denied `--no-verify`, changing `core.hooksPath`, editing `.githooks/`, pushing to `main`, force-pushing, merging a pull request, and opening `.secrets/` or any `.env` with its file tools (`.claude/settings.json`). Other agents get the same rules from AGENTS.md.

The guards:

- no keys or tokens (private keys and the usual API and token formats)
- no home folder: neither the one of the computer running the check nor any `/Users/<name>/`, `/home/<name>/` or `C:\Users\<name>\` path
- no real email address: mock data uses the reserved example domains (`example.com`, `.test`) and commits use a GitHub noreply address
- no AI tool credited as an author
- no file over 1 MB, except a short list kept on purpose (`BIG_ON_PURPOSE` in `checks/guards.ts`: the prototype export)

If a guard trips:

- **A key:** remove it. If it was ever pushed, rotate it with its provider; deleting it from Git isn't enough.
- **A path, an address or an attribution line:** fix the file, or the generator that wrote it.

## Repository settings

The repository is private, squash-merge only (the pull request title becomes the commit), and deletes a branch once it is merged. Dependabot alerts and security updates stay on.
