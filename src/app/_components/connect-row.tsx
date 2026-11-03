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

// One account in the list (DESIGN.md, Account rows). One button carries Connect, Connecting… and Try
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
      className={`flex min-h-20 items-center gap-4 border-b border-hair py-4 ${available ? "" : "opacity-60"}`}
    >
      <div className="min-w-0 flex-1">
        <h2
          id={titleId}
          className="font-display text-row-title font-semibold text-fg"
        >
          {name}
        </h2>
        {handle && (
          <p className="truncate text-caption text-periwinkle">{handle}</p>
        )}
        {failed && (
          <p
            role="status"
            className="mt-1 flex items-center gap-2 text-caption text-fg"
          >
            <StatusDot tone="pink" />
            {connection.message}
          </p>
        )}
      </div>
      {!available ? (
        <p className="text-caption font-semibold text-periwinkle">
          Coming soon
        </p>
      ) : connected ? (
        <p
          ref={status}
          role="status"
          tabIndex={-1}
          className="flex items-center gap-2 text-sm font-semibold text-fg outline-none focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-fg focus-visible:outline-solid"
        >
          <StatusDot tone="lime" />
          <span aria-hidden>✓</span>
          <span>Connected</span>
        </p>
      ) : (
        <Button
          variant="secondary"
          aria-disabled={pending || undefined}
          aria-label={
            pending
              ? undefined
              : `${failed ? "Try" : "Connect"} ${name}${failed ? " again" : ""}`
          }
          onClick={press}
          className="aria-disabled:cursor-not-allowed aria-disabled:opacity-60 aria-disabled:active:scale-100"
        >
          {pending ? "Connecting…" : failed ? "Try again" : "Connect"}
        </Button>
      )}
    </li>
  );
}

export { ConnectRow };
