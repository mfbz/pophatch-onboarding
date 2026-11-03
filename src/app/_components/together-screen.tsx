"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { type ReadLine, readSources } from "@/app/_lib/mock-api";
import { useOnboarding } from "@/app/_lib/onboarding-provider";
import {
  connectedCount,
  connectedSources,
  stageProgress,
} from "@/app/_lib/onboarding-state";
import { useStepGuard } from "@/app/_lib/use-step-guard";
import { Button } from "@/components/button";
import { Input } from "@/components/input";
import { Stage } from "@/components/stage";
import { StatusDot } from "@/components/status-dot";
import { ToggleGroup, ToggleGroupItem } from "@/components/toggle-group";
import { TopBar } from "@/components/top-bar";

type Reading = { lines: ReadLine[]; done: boolean };

const GOALS = [
  "My next release landing",
  "More shows, better rooms",
  "A bigger fanbase",
  "Making money from this",
  "Getting noticed by playlists, press and bookers",
];

const GOAL_LIMIT = 140;

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

// Step 5: one question while PopHatch reads what the artist connected. Enter waits for both, and
// says which one it is waiting for.
function TogetherScreen() {
  const { state, dispatch } = useOnboarding();
  const router = useRouter();
  const allowed = useStepGuard((current) => connectedCount(current) > 0);
  const progress = stageProgress(state, "/together");
  const reading = useReading(allowed, JSON.stringify(connectedSources(state)));
  const goal = state.goal;
  const written = goal?.kind === "written" ? goal.value : "";

  const waitingFor =
    goal === null ? "Pick a goal to enter" : reading.done ? null : "Reading…";

  return (
    <Stage>
      <TopBar current={progress.current} done={progress.done} />
      {allowed && (
        <main className="grid flex-1 content-start gap-x-12 gap-y-8 pt-14 max-tablet:pt-8 tablet:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)] tablet:px-11">
          <div>
            <h1 className="font-display text-title font-bold text-fg text-halo max-tablet:text-page-title-phone">
              What would make the next three months a{" "}
              <span className="text-lime">win?</span>
            </h1>
            <ToggleGroup
              type="single"
              aria-label="Your goal"
              value={goal?.kind === "preset" ? goal.value : ""}
              onValueChange={(value) =>
                dispatch({
                  type: "goal",
                  goal: value ? { kind: "preset", value } : null,
                })
              }
              className="mt-5.5"
            >
              {GOALS.map((option) => (
                <ToggleGroupItem key={option} value={option}>
                  {option}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
            <label htmlFor="written-goal" className="sr-only">
              Or write it in
            </label>
            <Input
              id="written-goal"
              placeholder="Or write it in"
              maxLength={GOAL_LIMIT}
              value={written}
              onChange={(event) => {
                const value = event.target.value;
                dispatch({
                  type: "goal",
                  goal: value.trim() ? { kind: "written", value } : null,
                });
              }}
              aria-describedby="written-goal-count"
              className="mt-5.5"
            />
            <p
              id="written-goal-count"
              className="mt-2 pr-6 text-right text-caption text-mist text-halo"
            >
              {written.length}/{GOAL_LIMIT}
            </p>
          </div>
          <section
            aria-labelledby="reading-title"
            className="flex flex-col gap-4.5 self-start rounded-card bg-fg px-7 py-6.5 text-navy shadow-card max-tablet:px-5"
          >
            <h2
              id="reading-title"
              className="font-display text-headline font-bold"
            >
              Putting it together
            </h2>
            <ul
              aria-labelledby="reading-title"
              aria-live="polite"
              className="space-y-4.5 empty:hidden"
            >
              {reading.lines.map((line) => (
                <li
                  key={line.label}
                  className="animate-line-in motion-reduce:animate-none"
                >
                  <span className="block text-base font-bold">
                    {line.label}
                  </span>
                  <span className="block text-[14.5px] text-navy/70">
                    {line.detail}
                  </span>
                </li>
              ))}
            </ul>
            <p className="flex items-center gap-2.5 pt-3 font-bold text-klein">
              <StatusDot tone="klein" />
              {reading.done ? "Read everything you connected." : "Reading…"}
            </p>
          </section>
          <div className="flex justify-end max-tablet:mt-auto tablet:col-span-2">
            <Button
              disabled={waitingFor !== null}
              onClick={() => router.push("/welcome")}
              className="min-h-13.5 min-w-75 px-7 text-[17px] font-extrabold max-tablet:min-h-12 max-tablet:w-full max-tablet:text-base"
            >
              {waitingFor ?? "Enter"}
            </Button>
          </div>
        </main>
      )}
    </Stage>
  );
}

export { TogetherScreen };
