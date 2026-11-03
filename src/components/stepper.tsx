import { cn } from "cn";

type FlowStage = "find" | "confirm" | "connect" | "enter";

type StepperProps = { current: FlowStage | null; done: FlowStage[] };

const STAGES: ReadonlyArray<{ id: FlowStage; label: string }> = [
  { id: "find", label: "Find you" },
  { id: "confirm", label: "Confirm" },
  { id: "connect", label: "Connect" },
  { id: "enter", label: "Enter" },
];

// Built from the Stage System's "Steps in a Plan" (DESIGN.md, Decisions): done is a white circle with
// a Klein check, current a lime circle, upcoming an outline at 50%. Progress, never buttons. On a
// phone the labels give way to one line naming the current stage. On arrival nothing is current
// and every stage is done. It sits on a pill of the stage's own Klein, invisible on the stage, so
// rings centered on a screen's subject pass behind its labels instead of through them.
function Stepper({ current, done }: StepperProps) {
  const position = STAGES.findIndex((stage) => stage.id === current) + 1;
  const currentLabel = STAGES[position - 1]?.label;

  return (
    <div className="-mr-3 flex items-center gap-3 rounded-pill bg-klein/85 px-3 py-2">
      <ol aria-label="Onboarding progress" className="flex items-center">
        {STAGES.map((stage, index) => {
          const isDone = done.includes(stage.id) && stage.id !== current;
          const isCurrent = stage.id === current;
          return (
            <li
              key={stage.id}
              aria-current={isCurrent ? "step" : undefined}
              className="flex items-center"
            >
              {index > 0 && (
                <span
                  aria-hidden
                  className="mx-1.5 h-px w-3 bg-hair tablet:mx-2.5 tablet:w-6"
                />
              )}
              <span
                aria-hidden
                className={cn(
                  "grid size-4.5 shrink-0 place-items-center rounded-pill text-label leading-none font-bold tracking-normal",
                  isDone && "bg-fg/90 text-klein",
                  isCurrent && "bg-lime text-navy",
                  !isDone && !isCurrent && "border-[1.5px] border-fg/50"
                )}
              >
                {isDone ? "✓" : isCurrent ? "•" : null}
              </span>
              <span
                className={cn(
                  "ml-2 text-caption whitespace-nowrap max-tablet:sr-only",
                  isCurrent && "font-semibold text-fg",
                  isDone && "text-fg/90",
                  !isDone && !isCurrent && "text-fg/60"
                )}
              >
                {stage.label}
                {isDone && <span className="sr-only">, done</span>}
              </span>
            </li>
          );
        })}
      </ol>
      <span
        aria-hidden
        className="text-caption font-semibold whitespace-nowrap text-fg tablet:hidden"
      >
        {currentLabel
          ? `${currentLabel} · ${position} of ${STAGES.length}`
          : "All done"}
      </span>
    </div>
  );
}

export { STAGES, Stepper };
export type { FlowStage };
