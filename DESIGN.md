---
version: alpha
name: PopHatch
colors:
  klein: "#0A2EB0"
  navy: "#0A1B66"
  night: "#060C2A"
  lime: "#D4FF3A"
  pink: "#FF4FA3"
  amber: "#FFB020"
  fg: "#FFFFFF"
  mist: "#D6DEFF"
  periwinkle: "#C7D2FF"
  hair: "rgba(255, 255, 255, 0.26)"
  hair-soft: "rgba(255, 255, 255, 0.14)"
  glass: "rgba(255, 255, 255, 0.07)"
typography:
  hero:
    fontFamily: Familjen Grotesk
    fontSize: 92px
    fontWeight: 700
    lineHeight: 0.92
    letterSpacing: -0.05em
  page-title:
    fontFamily: Familjen Grotesk
    fontSize: 74px
    fontWeight: 700
    lineHeight: 0.92
    letterSpacing: -0.05em
  title:
    fontFamily: Familjen Grotesk
    fontSize: 66px
    fontWeight: 700
    lineHeight: 0.95
    letterSpacing: -0.045em
  status:
    fontFamily: Familjen Grotesk
    fontSize: 44px
    fontWeight: 700
    lineHeight: 1
    letterSpacing: -0.04em
  name:
    fontFamily: Familjen Grotesk
    fontSize: 30px
    fontWeight: 700
    letterSpacing: -0.03em
  card-title:
    fontFamily: Familjen Grotesk
    fontSize: 24px
    fontWeight: 700
    letterSpacing: -0.02em
  tile:
    fontFamily: Familjen Grotesk
    fontSize: 22px
    fontWeight: 700
    letterSpacing: -0.02em
  lead:
    fontFamily: DM Sans
    fontSize: 22px
    fontWeight: 400
    lineHeight: 1.35
  page-title-phone:
    fontFamily: Familjen Grotesk
    fontSize: 34px
    fontWeight: 700
    lineHeight: 0.95
    letterSpacing: -0.045em
  headline:
    fontFamily: Familjen Grotesk
    fontSize: 28px
    fontWeight: 700
    lineHeight: 1.02
    letterSpacing: -0.035em
  row-title:
    fontFamily: Familjen Grotesk
    fontSize: 20px
    fontWeight: 600
    letterSpacing: -0.02em
  body:
    fontFamily: DM Sans
    fontSize: 15px
    fontWeight: 400
    lineHeight: 1.5
  button:
    fontFamily: DM Sans
    fontSize: 14px
    fontWeight: 700
  input:
    fontFamily: DM Sans
    fontSize: 17px
    fontWeight: 400
  display:
    fontFamily: Familjen Grotesk
    fontSize: 132px
    fontWeight: 700
    lineHeight: 0.92
    letterSpacing: -0.05em
  wordmark:
    fontFamily: Familjen Grotesk
    fontSize: 22px
    fontWeight: 700
    letterSpacing: -0.02em
  caption:
    fontFamily: DM Sans
    fontSize: 13.5px
    fontWeight: 500
  label:
    fontFamily: DM Sans
    fontSize: 12px
    fontWeight: 600
    letterSpacing: 0.1em
  data:
    fontFamily: DM Mono
    fontSize: 11px
    fontWeight: 500
    letterSpacing: 0.04em
rounded:
  pill: 999px
  bubble: 22px
  image: 20px
  thumb: 12px
  cover: 18px
  card: 28px
spacing:
  page-x: 52px
  page-x-phone: 16px
  stage-y: 40px
  section-above: 52px
  section-below: 10px
  row-y: 18px
motion:
  stage-circles: 7.5s
  logo-cycle: 12s
  logo-step: 2s
  logo-float: 6s
  arrival: 2.4s
  goal-card: 2.6s
  record-turn: 30s
  typing: 0.7s to 0.9s
  reduced-motion: none
components:
  button-primary:
    backgroundColor: "{colors.lime}"
    textColor: "{colors.navy}"
    rounded: "{rounded.pill}"
  button-secondary:
    borderColor: "rgba(255, 255, 255, 0.7)"
    textColor: "{colors.fg}"
    rounded: "{rounded.pill}"
  button-link:
    textColor: "{colors.mist}"
  input:
    backgroundColor: "{colors.fg}"
    textColor: "{colors.navy}"
    rounded: "{rounded.pill}"
  glass-card:
    backgroundColor: "rgba(6, 12, 42, 0.35)"
    textColor: "{colors.fg}"
    rounded: "{rounded.card}"
  bubble:
    backgroundColor: "#2944BB"
    textColor: "{colors.fg}"
    rounded: "22px 22px 22px 6px"
  reply:
    backgroundColor: "{colors.lime}"
    textColor: "{colors.navy}"
    rounded: "22px 22px 6px 22px"
---

## Overview

The PopHatch onboarding as the Stage System renders it. `docs/design/reference/stage-system.html` is where every value here comes from; this file is its digest, the one agents and reviewers build from, and it records where the onboarding departs from or extends the system (Decisions, below). Tokens are declared once in `src/app/globals.css` (Tailwind's `@theme`) and consumed by name. Components live in `src/components/`; the screens in `src/app/_components/`.

## Layout

- Every page starts with the stage: solid Klein for the first 1000px, then a gradient to Night (`bg-stage-gradient`), a patch of light, six still rings and two white circles that grow and fade. The rings sit in the top-right corner, in the bottom-right on "Connect your pages", or centered on the screen's one subject (Decisions). Nothing fades them: type over a ring stays legible through its own Klein glow (`text-halo`), and centered text gets a soft patch of Klein behind it (`bg-halo`).
- The top bar sits 52px in from the edges of the window (16px on a phone). Content keeps the prototype's insets: 110px from each edge on step 1, 96px on steps 4 and 5, centered on steps 2, 3 and the arrival.
- Three widths, the system's own: a computer from 1300px, a tablet or small laptop from 860px to 1299px, a phone under 860px. On a phone everything is one column, nothing is added and nothing is removed.
- Nothing on the stage is a white card: surfaces are dark glass (Night at 35–94%, a 1px hairline at 10–14% white, `rounded-card`) with white text, so the artist's photo, covers and platform colours carry the colour (Decisions). White stays for fields and the writing box.
- Everything the artist can press is at least 40px tall (44px on a phone), and a phone's primary action is full width at the bottom of the screen, within thumb reach.

## Shapes

- Every button, chip and field is a pill (`rounded-pill`).
- Cards are `rounded-card` (28px), release covers `rounded-cover` (18px), the artist's photo a circle.
- The writing box is a white pill with navy text.

## Colors

- Nine colors; everything else is white at a set opacity. Body text is `text-mist` on the stage, text on lime and on white cards `text-navy`, secondary text on a card navy at 70%.
- Lime is used only for the primary button, the current step, a checked or chosen control, the dot of a working connection, and the onboarding's exceptions listed under Decisions.
- Pink is a dot, never text (3.4:1 on Klein): a connection that failed, a field that needs the artist. Amber is the dot of a connection gone quiet.
- The artist's platforms bring their own marks (`components/platform-mark.tsx`, round tiles in each brand's colour, paths from Simple Icons, CC0, vendored in `components/brand-paths.ts`). Nothing else is an icon: every action is a word, and the only other drawn marks are dots, ✓, ↑, →, › and ←.
- Each platform's own colour appears only where that platform is: its tile, its meter segment on "Connect your pages".

## Typography

- Familjen Grotesk (`font-display`) for headlines, numbers and titles; DM Sans (`font-sans`) for everything else; DM Mono (`font-mono`, `data`) for data read from a platform (a follower count, a kicker such as "What PopHatch knows", the record's label). All three are loaded by `next/font`.
- Sizes follow the prototype: display 132px on step 1, hero 92px on "Found you", page title 74px on step 4, title 66px on the arrival (34px on a phone), messages 18px (16px on a phone), status 44px for the search line, lead 22px under each headline. Row titles 20–22px weight 600. Body 15–16px, line height 1.5. Captions 13–13.5px weight 500 in Periwinkle. Section labels 11–13px weight 600, uppercase, letter spacing .1em.
- Inputs are 17px, 16px on a phone so it never zooms in.
- Nothing is cut with three dots: text wraps. There are no tooltips; everything the artist needs is written on the screen.

## Components

- **Buttons** (`components/button.tsx`): primary is lime with navy text, 14px weight 700, 10px by 18px, and 17px weight 800 for a screen's main action; secondary has no background, white text and a 1.5px border at 70% white; link is Mist and underlined; on a white card, `ink` is Klein filled and `outline` a 2px Klein outline. On hover the lime goes to 90% and the secondary border to 100%; pressed, any button shrinks to 96%. Nothing else changes on hover.
- **Focus**: everything the artist can press is reachable with Tab in reading order and shows a 2px white outline 3px outside its edge.
- **Status dots**: 8px. Lime working, amber quiet, pink needs the artist, white at 35% not connected.
- **Something not available yet** is shown at 60% opacity, in its place, with nothing to press.
- **A field that could not be saved**: one line under it in white 13.5px with a pink dot before it, saying what happened and what to do; the field keeps what the artist typed.
- **Waiting** says what is happening and what has arrived so far ("Reading Instagram · 2 of 3"). The one spinner is the 16px ring on the row being read; under reduced motion it is a still lime ring.
- **Platform marks** (`components/platform-mark.tsx`): a round tile in the platform's colour with its white glyph (Google Drive blue on white, SoundCharts navy bars on lime, uploaded files a Klein arrow on white). Muted (40%, greyscale) until the platform is connected or found.
- **The record** (`components/vinyl.tsx`): an amber vinyl with fine grooves and four track gaps, a navy label printed "NOOR ADEYEMI · LANTERN · SIDE A · 33⅓ RPM" in lime DM Mono round the artist's photo, which stays upright while the disc turns once every 30s. On "Found you" it sits in the waveform ring of her latest single (`components/bar-ring.tsx`, 200 bars in amber, pink and lime) and bleeds off the left edge on a computer; on a phone it sits whole above the profile.
- **Waveforms** (`components/waveform.tsx`): seeded bars, 4px wide with 2px gaps, that grow from the baseline one after another when they come into view. They draw the plan's timeline on step 1.
- **Account rows** (`app/_components/connect-row.tsx`): glass pills, one per line, with the platform's 44px mark, the name (17px) and the handle; the state pill on the right reads "Connect" (white, Klein text), "Connecting…", a lime "✓ Connected" or "Try again" with a pink dot and one line under the handle. On a phone the numbers read from a connected account replace the handle. Something not ready reads "Coming soon" in a dashed pill, with nothing to press.
- **File chips**: Google Drive, OneDrive and "Upload reports" as glass pills with their marks; a connected folder turns lime-tinted with a ✓.
- **The knowledge card** (`app/_components/knowledge-card.tsx`): the artist's photo as a Klein duotone hero (luminosity blend) with name, city, listeners and genres; the meter "How well I know you", one segment per platform filling in its colour over .9s with its mark under it and the percent counting up; a line in the manager's voice; and a row per account gaining its numbers and "Gives me …" once connected. On a phone it shrinks to a header (photo, name, percent, segments, line) above the accounts.
- **Messages** (`app/_components/chat.tsx`): PopHatch's bubbles in a lighter Klein (`#2944BB`, the `bubble` theme colour, kept to messages and outside the palette) with the pearl logo as a 30px avatar, three typing dots before each (700–900ms); the artist's reply in lime on the right with a "Change" link under it.
- **Goal pills** (`components/toggle-group.tsx`): one choice; off has a 2px border at 50% white, on is lime with navy text and a leading ✓. In the conversation a pill sends at once.
- **The writing box**: a white pill, "Or say it in your own words", a "0 / 140" count and a 42px Klein send button (↑); Enter sends.
- **The reading panel** (`app/_components/reading-panel.tsx`): "Putting it together", a live line ("Reading Instagram · 2 of 3", then "Read everything you connected."), one bar segment per source (lime read, white at 50% reading, at 16% waiting) and a row per source going Waiting → spinner → "✓ Read". On a phone it is a block the size of a message under the first message, with the stacked marks and a thin lime progress line, that folds to "Read 3 sources" 1.2s after the last one and opens on a tap.
- **The arrival**: no stepper. The rings grow in around the logo while it pops in and flashes through its five other finishes, 0.3s each, and two circles burst out once; it lands on pearl (360px, 232px on a phone), then "You're in, Noor." and "Your first plan is on its way." rise in, and at 2.6s the goal card docks at the bottom like a now-playing bar: the latest cover, "Your goal · next three months", the goal as the line PopHatch plans around, "Your first plan is built around it." and a lime "Start over". Then everything stays still. Under reduced motion it all simply appears.

## Decisions

### The onboarding's exceptions to lime and motion

The onboarding is the artist's first impression, a stage moment rather than a product screen, so it keeps things the product screens do not have: the lime last word of each headline ("business.", "you.", "pages.", "Noor."), lime on what is the artist's (the record's printed label, the ring round her photo and latest cover, her reply in the conversation, the numbers read from her accounts), lime for what is done (a ✓ Read, a filled meter segment, the progress line), and the PopHatch logo cycling through its six finishes while PopHatch searches. Everything else follows the system's lime and motion rules, and all motion stops under reduced motion.

### The progress pills go back, never ahead

The top bar keeps the prototype's four pills: done is white with a Klein ✓, current is lime, upcoming a 50% outline. A done pill is a link back to its page (Find you → the link, Confirm → "Found you", Connect, Enter → the goal); the current pill and those ahead are plain, because their pages need what the earlier steps collect. On a phone only the current pill shows, with its position ("Confirm · 2 of 4"). The PopHatch logo at top left links back to step 1 and clears nothing.

### The logos lose their haze

The six finished logos came with a faint square of glow around the shape, which showed as a box on the stage. The copies in `public/brand/` have that near-transparent haze removed, so each logo floats on its own.

### The first headline is set at display size

The prototype opens on a 132px headline ("Noor, let's run your business."), far above the system's 56px page title. The system already has a size that large, the stage's large number (150px), and the first screen is the stage moment the whole flow is built on, so step 1 keeps it as the `display` size: 132px at 1440 wide, scaling with the window down to 54px on a phone, line height .92, letter spacing −.05em. Later steps use the prototype's own sizes (Typography).

### The rings follow the subject

On steps 1 and 5 the rings sit in the top-right corner, on step 4 in the bottom-right, as in the prototype. On "Getting to know you" and "Found you" there is one subject, the logo or the artist's photo, so the rings and the two growing circles center on it, with a clear disc behind the subject (`Rings`' `hole`, `components/stage.tsx`) in place of the prototype's solid Klein disc, so it holds on any background.

### Example links behind the platform names

Under the link field, the seven platform names are filled chips (white at 12%): each fills the field with an example link from that platform, so anyone trying the flow can start from any of them in one tap. The field opens with the Spotify example already in it.

### Nothing starts connected

The prototype shows two accounts already connected on "Connect your pages". The onboarding starts with none, so the artist (and anyone trying the flow) makes the connection that the next screen reads.

### Platforms bring their own marks

The system has no icons, and every action is still a word. The artist's platforms are the exception: an artist recognises Spotify or TikTok by its mark faster than by its name, and the mark says "this is your account there" in a way a word cannot. So platform marks appear wherever a platform does (the link field, the search, the accounts, the meter, the reading panel), always with the name beside them except in the stacked marks of the phone's reading block. The paths are Simple Icons' (CC0), copied into the code so nothing loads from a third party.

### Glass instead of white cards

The prototype's white cards turned every step into a form. On the stage the onboarding uses dark glass with white text instead, so the artist's photo, covers and platform colours are the brightest things on screen. The system's white survives where the artist types (fields and the writing box) and in the state pills.

### The record

"Found you" shows the artist as a record rather than a profile photo: her latest single as an amber vinyl with her photo on the label, turning slowly inside that single's waveform. It is the most musical way to say "this is you", and it sits within the palette (amber is the system's own). The photo does not turn, so her face stays upright. A whole record beside the profile is the recorded alternative.

### The meter measures accounts

"How well I know you" fills a fifth per platform: Spotify once the artist is known (a link always leads to it, and SoundCharts reads from it), then each connected account. Folders and files are read on the next step but do not move the meter, because they say nothing about the artist's audience. On the one-by-one path nothing came from Spotify, so the meter starts at 0% with no photo or name until the first account finds the artist.

### Motion reports progress or marks an arrival

Every animation either says something is happening (the search tiles, typing dots, the reading spinner, the meter filling) or marks a moment arriving (the promises as they come into view, the record dropping in, the arrival). Each plays once except the record's slow turn and the logo's cycle while searching. Under reduced motion every one of them shows its end state.
