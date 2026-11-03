"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

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

// Reads the connected sources once per set of sources. Each run rebuilds the list from the start,
// so a page Next shows again after hiding it (Activity) never repeats a line.
function useReading(enabled: boolean, sourcesKey: string): Reading {
  const { state } = useOnboarding();
  const [reading, setReading] = useState<Reading>({ lines: [], done: false });
  const sources = connectedSources(state);

  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;
    const lines: ReadLine[] = [];

    async function read() {
      for await (const line of readSources(sources)) {
        if (cancelled) return;
        lines.push(line);
        setReading({ lines: [...lines], done: false });
      }
      if (!cancelled) setReading({ lines: [...lines], done: true });
    }

    void read();
    return () => {
      cancelled = true;
    };
    // `sourcesKey` stands for `sources`, which is a new array on every render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, sourcesKey]);

  return reading;
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
        <main className="grid flex-1 content-start gap-x-16 gap-y-12 pt-14 max-tablet:pt-8 tablet:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]">
          <div>
            <h1 className="font-display text-page-title font-bold text-fg max-tablet:text-page-title-phone">
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
              className="mt-8"
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
              className="mt-5"
            />
            <p
              id="written-goal-count"
              className="mt-2 pr-5 text-right text-caption text-periwinkle"
            >
              {written.length}/{GOAL_LIMIT}
            </p>
          </div>
          <section
            aria-labelledby="reading-title"
            className="border-t border-hair pt-6"
          >
            <h2
              id="reading-title"
              className="font-display text-row-title font-semibold text-fg"
            >
              Putting it together
            </h2>
            <ul
              aria-labelledby="reading-title"
              aria-live="polite"
              className="mt-4 space-y-3"
            >
              {reading.lines.map((line) => (
                <li key={line.label} className="flex gap-3">
                  <span className="mt-2">
                    <StatusDot tone="lime" />
                  </span>
                  <span>
                    <span className="block font-semibold text-fg">
                      {line.label}
                    </span>
                    <span className="block text-caption text-periwinkle">
                      {line.detail}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
            <p className="mt-5 flex items-center gap-2 text-caption font-semibold text-fg">
              <StatusDot tone={reading.done ? "lime" : "muted"} />
              {reading.done ? "Read everything you connected." : "Reading…"}
            </p>
          </section>
          <div className="flex justify-end max-tablet:mt-auto tablet:col-span-2">
            <Button
              disabled={waitingFor !== null}
              onClick={() => router.push("/welcome")}
              className="min-h-12 px-9 max-tablet:w-full"
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
