"use client";

import { type MouseEvent, useEffect, useId, useRef, useState } from "react";

import type { Connection } from "@/app/_lib/onboarding-state";
import { Button } from "@/components/button";
import { StatusDot } from "@/components/status-dot";

type ConnectRowProps = {
  name: string;
  handle?: string;
  available: boolean;
  connection: Connection | undefined;
  connect: () => Promise<void>;
};

// One account card (DESIGN.md, Account cards). One button carries Connect, Connecting… and Try
// again, so keyboard focus stays on it while it waits; once connected, focus moves to the line that
// says so, and every result is announced. The waiting lives here rather than in the flow state, so a
// reload never leaves a row stuck waiting for an answer that will not come.
function ConnectRow({
  name,
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
      className="flex min-h-47.5 flex-col gap-2 rounded-card bg-fg px-7 py-6.5 text-navy shadow-card max-tablet:min-h-0 max-tablet:flex-row max-tablet:items-center max-tablet:gap-4 max-tablet:px-5 max-tablet:py-5"
    >
      <div className="flex min-w-0 flex-col gap-2 max-tablet:flex-1">
        <h2 id={titleId} className="font-display text-tile font-bold">
          {name}
        </h2>
        {handle && (
          <p className="text-caption wrap-anywhere opacity-80">{handle}</p>
        )}
        {failed && (
          <p role="status" className="flex items-center gap-2 text-caption">
            <StatusDot tone="pink" />
            {connection.message}
          </p>
        )}
      </div>
      <div className="mt-auto max-tablet:mt-0 max-tablet:shrink-0">
        {!available ? (
          <p className="text-sm font-bold text-navy/70">Coming soon</p>
        ) : connected ? (
          <p
            ref={status}
            role="status"
            tabIndex={-1}
            className="inline-flex items-center gap-2 rounded-pill bg-lime px-4 py-2.5 text-sm font-extrabold text-navy outline-none focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-navy focus-visible:outline-solid"
          >
            <span aria-hidden>✓</span>
            <span>Connected</span>
          </p>
        ) : (
          <Button
            variant="ink"
            aria-disabled={pending || undefined}
            aria-label={
              pending
                ? undefined
                : `${failed ? "Try" : "Connect"} ${name}${failed ? " again" : ""}`
            }
            onClick={press}
            className="focus-visible:outline-navy aria-disabled:cursor-not-allowed aria-disabled:opacity-60 aria-disabled:active:scale-100"
          >
            {pending ? "Connecting…" : failed ? "Try again" : "Connect"}
          </Button>
        )}
      </div>
    </li>
  );
}

export { ConnectRow };
