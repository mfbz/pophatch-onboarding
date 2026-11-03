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
  page-title:
    fontFamily: Familjen Grotesk
    fontSize: 56px
    fontWeight: 700
    lineHeight: 0.95
    letterSpacing: -0.045em
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
    fontSize: 16px
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
spacing:
  page-x: 48px
  page-x-phone: 16px
  column: 1180px
  stage-y: 40px
  section-above: 52px
  section-below: 10px
  row-y: 18px
motion:
  stage-circles: 7.5s
  logo-cycle: 12s
  logo-step: 2s
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
    textColor: "{colors.periwinkle}"
  input:
    backgroundColor: "rgba(255, 255, 255, 0.08)"
    borderColor: "rgba(255, 255, 255, 0.4)"
    textColor: "{colors.fg}"
    rounded: "{rounded.pill}"
---

## Overview

The PopHatch onboarding as the Stage System renders it. `docs/design/reference/stage-system.html` is where every value here comes from; this file is its digest, the one agents and reviewers build from, and it records where the onboarding departs from or extends the system (Decisions, below). Tokens are declared once in `src/app/globals.css` (Tailwind's `@theme`) and consumed by name. Components live in `src/components/`; the screens in `src/app/_components/`.

## Layout

- Every page starts with the stage: the Klein-to-Night gradient (`bg-stage-gradient`), a patch of light, six still rings and two white circles that grow and fade, all in the top-right corner and away from the text; the rings fade out under the top bar so its labels stay legible. The gradient reaches the edges of the window.
- Content sits in one column at most 1180px wide, centered, with 48px on the left and right on a computer and 16px on a phone.
- Three widths, the system's own: a computer from 1300px, a tablet or small laptop from 860px to 1299px, a phone under 860px. On a phone everything is one column, nothing is added and nothing is removed.
- Sections, not boxes: a section is separated by a hairline (`border-hair`) above it, with no border on the sides and no background of its own. A list has a softer line (white at 20%) above each row and under the last, with 18px above and below each row.
- Everything the artist can press is at least 40px tall (44px on a phone), and a phone's primary action is full width at the bottom of the screen, within thumb reach.

## Shapes

- Every button, chip and field is a pill (`rounded-pill`).
- Images are `rounded-image` (20px), thumbnails `rounded-thumb` (12px), the conversation's bubbles `rounded-bubble` (22px).
- The only shapes with a background are the writing box and message bubbles (`bg-glass`). Nothing else is a card.

## Colors

- Nine colors; everything else is white at a set opacity. Body text is `text-mist` on the stage, secondary text and captions `text-periwinkle`, text on lime `text-navy`.
- Lime is used only for the primary button, the current step, a checked or chosen control, the dot of a working connection, and the onboarding exceptions listed under Decisions.
- Pink is a dot, never text (3.4:1 on Klein): a connection that failed, a field that needs the artist. Amber is the dot of a connection gone quiet.
- No icons: everything is a word. The only drawn marks are dots, ✓, › and ←.

## Typography

- Familjen Grotesk (`font-display`) for headlines, numbers and titles; DM Sans (`font-sans`) for everything else, both loaded by `next/font`.
- Page title 56px (34px on a phone), line height .95, letter spacing −.045em. Row titles 20–22px weight 600. Body 15–16px, line height 1.5. Captions 13–13.5px weight 500 in Periwinkle. Section labels 11–13px weight 600, uppercase, letter spacing .1em.
- Inputs are 16px so a phone never zooms in.
- Nothing is cut with three dots: text wraps. There are no tooltips; everything the artist needs is written on the screen.

## Components

- **Buttons** (`components/button.tsx`): primary is lime with navy text, 14px weight 700, 10px by 18px; secondary has no background, white text and a 1.5px border at 70% white; link is Periwinkle and underlined. On hover the lime goes to 90% and the secondary border to 100%; pressed, any button shrinks to 96%. Nothing else changes on hover.
- **Focus**: everything the artist can press is reachable with Tab in reading order and shows a 2px white outline 3px outside its edge.
- **Status dots**: 8px. Lime working, amber quiet, pink needs the artist, white at 35% not connected.
- **Something not available yet** is shown at 60% opacity, in its place, with nothing to press.
- **A field that could not be saved**: one line under it in white 13.5px with a pink dot before it, saying what happened and what to do; the field keeps what the artist typed.
- **Waiting**: nothing spins. A block shows its title and fills in as the data arrives.

## Decisions

### Sections instead of the prototype's white cards

The onboarding prototype put its promises, accounts and reading list on white cards. The Stage System's rule is "sections, not boxes", so the onboarding draws them as hairline-separated sections and rows on the stage. The flow and the copy are the prototype's.

### Three onboarding-only exceptions to lime and motion

The onboarding is the artist's first impression, a stage moment rather than a product screen, so it keeps three things from the prototype that the product screens do not have: the lime last word of each headline ("business.", "you.", "pages.", "win?"), the lime ring around the artist's photo on "Found you", and the PopHatch logo cycling through its six finishes while PopHatch searches. Everything else follows the system's lime and motion rules, and all motion stops under reduced motion.

### A stepper instead of the progress pills

The prototype's progress was four filled pills that read as four buttons. The onboarding shows a stepper built from the system's "Steps in a Plan": a done step is a white circle with a Klein ✓, the current step a lime circle with its label in weight 600, an upcoming step an outlined circle at 50% white. The steps are not buttons.

### The big logo is a traced mark

The finished logos are 200px images, too small to show large on a sharp screen. The arrival shows the flat PopHatch mark instead, traced from the app icon into `public/brand/mark.svg`, so it stays crisp at any size. The header and the search keep the finished logos at their own size.

### The first headline is set at display size

The prototype opens on a 132px headline ("Noor, let's run your business."), far above the system's 56px page title. The system already has a size that large, the stage's large number (150px), and the first screen is the stage moment the whole flow is built on, so step 1 keeps it as the `display` size: 132px at 1440 wide, scaling with the window down to 54px on a phone, line height .92, letter spacing −.05em. Every later step uses the page title.

### The rings follow the subject

On steps 1 and 4 to 6 the rings sit in the top-right corner like every stage. On "Getting to know you" and "Found you" there is one subject, the logo searching and then the artist's photo, so the rings and the two growing circles center on it, as in the prototype. Both are the same `Rings` drawing (`components/stage.tsx`). The stepper sits on a pill of the stage's own Klein, invisible on the stage, so centered rings pass behind its labels.

### Example links behind the platform names

Under the link field, the seven platform names are secondary buttons: each fills the field with an example link from that platform, so anyone trying the flow can start from any of them in one tap. The field opens with the Spotify example already in it.

### Nothing starts connected

The prototype shows two accounts already connected on "Connect your pages". The onboarding starts with none, so the artist (and anyone trying the flow) makes the connection that the next screen reads.
