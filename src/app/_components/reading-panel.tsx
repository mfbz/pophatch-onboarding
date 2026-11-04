"use client";

import Image from "next/image";
import { useEffect, useId, useState } from "react";

import type { ReadLine, ReadingStep } from "@/app/_lib/mock-api";
import { PlatformMark } from "@/components/platform-mark";
import { cn } from "@/lib/cn";

type ReadingPanelProps = {
  plan: ReadingStep[];
  lines: ReadLine[];
  done: boolean;
  compact: boolean;
};

type RowState = "read" | "reading" | "waiting";

// How long the finished block on a phone stays open before it folds.
const FOLD_AFTER = 1200;

function Spinner() {
  return (
    <span
      aria-hidden
      className="inline-block size-4 shrink-0 animate-spin rounded-full border-2 border-fg/25 border-t-lime motion-reduce:animate-none motion-reduce:border-lime"
    />
  );
}

function rowState(index: number, read: number, done: boolean): RowState {
  if (index < read) return "read";
  return index === read && !done ? "reading" : "waiting";
}

function Rows({ plan, lines, done }: Omit<ReadingPanelProps, "compact">) {
  return (
    <ul aria-label="Sources" className="mt-2">
      {plan.map((step, index) => {
        const state = rowState(index, lines.length, done);
        return (
          <li
            key={step.name}
            data-state={state}
            className={cn(
              "flex items-center gap-3.5 border-b border-fg/10 py-3.25 transition-opacity duration-400 last:border-b-0 max-tablet:gap-3 max-tablet:py-2.5",
              state === "waiting" && "opacity-45"
            )}
          >
            <PlatformMark
              mark={step.mark}
              size={40}
              className="max-tablet:size-8!"
            />
            <div className="min-w-0 flex-1">
              <b className="block text-base leading-tight font-semibold text-fg max-tablet:text-[15px]">
                {step.name}
              </b>
              {lines[index] && (
                <span className="block animate-fade-in text-sm text-periwinkle motion-reduce:animate-none max-tablet:text-[13px]">
                  {lines[index].detail}
                </span>
              )}
            </div>
            <span className="shrink-0 text-[13px] font-semibold">
              {state === "read" ? (
                <span className="animate-pop text-lime motion-reduce:animate-none">
                  ✓ Read
                </span>
              ) : state === "reading" ? (
                <span className="flex items-center gap-2 text-periwinkle">
                  <Spinner />
                  <span className="sr-only">Reading</span>
                </span>
              ) : (
                <span className="text-periwinkle">Waiting</span>
              )}
            </span>
          </li>
        );
      })}
    </ul>
  );
}

// Step 5's panel: what PopHatch reads, one row per source, while the artist answers. Beside the
// conversation on a computer; on a phone, a block the size of a message that folds once done.
function ReadingPanel({ plan, lines, done, compact }: ReadingPanelProps) {
  const total = plan.length;
  const read = Math.min(lines.length, total);
  const current = plan[read];
  const live =
    done || !current
      ? "Read everything you connected."
      : `Reading ${current.name} · ${read + 1} of ${total}`;
  const titleId = useId();
  const rowsId = useId();
  const [open, setOpen] = useState(!done);
  const [wasDone, setWasDone] = useState(done);

  // A new reading opens the block again, even if the artist or the timer folded the last one.
  if (wasDone !== done) {
    setWasDone(done);
    if (!done) setOpen(true);
  }

  useEffect(() => {
    if (!done) return;
    const timer = setTimeout(() => setOpen(false), FOLD_AFTER);
    return () => clearTimeout(timer);
  }, [done]);

  const segments = (
    <div aria-hidden className="flex gap-1.5">
      {plan.map((step, index) => {
        const state = rowState(index, read, done);
        return (
          <i
            key={step.name}
            className={cn(
              "h-1 flex-1 rounded-pill transition-colors duration-400",
              state === "read"
                ? "bg-lime"
                : state === "reading"
                  ? "bg-fg/50"
                  : "bg-fg/16"
            )}
          />
        );
      })}
    </div>
  );

  if (compact) {
    return (
      <section
        aria-labelledby={titleId}
        className="w-full animate-rise overflow-hidden rounded-[24px] bg-[rgb(10_27_102/0.94)] ring-1 ring-fg/10 motion-reduce:animate-none"
      >
        <h2 id={titleId} className="sr-only">
          Putting it together
        </h2>
        <button
          type="button"
          aria-expanded={open}
          aria-controls={rowsId}
          onClick={() => setOpen((value) => !value)}
          className="relative flex w-full cursor-pointer items-center gap-3 px-4 py-3.5 text-left outline-none focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-fg focus-visible:outline-solid"
        >
          {done ? (
            <span
              aria-hidden
              className="grid size-5 shrink-0 animate-pop place-items-center rounded-full bg-lime text-[11px] font-extrabold text-navy motion-reduce:animate-none"
            >
              ✓
            </span>
          ) : (
            <Spinner />
          )}
          <span className="min-w-0 flex-1 truncate text-[14.5px] font-semibold text-fg">
            {done ? (
              <>
                <span className="sr-only">✓</span> Read {total} sources
              </>
            ) : (
              live
            )}
          </span>
          <span aria-hidden className="flex -space-x-2">
            {plan.map((step) => (
              <PlatformMark
                key={step.name}
                mark={step.mark}
                size={24}
                className="ring-2 ring-[rgb(10_27_102)]"
              />
            ))}
          </span>
          <svg
            aria-hidden
            viewBox="0 0 12 12"
            className={cn(
              "size-3 shrink-0 text-fg transition-transform duration-300",
              open && "rotate-180"
            )}
          >
            <path
              d="M2 4l4 4 4-4"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
          </svg>
          <span
            aria-hidden
            style={{ width: `${(read / total) * 100}%` }}
            className="absolute bottom-0 left-0 h-0.5 bg-lime transition-[width] duration-700 ease-stage motion-reduce:transition-none"
          />
        </button>
        <p role="status" className="sr-only">
          {live}
        </p>
        <div
          id={rowsId}
          hidden={!open}
          className="border-t border-fg/10 px-4 pb-1"
        >
          <Rows plan={plan} lines={lines} done={done} />
        </div>
      </section>
    );
  }

  return (
    <section
      aria-labelledby={titleId}
      className="animate-rise rounded-card bg-[rgb(10_27_102/0.94)] px-7.5 py-7 ring-1 ring-fg/10 [animation-delay:200ms] [animation-fill-mode:both] motion-reduce:animate-none"
    >
      <h2
        id={titleId}
        className="font-display text-[32px] leading-tight font-bold tracking-[-0.035em] text-fg"
      >
        Putting it together
      </h2>
      <p
        aria-live="polite"
        className="mt-1 flex items-center gap-2 text-[14.5px] font-semibold text-periwinkle"
      >
        {done && (
          <Image
            src="/brand/logo-pearl.png"
            alt=""
            width={20}
            height={20}
            className="size-5 animate-pop motion-reduce:animate-none"
          />
        )}
        <span className={cn(done && "text-fg")}>{live}</span>
      </p>
      <div className="mt-4 mb-1.5">{segments}</div>
      <Rows plan={plan} lines={lines} done={done} />
    </section>
  );
}

export { ReadingPanel };
