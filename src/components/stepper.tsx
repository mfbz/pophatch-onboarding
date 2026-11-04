import type { Route } from "next";
import Link from "next/link";

import { cn } from "@/lib/cn";

type FlowStage = "find" | "confirm" | "connect" | "enter";

type StepperProps = { current: FlowStage | null; done: FlowStage[] };

// Where a done stage takes the artist back to. "Find you" skips the search and returns to the link.
const STAGES: ReadonlyArray<{ id: FlowStage; label: string; href: Route }> = [
  { id: "find", label: "Find you", href: "/" },
  { id: "confirm", label: "Confirm", href: "/found" },
  { id: "connect", label: "Connect", href: "/connect" },
  { id: "enter", label: "Enter", href: "/together" },
];

const PILL =
  "inline-flex min-h-8 items-center gap-1.5 rounded-pill px-3.5 text-[13px] leading-tight font-bold whitespace-nowrap";

// The prototype's step pills (DESIGN.md, Decisions) in one glass tray, joined by lines that light
// up lime as far as the artist has come: done is white with a Klein check, current is lime,
// upcoming an outline. A done pill is a link back to its page; the current one and those ahead
// stay plain, because their pages need what the earlier steps collect. On a phone only the current
// pill shows, with its position, so the bar keeps one line.
function Stepper({ current, done }: StepperProps) {
  const position = STAGES.findIndex((stage) => stage.id === current) + 1;

  return (
    <ol
      aria-label="Onboarding progress"
      className="flex items-center rounded-pill bg-night/35 p-1.5 ring-1 ring-fg/14 backdrop-blur-md max-tablet:bg-transparent max-tablet:p-0 max-tablet:ring-0 max-tablet:backdrop-blur-none"
    >
      {STAGES.map((stage, index) => {
        const isDone = done.includes(stage.id) && stage.id !== current;
        const isCurrent = stage.id === current;
        const shownOnPhone = isCurrent;
        // A line lights up only between two stages the artist has actually reached, so the
        // one-by-one path, which skips the search, shows no progress it has not made.
        const previous = STAGES[index - 1];
        const lit =
          (isDone || isCurrent) &&
          previous !== undefined &&
          done.includes(previous.id);
        return (
          <li
            key={stage.id}
            aria-current={isCurrent ? "step" : undefined}
            className={cn(
              "flex items-center",
              !shownOnPhone && "max-tablet:hidden"
            )}
          >
            {index > 0 && (
              <span
                aria-hidden
                data-line={lit ? "lit" : "dim"}
                className="relative mx-1.5 h-0.5 w-5 overflow-hidden rounded-pill bg-fg/22 max-tablet:hidden"
              >
                {lit && (
                  <span
                    className={cn(
                      "absolute inset-0 origin-left rounded-pill bg-lime",
                      isCurrent &&
                        "animate-grow-x [animation-delay:300ms] motion-reduce:animate-none"
                    )}
                  />
                )}
              </span>
            )}
            {isDone ? (
              <Link
                href={stage.href}
                className={cn(
                  PILL,
                  "bg-fg text-klein transition-transform outline-none hover:bg-mist focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-fg focus-visible:outline-solid active:scale-96 motion-reduce:transition-none motion-reduce:active:scale-100"
                )}
              >
                <span
                  aria-hidden
                  className="grid size-4 place-items-center rounded-full bg-klein text-[9px] text-fg"
                >
                  ✓
                </span>
                {stage.label}
                <span className="sr-only">, done. Go back</span>
              </Link>
            ) : (
              <span
                className={cn(
                  PILL,
                  isCurrent && "bg-lime text-navy",
                  !isCurrent && "border-[1.5px] border-fg/40 text-fg"
                )}
              >
                {stage.label}
                {shownOnPhone && (
                  <span aria-hidden className="-ml-1.5 tablet:hidden">
                    {`\u00a0· ${position} of ${STAGES.length}`}
                  </span>
                )}
              </span>
            )}
          </li>
        );
      })}
    </ol>
  );
}

export { STAGES, Stepper };
export type { FlowStage };
