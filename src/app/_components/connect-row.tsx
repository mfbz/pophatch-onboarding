"use client";

import { useId, useState } from "react";

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

// One account in the list (DESIGN.md, Sources). The row says "Connecting…" while it waits, since
// nothing spins; that waiting lives here rather than in the flow state, so a reload never leaves a
// row stuck waiting for an answer that will not come.
function ConnectRow({
  name,
  handle,
  available,
  connection,
  connect,
}: ConnectRowProps) {
  const [pending, setPending] = useState(false);
  const titleId = useId();

  async function press() {
    if (pending) return;
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
        {connection?.status === "failed" && !pending && (
          <p className="mt-1 flex items-center gap-2 text-caption text-fg">
            <StatusDot tone="pink" />
            {connection.message}
          </p>
        )}
      </div>
      {!available ? (
        <p className="text-caption font-semibold text-periwinkle">
          Coming soon
        </p>
      ) : connection?.status === "connected" ? (
        <p className="flex items-center gap-2 text-sm font-semibold text-fg">
          <StatusDot tone="lime" />
          <span aria-hidden>✓</span>
          <span>Connected</span>
        </p>
      ) : pending ? (
        <Button variant="secondary" disabled>
          Connecting…
        </Button>
      ) : connection?.status === "failed" ? (
        <Button
          variant="secondary"
          aria-label={`Try ${name} again`}
          onClick={press}
        >
          Try again
        </Button>
      ) : (
        <Button
          variant="secondary"
          aria-label={`Connect ${name}`}
          onClick={press}
        >
          Connect
        </Button>
      )}
    </li>
  );
}

export { ConnectRow };
