@AGENTS.md

## Claude Code only

- Skills live in `.agents/skills/` and appear here through the `.claude/skills` symlink.
- A PostToolUse hook runs Prettier on every file you edit (`.claude/hooks/format-edited-file.mjs`).
- `.claude/settings.json` denies skipping the Git hooks, changing `core.hooksPath`, editing `.githooks/`, the guards' code or the settings file, pushing to `main`, force-pushing, merging a pull request, `git --no-index`, and opening `.secrets/` or a `.env` with the Read tool. A shell command is not fully covered: never print either.
- Plans are scratch in `docs/superpowers/` (gitignored); what lasts goes into `POPHATCH.md` or a skill.
- Prefer Read/Edit/Grep over shell `cat`/`sed`/`grep`.
- To see a screen of the prototype, run `npm run reference:unpack` and read `docs/design/reference/unpacked/NN-*.html`; never read `onboarding-prototype.html` itself (3 MB of base64).
