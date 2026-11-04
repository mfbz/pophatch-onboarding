---
name: pophatch-ui
description: "Use when building or reviewing any PopHatch onboarding screen or component: reading the design references, tokens, type, motion, responsive and phone rules, accessibility, copy for artists, and checking the result in a real browser."
---

# PopHatch UI

The onboarding is the first thing an artist sees of PopHatch. It should feel like a product made for musicians: confident, warm, a little theatrical, never like a form or an admin panel.

## The references

- `DESIGN.md` is **the design system as the build reads it**: every token in its front matter, the rules below it, and the Decisions where the onboarding departs from or extends the system. Read it before any screen work. Its values come verbatim from `docs/design/reference/stage-system.html`; a token changes there first, then in `DESIGN.md` and `src/app/globals.css` in the same change (`checks/design-repo.test.ts` fails when the two disagree).
- A value the build needs that the system lacks is added to the theme once, named, and recorded as a Decision in `DESIGN.md`.
- `docs/design/reference/onboarding-prototype.html` is **the flow** as first designed. Read it through `npm run reference:unpack` (`docs/design/reference/unpacked/NN-*.html`, one per screen, in order). It predates part of the Stage System: where they disagree on look, the Stage System wins; on flow and copy, the prototype does, unless `POPHATCH.md` records otherwise.
- Never trace a reference pixel for pixel. Read what each screen is for, then build the best version of that for an artist on a phone and on a laptop.

## Tokens and styling

- Tokens are defined once in `src/app/globals.css` (`@theme`) and consumed by name (`bg-lime`, `text-mist`, `border-hair`, `rounded-pill`, `bg-stage-gradient`); no raw hex, no one-off font sizes, radii or shadows in components.
- Breakpoints are the system's: `tablet:` from 860px, `desktop:` from 1300px; under 860px is the phone layout.
- Type: the display face for headlines and big numbers, the body face for everything else, both loaded by the framework's font loader (no layout shift, no external request at runtime).

## Motion

- Motion carries meaning: something arriving, something found, progress being made. Transform and opacity only; nothing animates layout.
- Every animation respects `prefers-reduced-motion`: it becomes an instant change or a fade, never just a shorter version of the same movement.
- Waiting is designed, never a bare spinner: show what is happening ("Reading Instagram · 2 of 3") and what has arrived so far.

## Responsive and phone

- Phone first. Every screen is built at 375 wide and grows to 768 and 1440; nothing is a desktop layout squeezed down.
- Touch targets at least 44×44. Inputs at 16px or more so iOS doesn't zoom. Respect the safe areas (`env(safe-area-inset-*)`); the primary action sits within thumb reach on a phone.
- `dvh`, not `vh`, for full-height screens, so the browser chrome doesn't hide the action.

## Accessibility

- Semantic HTML first: one `h1` per screen, real `button`s and `a`s, labelled inputs, lists as lists.
- Keyboard: every action reachable and visible on focus (`:focus-visible` ring from the tokens); every step exports its own page `title`, which Next's route announcer reads when the step changes (`src/app/step-titles.test.ts` pins them); a screen that asks for input again moves focus to that field; otherwise focus left behind on the page Next just hid goes to the new step's heading (`components/route-focus.tsx`, mounted in the root layout), so Tab never goes nowhere, which it would in Safari; nothing is hover-only.
- Contrast meets WCAG 2.2 AA for text and controls on every background the Stage System uses.
- Async results are announced (`aria-live="polite"`) where the artist would otherwise miss them; errors say what happened and what to do next, beside the field they belong to.

## Copy

- Speak like a manager talking to an artist: short, direct, second person, their words ("your release", "your fans"), not product words ("data sources", "integrations").
- Every error says what happened and the next step. Never blame the artist.

## Done means seen

Screenshots at an exact width: `npx playwright screenshot --channel chrome --viewport-size "375, 812" http://localhost:3000 out.png` (the installed Chrome, no browser download). Plain headless Chrome's `--window-size` cannot go below about 500 wide, so its phone shots are wrong.

A screen is done when it has been opened in a real browser at 375, 768 and 1440 wide, in its waiting, success and failure states, with keyboard only and with reduced motion on, and the screenshots are in the pull request.
