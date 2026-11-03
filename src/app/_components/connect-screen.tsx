"use client";

import { useRouter } from "next/navigation";
import { type MouseEvent, useEffect, useRef, useState } from "react";

import { ConnectRow } from "@/app/_components/connect-row";
import {
  CONNECT_NAMES,
  CONNECT_PLATFORMS,
  connectAccount,
  connectFolder,
  FOLDER_NAMES,
  type ConnectPlatform,
  type FolderProvider,
  resolveFromAccount,
} from "@/app/_lib/mock-api";
import { useOnboarding } from "@/app/_lib/onboarding-provider";
import { parseArtistLink, PLATFORM_NAMES } from "@/app/_lib/parse-link";
import { connectedCount, stageProgress } from "@/app/_lib/onboarding-state";
import { useStepGuard } from "@/app/_lib/use-step-guard";
import { Button, buttonVariants } from "@/components/button";
import { Stage } from "@/components/stage";
import { StatusDot } from "@/components/status-dot";
import { TopBar } from "@/components/top-bar";

type FolderButtonProps = { provider: FolderProvider };

const FOLDERS: FolderProvider[] = ["google-drive", "onedrive"];

const REPORT_TYPES = ".csv,.xlsx,.xls,.pdf,.zip";

function FolderButton({ provider }: FolderButtonProps) {
  const { state, dispatch } = useOnboarding();
  const [pending, setPending] = useState(false);
  const pressedWithFocus = useRef(false);
  const status = useRef<HTMLParagraphElement>(null);
  const name = FOLDER_NAMES[provider];
  const connected = state.folders[provider]?.status === "connected";

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
      const result = await connectFolder(provider);
      dispatch({ type: "folder", provider, connection: result });
    } finally {
      setPending(false);
    }
  }

  if (connected) {
    return (
      <p
        ref={status}
        role="status"
        tabIndex={-1}
        className="flex min-h-10 items-center gap-2 text-sm font-semibold text-fg outline-none focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-fg focus-visible:outline-solid"
      >
        <StatusDot tone="lime" />
        {name} connected
      </p>
    );
  }
  return (
    <Button
      variant="secondary"
      aria-disabled={pending || undefined}
      onClick={press}
      className="aria-disabled:cursor-not-allowed aria-disabled:opacity-60 aria-disabled:active:scale-100"
    >
      {pending ? "Connecting…" : `Connect ${name}`}
    </Button>
  );
}

// Step 4. On the one-by-one path nothing was found yet, so the rows carry no handles and the
// first account connected is how PopHatch finds the artist.
function ConnectScreen() {
  const { state, dispatch } = useOnboarding();
  const router = useRouter();
  const allowed = useStepGuard(
    (current) => current.confirmed || current.path === "manual"
  );
  const progress = stageProgress(state, "/connect");
  const count = connectedCount(state);
  const manual = state.path === "manual";
  const parsedLink = state.link ? parseArtistLink(state.link) : null;
  const linkPlatform = parsedLink?.ok
    ? PLATFORM_NAMES[parsedLink.platform]
    : "link";
  // On the one-by-one path the artist is found from the first account, so Continue waits for that.
  const ready = count > 0 && state.artist !== null;

  function handleFor(platform: ConnectPlatform): string | undefined {
    const connection = state.accounts[platform];
    if (connection?.status === "connected" && connection.handle) {
      return connection.handle;
    }
    if (manual) return undefined;
    return state.artist?.accounts.find(
      (account) => account.platform === platform
    )?.handle;
  }

  async function connect(platform: ConnectPlatform) {
    const previous = state.accounts[platform];
    const attempt = previous?.status === "failed" ? previous.attempts + 1 : 1;
    const result = await connectAccount(platform, attempt);
    if (result.status === "failed") {
      dispatch({
        type: "account",
        platform,
        connection: { ...result, attempts: attempt },
      });
      return;
    }
    dispatch({ type: "account", platform, connection: result });
    if (state.artist === null) {
      dispatch({ type: "found", artist: await resolveFromAccount(platform) });
    }
  }

  return (
    <Stage>
      <TopBar current={progress.current} done={progress.done} />
      {allowed && (
        <main className="flex flex-1 flex-col pt-14 max-tablet:pt-8">
          <h1 className="font-display text-page-title font-bold text-fg max-tablet:text-page-title-phone">
            Connect your <span className="text-lime">pages.</span>
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-mist">
            {manual
              ? "Connect what you have; one is enough to start."
              : `PopHatch found these from your ${linkPlatform}. Connect what you have; one is enough to start.`}
          </p>
          <ul className="mt-8 max-w-3xl border-t border-hair">
            {CONNECT_PLATFORMS.map(({ platform, available }) => (
              <ConnectRow
                key={platform}
                name={CONNECT_NAMES[platform]}
                handle={handleFor(platform)}
                available={available}
                connection={state.accounts[platform]}
                connect={() => connect(platform)}
              />
            ))}
          </ul>
          <section aria-labelledby="reports-title" className="mt-10 max-w-3xl">
            <h2
              id="reports-title"
              className="font-display text-row-title font-semibold text-fg"
            >
              Spotify, Apple Music and distributor reports
            </h2>
            <p className="mt-1.5 text-mist">
              Point PopHatch at the folder where you save them, or upload the
              files.
            </p>
            <div className="mt-5 flex flex-wrap items-center gap-3">
              {FOLDERS.map((provider) => (
                <FolderButton key={provider} provider={provider} />
              ))}
              <label
                className={buttonVariants({
                  variant: "secondary",
                  className:
                    "has-focus-visible:outline-2 has-focus-visible:outline-offset-3 has-focus-visible:outline-fg has-focus-visible:outline-solid",
                })}
              >
                Upload files
                <input
                  type="file"
                  multiple
                  accept={REPORT_TYPES}
                  className="sr-only"
                  onChange={(event) => {
                    const names = Array.from(
                      event.target.files ?? [],
                      (file) => file.name
                    );
                    // Cleared so choosing the same file again still counts as a choice.
                    event.target.value = "";
                    if (names.length > 0) {
                      dispatch({
                        type: "files",
                        names: [...new Set([...state.files, ...names])],
                      });
                    }
                  }}
                />
              </label>
            </div>
            {state.files.length > 0 && (
              <ul aria-label="Uploaded files" className="mt-4 space-y-1">
                {state.files.map((name) => (
                  <li
                    key={name}
                    className="flex items-center gap-2 text-caption text-fg"
                  >
                    <StatusDot tone="lime" />
                    {name}
                  </li>
                ))}
              </ul>
            )}
          </section>
          <div className="mt-12 flex max-w-3xl items-center justify-between gap-4 max-tablet:mt-auto max-tablet:flex-col-reverse max-tablet:items-stretch max-tablet:pt-10">
            <Button variant="link" onClick={() => router.push("/")}>
              Try another link
            </Button>
            <Button
              disabled={!ready}
              onClick={() => router.push("/together")}
              className="min-h-12 px-7 max-tablet:w-full"
            >
              {count === 0
                ? "Connect one to continue"
                : `Continue with ${count} connected`}
            </Button>
          </div>
        </main>
      )}
    </Stage>
  );
}

export { ConnectScreen };
