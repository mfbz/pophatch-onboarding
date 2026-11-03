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
  card:
    backgroundColor: "{colors.fg}"
    textColor: "{colors.navy}"
    rounded: "{rounded.card}"
---

## Overview

The PopHatch onboarding as the Stage System renders it. `docs/design/reference/stage-system.html` is where every value here comes from; this file is its digest, the one agents and reviewers build from, and it records where the onboarding departs from or extends the system (Decisions, below). Tokens are declared once in `src/app/globals.css` (Tailwind's `@theme`) and consumed by name. Components live in `src/components/`; the screens in `src/app/_components/`.

## Layout

- Every page starts with the stage: solid Klein for the first 1000px, then a gradient to Night (`bg-stage-gradient`), a patch of light, six still rings and two white circles that grow and fade. The rings sit in the top-right corner, in the bottom-right on "Connect your pages", or centered on the screen's one subject (Decisions). Nothing fades them: type over a ring stays legible through its own Klein glow (`text-halo`), and centered text gets a soft patch of Klein behind it (`bg-halo`).
- The top bar sits 52px in from the edges of the window (16px on a phone). Content keeps the prototype's insets: 110px from each edge on step 1, 96px on steps 4 and 5, centered on steps 2, 3 and the arrival.
- Three widths, the system's own: a computer from 1300px, a tablet or small laptop from 860px to 1299px, a phone under 860px. On a phone everything is one column, nothing is added and nothing is removed.
- The promises, the accounts, the reports and the reading list are white cards (`rounded-card`, `shadow-card`) with navy text, as in the prototype.
- Everything the artist can press is at least 40px tall (44px on a phone), and a phone's primary action is full width at the bottom of the screen, within thumb reach.

## Shapes

- Every button, chip and field is a pill (`rounded-pill`).
- Cards are `rounded-card` (28px), release covers `rounded-cover` (18px), the artist's photo a circle.
- The writing box is a white pill with navy text.

## Colors

- Nine colors; everything else is white at a set opacity. Body text is `text-mist` on the stage, text on lime and on white cards `text-navy`, secondary text on a card navy at 70%.
- Lime is used only for the primary button, the current step, a checked or chosen control, the dot of a working connection, and the onboarding exceptions listed under Decisions.
- Pink is a dot, never text (3.4:1 on Klein): a connection that failed, a field that needs the artist. Amber is the dot of a connection gone quiet.
- No icons: everything is a word. The only drawn marks are dots, ✓, › and ←, and the lime signal (a dot in two rings) on each promise card.

## Typography

- Familjen Grotesk (`font-display`) for headlines, numbers and titles; DM Sans (`font-sans`) for everything else, both loaded by `next/font`.
- Sizes follow the prototype: display 132px on step 1, hero 92px on "Found you", page title 74px on step 4, title 66px on step 5 and the arrival (34px on a phone), status 44px for the search line, lead 22px under each headline. Row titles 20–22px weight 600. Body 15–16px, line height 1.5. Captions 13–13.5px weight 500 in Periwinkle. Section labels 11–13px weight 600, uppercase, letter spacing .1em.
- Inputs are 17px, 16px on a phone so it never zooms in.
- Nothing is cut with three dots: text wraps. There are no tooltips; everything the artist needs is written on the screen.

## Components

- **Buttons** (`components/button.tsx`): primary is lime with navy text, 14px weight 700, 10px by 18px, and 17px weight 800 for a screen's main action; secondary has no background, white text and a 1.5px border at 70% white; link is Mist and underlined; on a white card, `ink` is Klein filled and `outline` a 2px Klein outline. On hover the lime goes to 90% and the secondary border to 100%; pressed, any button shrinks to 96%. Nothing else changes on hover.
- **Focus**: everything the artist can press is reachable with Tab in reading order and shows a 2px white outline 3px outside its edge.
- **Status dots**: 8px. Lime working, amber quiet, pink needs the artist, white at 35% not connected.
- **Something not available yet** is shown at 60% opacity, in its place, with nothing to press.
- **A field that could not be saved**: one line under it in white 13.5px with a pink dot before it, saying what happened and what to do; the field keeps what the artist typed.
- **Waiting**: nothing spins. A block shows its title and fills in as the data arrives.
- **Account cards** (`app/_components/connect-row.tsx`): five white cards in a row on a computer (three on a tablet, one per line on a phone), the platform in the tile title and the handle under it; at the bottom a Klein "Connect", then "Connecting…" while it waits, then a lime "✓ Connected" pill, or a pink dot with one line under the handle and "Try again". Something not ready yet reads "Coming soon" with nothing to press.
- **Goal pills** (`components/toggle-group.tsx`): one choice, 17px; off has a 2px border at 50% white, on is lime with navy text and a leading ✓.
- **The reading list**: a white card, each source arriving with its label and a caption; a Klein dot reads "Reading…" until the last one.
- **The arrival**: no stepper. The rings grow in around the logo while it pops in and flashes through its five other finishes, 0.3s each, and two circles burst out once; it lands on pearl (360px, 232px on a phone), then "You're in, Noor.", "Your first plan is on its way." and a lime "Start over" rise in, the last at 2.4s. Then everything stays still. Under reduced motion it all simply appears.

## Decisions

### Three onboarding-only exceptions to lime and motion

The onboarding is the artist's first impression, a stage moment rather than a product screen, so it keeps three things from the prototype that the product screens do not have: the lime last word of each headline ("business.", "you.", "pages.", "win?"), the lime ring around the artist's photo on "Found you", and the PopHatch logo cycling through its six finishes while PopHatch searches. Everything else follows the system's lime and motion rules, and all motion stops under reduced motion.

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
