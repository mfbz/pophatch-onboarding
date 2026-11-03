# PopHatch onboarding

The product spec: what the onboarding is, who it is for, the flow, and every decision with its reasoning. Decision records say what was chosen, what was rejected and why, never when. A reversed decision keeps its record, so nothing gets re-argued from a stale premise.

## What PopHatch is

A manager for musical artists. It **knows the business** (how labels, playlists, press and bookers work), **knows the artist** (their streams, fans, releases and money, read from their own accounts), and **decides what's next** (what to do this week, and whether last week's move worked).

## Who the onboarding is for

An independent or early-career musical artist signing up for the first time. They have a Spotify profile or an Instagram before they have a team; they are often on a phone; they are wary of anything that feels like admin or like a label's dashboard. The onboarding has to earn trust fast: show that PopHatch already knows who they are, then ask for as little as possible.

## The flow

Four stages, shown as a progress rail: **Find you → Confirm → Connect → Enter**.

1. **Your link.** One field: paste any link that is yours (Spotify, Instagram, TikTok, YouTube, Apple Music, SoundCloud, Linktree). "One link to start. PopHatch finds the rest." Three promises under it: knows the business, knows you, decides what's next. A secondary path connects pages one by one for an artist without a link to hand.
2. **Getting to know you.** The search, made visible: PopHatch reports each platform it finds the artist on as it finds it.
3. **Found you.** The artist's profile as PopHatch found it: name, city, artwork of recent releases, and the numbers (releases, monthly listeners, followers). Two answers: "That's me" or "Not me".
4. **Connect your pages.** The accounts found from the first link, each to connect or skip; one is enough to continue. Spotify, Apple Music and distributor reports come in as files (a cloud folder or an upload).
5. **Putting it together.** One question while PopHatch reads the connected accounts: what would make the next three months a win (a release landing, more shows, a bigger fanbase, making money, getting noticed, or the artist's own words). The reading progress runs beside it, then the artist enters the app.
6. **You're in.** The arrival, where the app would open: the PopHatch logo pops in and runs through its finishes while the rings burst out, lands on pearl, then "You're in, Noor." and "Your first plan is on its way." rise in with "Start over" to run the flow again. It celebrates once and then stays still.

## Design references

`docs/design/reference/` holds the two inputs:

- `stage-system.html`, **the Stage System**: the design system PopHatch is moving to (color, type, components, layouts, phone rules, motion, tokens).
- `onboarding-prototype.html`, **the prototype**: the five screens above at 1440×1000. It predates part of the Stage System.

Where they disagree, the Stage System sets tokens and components and the prototype sets the flow and copy. Where the build departs from either, the reason is recorded: a design departure under Decisions in `DESIGN.md`, a product one under Decisions here.

## Backend

There is no backend. A typed client in the app stands in for one: it answers the onboarding's calls (resolve a link, search platforms, connect an account, read history) from mock data, with realistic latency and the failures a real service has (an unknown link, a profile that is not the artist, a connection that is refused), so every waiting, empty and wrong state is built and visible. Mock artists are invented; their links use the real platforms' domains with invented handles, and any address uses an example domain.

## Decisions

- **Next.js 16 (App Router) with React 19, TypeScript strict and Tailwind CSS 4.** The App Router gives each step a URL, so back, reload and a shared link behave as an artist expects; static prerendering makes the first screen instant; Tailwind's theme is where the Stage System tokens live once. Rejected: a Vite single-page app (no prerendered first paint, routing assembled by hand).

- **The backend is mocked in the browser, behind the same typed contract a real API would have.** Rejected: a mock server (more moving parts, no change in what the artist sees) and hard-coded screen states (the waiting and failure states would never be exercised).

- **Flow progress lives in the browser session.** One reducer holds the flow (`src/app/_lib/onboarding-state.ts`); it is saved to `sessionStorage`, so a reload or the back button keeps the artist where they were and a new tab starts fresh. A step opened without what it needs (the search without a link, "Found you" without an artist) sends the artist back to step 1. Rejected: the URL for everything (an artist object does not belong in a link) and a state library (one reducer is enough).

- **A wrong or empty search returns to step 1 with a reason, not a dead end.** "Not me" and a link that finds no one both bring the artist back to an empty, focused field with one line saying what happened and offering the one-by-one path, so nobody loops. The reason travels in the flow state rather than the URL, so the first screen still renders on the server. A search that finds no one is shown on step 2 before it returns.

- **Screens that move on by themselves replace their own history entry.** Step 2 hands over to "Found you" with a replace, so back from "Found you" goes to step 1 and never re-runs the search.

- **The first headline greets the artist by name before PopHatch knows it.** "Noor, let's run your business." is the prototype's line and the demo is about Noor, so it stays as designed. A real sign-up would greet without a name until the link resolves; open for the next iteration.

- **Nothing starts connected, and any source counts.** Step 4 opens with no account connected, so the artist makes the connection the next step reads. An account, a folder or uploaded files each count toward "one is enough", and the button counts all of them ("Continue with 2 connected"). Uploaded files are listed by name and never read or sent. SoundCloud is shown as coming soon, with nothing to press. Facebook fails on its first try in the mock, so the failure and retry are part of the demo.

- **The one-by-one path finds the artist from the first account.** Without a link, step 4 offers every platform with no handles and no "found" wording. The first account connected is where PopHatch finds the artist, and only then does the stepper mark Find you and Confirm done.

- **Step 5 reads only what was connected, and Enter waits for both.** SoundCharts is always read (it comes from the artist's Spotify), then each connected source in turn, then the reports. Enter becomes available once a goal is picked or written and the reading is done; until then it says which one it is waiting for. One goal at a time: a picked goal clears a written one and the other way round, and a written goal stops at 140 characters.

- **The artist can go back, never skip ahead.** A done step in the stepper is a link back to its page, and the PopHatch logo returns to step 1; neither clears anything, so what was found and connected is still there. Steps ahead are not links, because each needs what the steps before it collect. On a phone the stepper shows only the current step, and the browser's back does the rest.

- **Every step has its own page title.** Next announces a client-side navigation by the page title, so each step's title ("Found you · PopHatch") is what a screen reader hears when the step changes. On step 1, after a return, focus goes to the empty link field instead.
