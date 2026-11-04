"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { type FormEvent, useEffect, useId, useState } from "react";

import { ReadingPanel } from "@/app/_components/reading-panel";
import { type ReadLine, readingPlan, readSources } from "@/app/_lib/mock-api";
import { useOnboarding } from "@/app/_lib/onboarding-provider";
import {
  connectedCount,
  connectedSources,
  type OnboardingState,
  stageProgress,
} from "@/app/_lib/onboarding-state";
import { useStepGuard } from "@/app/_lib/use-step-guard";
import { Button } from "@/components/button";
import { Stage } from "@/components/stage";
import { ToggleGroup, ToggleGroupItem } from "@/components/toggle-group";
import { TopBar } from "@/components/top-bar";
import { cn } from "@/lib/cn";
import { useMediaQuery } from "@/lib/motion";

type Reading = { lines: ReadLine[]; done: boolean };

type Goal = OnboardingState["goal"];

type AnswerProps = { phone: boolean };

// Each preset goal, and how PopHatch says it back.
const GOALS = [
  { value: "My next release landing", echo: "your next release landing" },
  { value: "More shows, better rooms", echo: "more shows, better rooms" },
  { value: "A bigger fanbase", echo: "a bigger fanbase" },
  { value: "Making money from this", echo: "making money from this" },
  {
    value: "Getting noticed by playlists, press and bookers",
    echo: "getting noticed by playlists, press and bookers",
  },
];

const GOAL_LIMIT = 140;

const PHONE = "(max-width: 859px)";

// Reads the connected sources once per set of sources. The reading lives in the flow state, so a
// finished one stays finished when Next shows this page again (Activity) and "Start over" clears it;
// a reading cut short starts over from its first line.
function useReading(enabled: boolean, sourcesKey: string): Reading {
  const { state, dispatch } = useOnboarding();
  const reading = state.reading?.sources === sourcesKey ? state.reading : null;
  const finished = reading?.done === true;
  const sources = connectedSources(state);

  useEffect(() => {
    if (!enabled || finished) return;
    let cancelled = false;
    dispatch({ type: "readingStarted", sources: sourcesKey });

    async function read() {
      for await (const line of readSources(sources)) {
        if (cancelled) return;
        dispatch({ type: "readingLine", line });
      }
      if (!cancelled) dispatch({ type: "readingDone" });
    }

    void read();
    return () => {
      cancelled = true;
    };
    // `sourcesKey` stands for `sources`, which is a new array on every render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, sourcesKey, finished, dispatch]);

  return { lines: reading?.lines ?? [], done: finished };
}

function confirmation(goal: NonNullable<Goal>): string {
  const preset =
    goal.kind === "preset"
      ? GOALS.find((option) => option.value === goal.value)
      : undefined;
  return preset
    ? `Got it: ${preset.echo}. I'll build your first plan around it.`
    : "Got it. I'll build your first plan around that.";
}

// The question and its answer, the way step 1 asks for a link: the goals as pills, one tap each,
// and a box built like the link field for the artist's own words, with its own button so it is
// clear where to type. PopHatch confirms the goal under it, and Enter waits for the reading.
function Answer({ phone }: AnswerProps) {
  const { state, dispatch } = useOnboarding();
  const router = useRouter();
  const sources = connectedSources(state);
  const reading = useReading(true, JSON.stringify(sources));
  const plan = readingPlan(sources);
  const goal = state.goal;
  const [text, setText] = useState(() =>
    goal?.kind === "written" ? goal.value : ""
  );
  const counterId = useId();
  const first = state.artist?.name.split(" ")[0] ?? "";
  const read = Math.min(reading.lines.length, plan.length);
  const typed = text.trim();
  const written = goal?.kind === "written" && goal.value === typed;

  function sendWritten(event: FormEvent) {
    event.preventDefault();
    if (!typed) return;
    setText(typed);
    dispatch({ type: "goal", goal: { kind: "written", value: typed } });
  }

  const panel = (
    <ReadingPanel
      plan={plan}
      lines={reading.lines}
      done={reading.done}
      compact={phone}
    />
  );

  return (
    <>
      <div className="flex min-w-0 flex-col">
        <h1 className="animate-rise font-display text-title font-bold text-fg text-halo motion-reduce:animate-none max-tablet:text-page-title-phone">
          What would make the next three months a{" "}
          <span className="text-lime">win?</span>
        </h1>
        <p className="mt-5 max-w-150 text-lead text-mist text-halo max-tablet:mt-3 max-tablet:text-lg">
          Nice to meet you, {first}. While I read everything you connected, tell
          me what matters most.
        </p>
        <ToggleGroup
          type="single"
          aria-label="Your goal"
          value={goal?.kind === "preset" ? goal.value : ""}
          onValueChange={(value) => {
            if (!value) return;
            setText("");
            dispatch({ type: "goal", goal: { kind: "preset", value } });
          }}
          className="mt-7 gap-2.5 max-tablet:mt-6"
        >
          {GOALS.map(({ value }, index) => (
            <ToggleGroupItem
              key={value}
              value={value}
              style={{ animationDelay: `${120 + index * 60}ms` }}
              className="animate-rise [animation-fill-mode:both] motion-reduce:animate-none max-tablet:text-base"
            >
              {value}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
        <form noValidate onSubmit={sendWritten} className="mt-5">
          <div
            className={cn(
              "flex max-w-[680px] items-center gap-3 rounded-pill bg-fg py-2 pr-2 pl-6 shadow-card transition-shadow duration-500 focus-within:outline-2 focus-within:outline-offset-3 focus-within:outline-fg focus-within:outline-solid max-tablet:pl-5",
              written &&
                "shadow-[0_0_0_6px_rgb(212_255_58/0.3),0_20px_50px_-20px_rgb(0_0_0/0.5)]"
            )}
          >
            <input
              aria-label="Or say it in your own words"
              aria-describedby={counterId}
              placeholder="Or say it in your own words"
              maxLength={GOAL_LIMIT}
              value={text}
              onChange={(event) => setText(event.target.value)}
              className="min-h-12 min-w-0 flex-1 bg-transparent text-[17px] text-navy outline-none placeholder:text-navy/50 max-tablet:text-base"
            />
            <small
              id={counterId}
              className="shrink-0 text-xs text-navy/50 tabular-nums max-tablet:hidden"
            >
              {text.length} / {GOAL_LIMIT}
            </small>
            <Button
              type="submit"
              aria-disabled={!typed || undefined}
              className="min-h-13.5 px-7 text-[17px] font-extrabold aria-disabled:cursor-default aria-disabled:opacity-50 aria-disabled:active:scale-100 max-tablet:min-h-12 max-tablet:px-5 max-tablet:text-base"
            >
              That&apos;s it
            </Button>
          </div>
        </form>
        <p
          aria-live="polite"
          className="mt-5 flex min-h-7 items-center gap-2.5 text-[17px] text-fg text-halo max-tablet:text-base"
        >
          {goal && (
            <span
              key={`${goal.kind}:${goal.value}`}
              className="flex animate-fade-in items-center gap-2.5 motion-reduce:animate-none"
            >
              <Image
                src="/brand/logo-pearl.png"
                alt=""
                width={24}
                height={24}
                className="size-6 shrink-0"
              />
              {confirmation(goal)}
            </span>
          )}
        </p>
        <div className="mt-6 max-tablet:mt-5">
          <Button
            disabled={goal === null || !reading.done}
            onClick={() => router.push("/welcome")}
            className="relative min-h-13.5 min-w-75 overflow-hidden px-7 text-[17px] font-extrabold disabled:bg-fg/12 disabled:text-fg disabled:opacity-100 max-tablet:min-h-12 max-tablet:w-full max-tablet:text-base"
          >
            {goal !== null && !reading.done && (
              <span
                aria-hidden
                style={{ width: `${(read / plan.length) * 100}%` }}
                className="absolute inset-y-0 left-0 bg-lime/35 transition-[width] duration-800 ease-stage motion-reduce:transition-none"
              />
            )}
            <span className="relative">
              {goal === null ? (
                "Pick a goal to enter"
              ) : reading.done ? (
                <>
                  Enter PopHatch<span aria-hidden> →</span>
                </>
              ) : (
                `Finishing the reading · ${read} of ${plan.length}`
              )}
            </span>
          </Button>
        </div>
        {phone && <div className="mt-6">{panel}</div>}
      </div>
      {!phone && (
        <div className="self-start tablet:sticky tablet:top-6">{panel}</div>
      )}
    </>
  );
}

// Step 5: one question while PopHatch reads what the artist connected beside it. Enter waits for
// both.
function TogetherScreen() {
  const { state } = useOnboarding();
  const allowed = useStepGuard(
    (current) => connectedCount(current) > 0 && current.artist !== null
  );
  const progress = stageProgress(state, "/together");
  const phone = useMediaQuery(PHONE);

  return (
    <Stage>
      <TopBar current={progress.current} done={progress.done} />
      {allowed && (
        <main className="grid flex-1 content-start gap-14 pt-14 max-desktop:gap-10 max-tablet:pt-8 tablet:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] tablet:px-11">
          <Answer phone={phone} />
        </main>
      )}
    </Stage>
  );
}

export { TogetherScreen };
