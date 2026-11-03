---
name: pophatch-conventions
description: "Use when writing or reviewing code in the PopHatch onboarding repo. Covers working principles, layout, naming, file order, exports, types, validation, state, the mock client, tests and the green checkpoint."
---

# PopHatch code conventions

Binding from the first file written. UI rules are in the `pophatch-ui` skill.

## Working principles

These bias toward caution over speed. For trivial tasks, use judgment.

#### Think before coding

**Don't assume. Don't hide confusion. Surface tradeoffs.**

- State your assumptions explicitly. If uncertain, ask.
- If multiple interpretations exist, present them; don't pick silently.
- If a simpler approach exists, say so. Push back when warranted.

#### Simplicity first

**Minimum code that solves the problem. Nothing speculative.**

- No features beyond what was asked, no abstractions for single-use code, no configurability nobody asked for, no error handling for impossible scenarios.
- If you write 200 lines and it could be 50, rewrite it. Ask: "Would a senior engineer say this is overcomplicated?"

#### Surgical changes

**Touch only what you must. Clean up only your own mess.**

- Don't "improve" adjacent code, comments or formatting; match existing style.
- Notice unrelated dead code? Mention it, don't delete it. Remove the orphans your change created.

#### Goal-driven execution

**Define success criteria, then loop until verified.** "Add validation" → write tests for invalid inputs, then make them pass. "Fix the bug" → a test that reproduces it, then make it pass.

## Code

- **Always use the latest** versions and current docs for every package; verify against authoritative sources, don't trust training memory. `npm outdated` is the deliberate check.
- **Layout:** `src/`-rooted, `@/*` → `./src/*`, TypeScript strict everywhere (`noUncheckedIndexedAccess` included). No `any`; `unknown` and narrow.
- **kebab-case file and folder names**, no exceptions. Components are PascalCase with **named exports**; no default exports outside framework file conventions (`page.tsx`, `layout.tsx`).
- **No `index.ts` files, no barrel (`export *`) re-exports.** Every module has a descriptive filename and is imported directly from its source.
- **shadcn:** add a primitive with `npx shadcn@latest add <name>`; it lands flat in `src/components/` (`components.json`), and is then restyled to `DESIGN.md` with its unused variants deleted. Components import `cn` from the `cn` package. No icon library: the system has no icons.
- **Feature-based layout:** `lib/` holds only generic cross-cutting utilities; feature-specific code lives beside what uses it (`_components/`, `_lib/` next to the route). `components/` is flat and app-global.
- **Module layout:** within every file, top to bottom: `imports → types → constants → private helpers → exported functions (last)`. For `.tsx`: `imports → prop types → constants → local subcomponents → the exported component (last)`.
- **Comments explain _why_, never _what_.** Never decorative separators, JSX section comments or "end of section" markers.
- **Types follow the data.** Model states as discriminated unions (`{ status: "loading" } | { status: "found"; artist: Artist } | { status: "failed"; reason: … }`), never a bag of booleans; make impossible states unrepresentable.
- **Zod at the boundary.** Anything that comes from outside the code (a pasted link, a form, a mock response standing in for the network) is parsed once where it enters; trust the parsed type after.
- **The mock client is the backend.** Screens call it through the same async, typed functions a real API would expose; they never import mock data directly. Latency and failures live in the client, so swapping in a real API touches one module.
- **State lives as low as it can.** Local state first, lifted only when two siblings need it; the flow's progress is one reducer or state machine, not scattered flags. The URL owns what should survive a reload or a back button.

## Tests

- Vitest, co-located as `*.test.ts` / `*.test.tsx`. Components are tested through Testing Library by role and accessible name, the way an artist (or a screen reader) finds them; never by class name or test id when a role exists.
- Test behavior, not implementation: the flow's transitions, the parsing of links, the client's failure paths. A bug fix starts with the failing test.

## Scripts

One-off repo scripts are `.ts` files under `scripts/`, run with `tsx` and exposed as an `npm run` script. They are typechecked and linted like the app.

## Green checkpoint

`npm run check` = format:check + lint + typecheck + test. Run it before saying you are done, and quote its result.
