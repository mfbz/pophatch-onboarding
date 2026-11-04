"use client";

import { useRouter } from "next/navigation";
import { type FormEvent, useEffect, useId, useState } from "react";

import {
  ArtistReply,
  PopHatchMessage,
  TypingMessage,
} from "@/app/_components/chat";
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
import { useMediaQuery, useReducedMotion } from "@/lib/motion";

type Reading = { lines: ReadLine[]; done: boolean };

type Goal = OnboardingState["goal"];

type Draft = { preset: string; text: string };

type ConversationProps = { phone: boolean };

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

// How long PopHatch "types" before each message, in ms.
const TYPING = { greeting: 700, question: 800, confirmation: 900 };

const PHONE = "(max-width: 859px)";

const EMPTY_DRAFT: Draft = { preset: "", text: "" };

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

function draftOf(goal: Goal): Draft {
  if (goal === null) return EMPTY_DRAFT;
  return goal.kind === "preset"
    ? { preset: goal.value, text: "" }
    : { preset: "", text: goal.value };
}

// The thread: PopHatch greets, asks, and the answer sits right under the question. Answering
// replaces it with the artist's reply, PopHatch confirms, and the button takes the answer's place.
// A goal already in the flow state (a reload, or coming back) shows the answered thread at once.
function Conversation({ phone }: ConversationProps) {
  const { state, dispatch } = useOnboarding();
  const router = useRouter();
  const reduced = useReducedMotion();
  const sources = connectedSources(state);
  const reading = useReading(true, JSON.stringify(sources));
  const plan = readingPlan(sources);
  const goal = state.goal;
  const [asked, setAsked] = useState(() => (goal !== null ? 2 : 0));
  const [confirmed, setConfirmed] = useState(() => goal !== null);
  const [draft, setDraft] = useState<Draft>(EMPTY_DRAFT);
  const counterId = useId();
  const first = state.artist?.name.split(" ")[0] ?? "";
  const shownAsked = reduced ? 2 : asked;
  const shownConfirmed = goal !== null && (reduced || confirmed);
  const read = Math.min(reading.lines.length, plan.length);

  useEffect(() => {
    if (asked === 2) return;
    const greeting = setTimeout(() => setAsked(1), TYPING.greeting);
    const question = setTimeout(
      () => setAsked(2),
      TYPING.greeting + TYPING.question
    );
    return () => {
      clearTimeout(greeting);
      clearTimeout(question);
    };
    // Runs once: the thread plays on arrival, and a restored goal starts it at the end.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (goal === null || confirmed) return;
    const timer = setTimeout(() => setConfirmed(true), TYPING.confirmation);
    return () => clearTimeout(timer);
  }, [goal, confirmed]);

  function send(next: NonNullable<Goal>) {
    setConfirmed(false);
    dispatch({ type: "goal", goal: next });
  }

  function sendWritten(event?: FormEvent) {
    event?.preventDefault();
    const value = draft.text.trim();
    if (value) send({ kind: "written", value });
  }

  function change() {
    setDraft(draftOf(goal));
    setConfirmed(false);
    dispatch({ type: "goal", goal: null });
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
      <div className="flex min-w-0 flex-col gap-2.5">
        <div
          role="log"
          aria-label="Conversation"
          className="flex flex-col gap-2.5"
        >
          {shownAsked === 0 ? (
            <TypingMessage />
          ) : (
            <PopHatchMessage>
              Nice to meet you, {first}. I&apos;m reading everything you
              connected; it takes a moment.
            </PopHatchMessage>
          )}
          {phone && shownAsked > 0 && <div className="my-1.5">{panel}</div>}
          {shownAsked === 1 && <TypingMessage continued={!phone} />}
          {shownAsked === 2 && (
            <PopHatchMessage continued={!phone}>
              While I do: what would make the next three months a win for you?
            </PopHatchMessage>
          )}
          {goal !== null && (
            <div className="mt-2 flex flex-col items-end gap-1">
              <ArtistReply>{goal.value}</ArtistReply>
              <button
                type="button"
                onClick={change}
                className="cursor-pointer px-1 text-[13.5px] text-mist underline underline-offset-3 outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-fg focus-visible:outline-solid max-tablet:min-h-11"
              >
                Change
              </button>
            </div>
          )}
          {goal !== null && !shownConfirmed && <TypingMessage />}
          {shownConfirmed && (
            <PopHatchMessage>{confirmation(goal)}</PopHatchMessage>
          )}
        </div>

        {shownAsked === 2 && goal === null && (
          <div className="mt-1.5 ml-10 flex animate-rise flex-col gap-3 motion-reduce:animate-none max-tablet:ml-0">
            <ToggleGroup
              type="single"
              aria-label="Your goal"
              value={draft.preset}
              onValueChange={(value) => {
                const picked = value || draft.preset;
                if (picked) send({ kind: "preset", value: picked });
              }}
              className="gap-2.5"
            >
              {GOALS.map(({ value }) => (
                <ToggleGroupItem
                  key={value}
                  value={value}
                  className="min-h-11.5 px-4.5 py-2 text-base"
                >
                  {value}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
            <form
              onSubmit={sendWritten}
              className="flex max-w-140 items-center gap-2 rounded-pill bg-fg py-1.5 pr-1.5 pl-5 has-focus-visible:outline-2 has-focus-visible:outline-offset-3 has-focus-visible:outline-lime has-focus-visible:outline-solid"
            >
              <input
                aria-label="Or say it in your own words"
                aria-describedby={counterId}
                placeholder="Or say it in your own words"
                maxLength={GOAL_LIMIT}
                value={draft.text}
                onChange={(event) =>
                  setDraft({ preset: "", text: event.target.value })
                }
                onKeyDown={(event) => {
                  if (event.key === "Enter") sendWritten(event);
                }}
                className="min-h-10 min-w-0 flex-1 bg-transparent text-base text-navy outline-none placeholder:text-navy/50"
              />
              <small
                id={counterId}
                className="shrink-0 text-xs text-navy/50 tabular-nums"
              >
                {draft.text.length} / {GOAL_LIMIT}
              </small>
              <button
                type="submit"
                aria-label="Send"
                className="grid size-10.5 shrink-0 cursor-pointer place-items-center rounded-full bg-klein text-lg text-fg transition-transform active:scale-96 motion-reduce:transition-none max-tablet:size-11"
              >
                <span aria-hidden>↑</span>
              </button>
            </form>
          </div>
        )}

        {shownConfirmed && (
          <div className="mt-2.5 ml-10 flex animate-rise flex-col items-start gap-2 motion-reduce:animate-none max-tablet:ml-0 max-tablet:items-stretch">
            <Button
              disabled={!reading.done}
              onClick={() => router.push("/welcome")}
              className="relative min-h-15 min-w-80 overflow-hidden px-7 text-[18px] font-extrabold disabled:bg-fg/12 disabled:text-fg disabled:opacity-100 max-tablet:min-h-13 max-tablet:w-full max-tablet:text-base"
            >
              {!reading.done && (
                <span
                  aria-hidden
                  style={{ width: `${(read / plan.length) * 100}%` }}
                  className="absolute inset-y-0 left-0 bg-lime/35 transition-[width] duration-800 ease-stage motion-reduce:transition-none"
                />
              )}
              <span className="relative">
                {reading.done ? (
                  <>
                    Enter PopHatch<span aria-hidden> →</span>
                  </>
                ) : (
                  `Finishing the reading · ${read} of ${plan.length}`
                )}
              </span>
            </Button>
          </div>
        )}
      </div>
      {!phone && (
        <div className={cn("self-start tablet:sticky tablet:top-6")}>
          {panel}
        </div>
      )}
    </>
  );
}

// Step 5: one question, asked as a conversation, while PopHatch reads what the artist connected
// beside it. Enter waits for both.
function TogetherScreen() {
  const { state } = useOnboarding();
  const allowed = useStepGuard((current) => connectedCount(current) > 0);
  const progress = stageProgress(state, "/together");
  const phone = useMediaQuery(PHONE);

  return (
    <Stage>
      <TopBar current={progress.current} done={progress.done} />
      {allowed && (
        <main className="grid flex-1 content-start gap-14 pt-12 max-desktop:gap-10 max-tablet:pt-6 tablet:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] tablet:px-11 desktop:px-18">
          <h1 className="sr-only">
            What would make the next three months a win?
          </h1>
          <Conversation phone={phone} />
        </main>
      )}
    </Stage>
  );
}

export { TogetherScreen };
