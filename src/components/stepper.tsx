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
  "inline-flex items-center rounded-pill px-3.5 py-[7px] text-caption leading-tight font-bold whitespace-nowrap";

// The prototype's step pills (DESIGN.md, Decisions): done is white with a Klein check, current is
// lime, upcoming an outline at 50%. A done pill is a link back to its page; the current one and
// those ahead stay plain, because their pages need what the earlier steps collect. On a phone
// only the current pill shows, with its position, so the bar keeps one line.
function Stepper({ current, done }: StepperProps) {
  const position = STAGES.findIndex((stage) => stage.id === current) + 1;

  return (
    <ol aria-label="Onboarding progress" className="flex items-center gap-1.5">
      {STAGES.map((stage) => {
        const isDone = done.includes(stage.id) && stage.id !== current;
        const isCurrent = stage.id === current;
        const shownOnPhone = isCurrent;
        return (
          <li
            key={stage.id}
            aria-current={isCurrent ? "step" : undefined}
            className={cn("flex", !shownOnPhone && "max-tablet:hidden")}
          >
            {isDone ? (
              <Link
                href={stage.href}
                className={cn(
                  PILL,
                  "bg-fg text-klein transition-transform outline-none hover:bg-mist focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-fg focus-visible:outline-solid active:scale-96 motion-reduce:transition-none motion-reduce:active:scale-100"
                )}
              >
                <span aria-hidden>✓&nbsp;</span>
                {stage.label}
                <span className="sr-only">, done. Go back</span>
              </Link>
            ) : (
              <span
                className={cn(
                  PILL,
                  isCurrent && "bg-lime text-navy",
                  !isCurrent && "border-[1.5px] border-fg/50 text-fg text-halo"
                )}
              >
                {stage.label}
                {shownOnPhone && (
                  <span aria-hidden className="tablet:hidden">
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
