# PopHatch onboarding

The product spec: what the onboarding is, who it is for, the flow, and every decision with its reasoning. Decision records say what was chosen, what was rejected and why, never when. A reversed decision keeps its record, so nothing gets re-argued from a stale premise.

## What PopHatch is

A manager for musical artists. It **knows the business** (how labels, playlists, press and bookers work), **knows the artist** (their streams, fans, releases and money, read from their own accounts), and **decides what's next** (what to do this week, and whether last week's move worked).

## Who the onboarding is for

An independent or early-career musical artist signing up for the first time. They have a Spotify profile or an Instagram before they have a team; they are often on a phone; they are wary of anything that feels like admin or like a label's dashboard. The onboarding has to earn trust fast: show that PopHatch already knows who they are, then ask for as little as possible.

## The flow

Four stages, shown as a progress rail: **Find you → Confirm → Connect → Enter**.

1. **Your link.** One field: paste any link that is yours (Spotify, Instagram, TikTok, YouTube, Apple Music, SoundCloud, Linktree); the field recognises the platform and shows its mark. "One link to start. PopHatch finds the rest." Three promises under it, as pictures that play as they come into view: knows the business (a crate of records), knows you (the artist's platforms orbiting her photo), decides what's next (a plan on a timeline). A secondary path connects pages one by one for an artist without a link to hand.
2. **Getting to know you.** The search, made visible as a sonar: each platform PopHatch finds the artist on pops up round the logo with what it found there ("18.4k listeners"), then "That's all of you."
3. **Found you.** The artist as a record: her latest single as a vinyl with her photo on the label, turning inside its waveform; beside it her name, city, genres, the numbers (monthly listeners, followers, Instagram followers) counting up, and her releases with the latest marked. Two answers: "That's me" or "Not me".
4. **Connect your pages.** The accounts found from the first link, each to connect or skip; one is enough to continue. Beside them, her card fills in: "How well I know you" grows a fifth per account in that platform's colour, the line under it changes as each one connects, and each account shows what it gives PopHatch. Spotify, Apple Music and distributor reports come in as files (a cloud folder or an upload).
5. **Putting it together.** One question while PopHatch reads the connected sources beside it: "What would make the next three months a win?" The artist taps one of five goals (a release landing, more shows, a bigger fanbase, making money, getting noticed) or writes their own in a box built like step 1's link field; PopHatch confirms it under the box, and "Enter PopHatch →" opens once the reading is done.
6. **You're in.** The arrival, where the app would open: the PopHatch logo pops in and runs through its finishes while the rings burst out, lands on pearl, then "You're in, Noor." and "Your first plan is on its way." rise in, and the goal docks at the bottom as the line the first plan is built around, with "Start over" to run the flow again. It celebrates once and then stays still.

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

- **A wrong or empty search returns to step 1 with a reason, not a dead end.** "Not me" and a link that finds no one both bring the artist back to an empty, focused field with one line saying what happened and offering the one-by-one path, so nobody loops. "Not me" starts the flow over from either path, dropping any accounts already connected, since they were connected for someone else. An account that answers after the artist has left step 4 is dropped too, so it never lands in a new flow. The reason travels in the flow state rather than the URL, so the first screen still renders on the server. A search that finds no one is shown on step 2 before it returns.

- **Screens that move on by themselves replace their own history entry.** Step 2 hands over to "Found you" with a replace, so back from "Found you" goes to step 1 and never re-runs the search.

- **The first headline greets the artist by name before PopHatch knows it.** "Noor, let's run your business." is the prototype's line and the demo is about Noor, so it stays as designed. A real sign-up would greet without a name until the link resolves; open for the next iteration.

- **Nothing starts connected, and any source counts.** Step 4 opens with no account connected, so the artist makes the connection the next step reads. An account, a folder or uploaded files each count toward "one is enough", and the button counts all of them ("Continue with 2 connected"). Uploaded files are listed by name and never read or sent. SoundCloud is shown as coming soon, with nothing to press. Facebook fails on its first try in the mock, so the failure and retry are part of the demo.

- **The one-by-one path finds the artist from the first account.** Without a link, step 4 offers every platform with no handles and no "found" wording. The first account connected is where PopHatch finds the artist, and only then does the stepper mark Find you and Confirm done.

- **Step 5 reads only what was connected, and Enter waits for both.** SoundCharts is always read (it comes from the artist's Spotify), then each connected source in turn, then the reports. Until a goal is set the button reads "Pick a goal or write your own"; while the reading runs it is disabled and fills as each source is read ("Finishing the reading · 2 of 3"), then reads "Enter PopHatch →". One goal at a time, and a written goal stops at 140 characters.

- **Step 5 asks the way step 1 does.** A big question, the goals as pills and a writing box like the link field, so the artist sees at once where to answer; the reading runs beside it on a computer and under the answer on a phone, folding once done. The pills and the box are one choice with one button: a tap or a word sets the goal at once (a pick empties the box, writing clears the pick), PopHatch says it back, and the single Enter button, which the Enter key in the box also presses, is the only thing to press. Rejected: a send button of its own on the box, which made a tap and a written answer behave differently and put two buttons before the end. The goal lives in the flow state, so a reload shows it chosen. Rejected: a chat thread, which wrapped one question in messages, typing and extra panels and made the answer harder to find.

- **"How well I know you" counts accounts.** Step 4's meter starts at a fifth from Spotify (a link always leads there), and each connected account adds a fifth. A failed account is marked on its segment and its row, and the line under the meter says so until another account gets through, then goes back to the progress. Folders and files count toward Continue but not the meter, because they say nothing about the audience. On the one-by-one path it starts empty, with no name, until the first account finds the artist.

- **The arrival shows the goal the plan is built around.** The goal is the one thing the artist told PopHatch, so the arrival gives it back as the line the first plan starts from, with the cover of the latest release, and nothing invented: no numbers or recommendations PopHatch has not made yet. "Start over" lives on that card.

- **The artist can go back, never skip ahead.** A done step in the stepper is a link back to its page, and the PopHatch logo returns to step 1; neither clears anything, so what was found and connected is still there. Steps ahead are not links, because each needs what the steps before it collect. On a phone the stepper shows only the current step, and the browser's back does the rest.

- **Every step has its own page title.** Next announces a client-side navigation by the page title, so each step's title ("Found you · PopHatch") is what a screen reader hears when the step changes. On step 1, after a return, focus goes to the empty link field instead.
