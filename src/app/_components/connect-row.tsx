"use client";

import { type MouseEvent, useEffect, useId, useRef, useState } from "react";

import type { Connection } from "@/app/_lib/onboarding-state";
import { type MarkKey, PlatformMark } from "@/components/platform-mark";
import { StatusDot } from "@/components/status-dot";
import { cn } from "@/lib/cn";

type ConnectRowProps = {
  mark: MarkKey;
  name: string;
  // When the row rises in, in ms, so the list arrives one row after another.
  delay?: number;
  handle?: string;
  available: boolean;
  connection: Connection | undefined;
  connect: () => Promise<void>;
};

// One account row (DESIGN.md, Account rows): a glass pill with the platform's mark and one state
// pill. One button carries Connect, Connecting… and Try again, so keyboard focus stays on it while
// it waits; once connected, focus moves to the line that says so, and every result is announced.
// The waiting lives here rather than in the flow state, so a reload never leaves a row stuck
// waiting for an answer that will not come.
function ConnectRow({
  mark,
  name,
  delay = 0,
  handle,
  available,
  connection,
  connect,
}: ConnectRowProps) {
  const [pending, setPending] = useState(false);
  const titleId = useId();
  const pressedWithFocus = useRef(false);
  const status = useRef<HTMLParagraphElement>(null);
  const connected = connection?.status === "connected";
  const failed = connection?.status === "failed" && !pending;

  useEffect(() => {
    if (connected && pressedWithFocus.current) {
      pressedWithFocus.current = false;
      status.current?.focus();
    }
  }, [connected]);

  async function press(event: MouseEvent<HTMLButtonElement>) {
    if (pending) return;
    pressedWithFocus.current = document.activeElement === event.currentTarget;
    setPending(true);
    try {
      await connect();
    } finally {
      setPending(false);
    }
  }

  return (
    <li
      aria-labelledby={titleId}
      data-state={connected ? "connected" : failed ? "failed" : undefined}
      style={{ animationDelay: `${delay}ms` }}
      className={cn(
        "flex animate-rise items-center gap-3.5 rounded-pill bg-fg/6 py-2.5 pr-3 pl-2.5 ring-1 ring-hair-soft backdrop-blur-sm transition-colors duration-500 [animation-fill-mode:both] motion-reduce:animate-none max-tablet:gap-3 max-tablet:py-2 max-tablet:pl-2",
        connected && "bg-lime/7 ring-lime/55",
        !available && "opacity-50"
      )}
    >
      <PlatformMark
        mark={mark}
        size={44}
        muted={!available}
        className="max-tablet:size-10!"
      />
      <div className="min-w-0 flex-1">
        <h2
          id={titleId}
          className="font-display text-[17px] leading-tight font-bold text-fg"
        >
          {name}
        </h2>
        {handle && (
          <p
            className={cn(
              "truncate text-[12.5px] text-periwinkle",
              connected && connection.numbers && "max-tablet:hidden"
            )}
          >
            {handle}
          </p>
        )}
        {connected && connection.numbers && (
          <p className="hidden font-mono text-[11.5px] text-lime max-tablet:block">
            <span aria-hidden>✓ </span>
            {connection.numbers}
          </p>
        )}
        {failed && (
          <p className="flex items-center gap-1.5 text-[12.5px] text-fg">
            <StatusDot tone="pink" />
            {connection.message}
          </p>
        )}
      </div>
      <div className="shrink-0">
        {!available ? (
          <p className="rounded-pill px-3.5 py-1.75 text-[12.5px] font-bold text-fg outline-[1.5px] outline-fg/50 outline-dashed">
            Coming soon
          </p>
        ) : connected ? (
          <p
            ref={status}
            role="status"
            tabIndex={-1}
            className="inline-flex animate-pop items-center gap-1.5 rounded-pill bg-lime px-3.5 py-1.75 text-[12.5px] font-extrabold text-navy outline-none focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-fg focus-visible:outline-solid motion-reduce:animate-none"
          >
            <span aria-hidden>✓</span>
            <span>Connected</span>
          </p>
        ) : (
          <button
            type="button"
            aria-disabled={pending || undefined}
            aria-label={
              pending
                ? undefined
                : `${failed ? "Try" : "Connect"} ${name}${failed ? " again" : ""}`
            }
            onClick={press}
            className="inline-flex min-h-9 cursor-pointer items-center rounded-pill bg-fg px-3.5 text-[12.5px] font-bold text-klein transition-transform outline-none focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-fg focus-visible:outline-solid active:scale-96 aria-disabled:cursor-not-allowed aria-disabled:opacity-60 aria-disabled:active:scale-100 motion-reduce:transition-none max-tablet:min-h-11"
          >
            {pending ? "Connecting…" : failed ? "Try again" : "Connect"}
          </button>
        )}
      </div>
    </li>
  );
}

export { ConnectRow };
