<!-- Title: a conventional commit (`feat(onboarding): …`, `fix(ui): …`). The pull request is squash-merged into main, so the title becomes its one commit there. -->

## Why

The problem this solves, for the artist or for the code. Link the issue if there is one. Closes #

## What changed

-

## Screens

Screenshots or a recording at 375 and 1440 wide, for every state the change touches (waiting, success, failure). "No UI change" otherwise.

## Evidence

How you know it works: the tests or commands you ran and their result (`npm run check`), and any manual check by name (keyboard only, reduced motion, a screen reader pass).

Independent review (fresh context, AGENTS.md): the tool, what it found, what was fixed, and what was rejected and why.

## Checklist

- [ ] `npm run check` passes
- [ ] Every behavior this change promises is proven (test, command or named manual check)
- [ ] Seen in a real browser at phone and desktop widths (UI changes)
- [ ] `POPHATCH.md` and every doc this change made wrong updated here

## Follow-ups

-
