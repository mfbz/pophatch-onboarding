"use client";

import { useRouter } from "next/navigation";
import { type MouseEvent, useEffect, useRef, useState } from "react";

import { ConnectRow } from "@/app/_components/connect-row";
import { KnowledgeCard } from "@/app/_components/knowledge-card";
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
import { Button } from "@/components/button";
import { PlatformMark } from "@/components/platform-mark";
import { Stage } from "@/components/stage";
import { TopBar } from "@/components/top-bar";

type FolderButtonProps = { provider: FolderProvider };

const FOLDERS: FolderProvider[] = ["google-drive", "onedrive"];

const REPORT_TYPES = ".csv,.xlsx,.xls,.pdf,.zip";

const CHIP =
  "inline-flex min-h-10 items-center gap-2.5 rounded-pill bg-fg/8 py-1.25 pr-3.5 pl-1.25 text-[13.5px] font-bold text-fg ring-1 ring-hair-soft max-tablet:min-h-11";

// True while this page is on screen. Next hides a page it leaves (Activity), which runs its
// effects' cleanup, so an answer that lands after the artist went back to start over is dropped
// instead of connecting an account in the new flow.
function useOnPage() {
  const onPage = useRef(false);
  useEffect(() => {
    onPage.current = true;
    return () => {
      onPage.current = false;
    };
  }, []);
  return onPage;
}

function FolderButton({ provider }: FolderButtonProps) {
  const { state, dispatch } = useOnboarding();
  const onPage = useOnPage();
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
      if (!onPage.current) return;
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
        className={`${CHIP} animate-pop bg-lime/12 ring-lime/55 outline-none focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-fg focus-visible:outline-solid motion-reduce:animate-none`}
      >
        <PlatformMark mark={provider} size={30} />
        {name} connected
        <span aria-hidden className="text-lime">
          ✓
        </span>
      </p>
    );
  }
  return (
    <button
      type="button"
      aria-disabled={pending || undefined}
      onClick={press}
      className={`${CHIP} cursor-pointer transition-[transform,background-color] outline-none hover:bg-fg/14 focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-fg focus-visible:outline-solid active:scale-96 aria-disabled:cursor-not-allowed aria-disabled:opacity-60 aria-disabled:active:scale-100 motion-reduce:transition-none`}
    >
      <PlatformMark mark={provider} size={30} />
      {pending ? "Connecting…" : `Connect ${name}`}
    </button>
  );
}

// Step 4. On the one-by-one path nothing was found yet, so the rows carry no handles and the
// first account connected is how PopHatch finds the artist.
function ConnectScreen() {
  const { state, dispatch } = useOnboarding();
  const router = useRouter();
  const onPage = useOnPage();
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
      if (!onPage.current) return;
      dispatch({
        type: "account",
        platform,
        connection: { ...result, attempts: attempt },
      });
      return;
    }
    // On the one-by-one path the first account also finds the artist; both land together or not
    // at all, so leaving mid-way never keeps an account without the artist it was meant to find.
    const artist = state.artist ?? (await resolveFromAccount(platform));
    if (!onPage.current) return;
    dispatch({ type: "account", platform, connection: result });
    if (state.artist === null) dispatch({ type: "found", artist });
  }

  return (
    <Stage rings="bottom">
      <TopBar current={progress.current} done={progress.done} />
      {allowed && (
        <main className="flex flex-1 flex-col pt-11.5 pb-10 max-tablet:pt-6 tablet:px-11">
          <div className="grid flex-1 grid-cols-[minmax(0,1fr)_minmax(0,440px)] items-start gap-12 max-desktop:gap-8 max-tablet:grid-cols-1 max-tablet:gap-5">
            <div className="flex min-w-0 flex-col">
              <h1 className="animate-rise font-display text-page-title font-bold text-fg text-halo motion-reduce:animate-none max-tablet:text-page-title-phone">
                Connect your <span className="text-lime">pages.</span>
              </h1>
              <p className="mt-4 max-w-140 text-lead text-mist text-halo max-tablet:mt-3 max-tablet:text-body">
                {manual
                  ? "Connect what you have; one is enough to start."
                  : `PopHatch found these from your ${linkPlatform}. Connect what you have; one is enough to start.`}
              </p>
              <ul className="mt-6 grid grid-cols-1 gap-2.5 max-tablet:mt-5 max-tablet:gap-2">
                {CONNECT_PLATFORMS.map(({ platform, available }, index) => (
                  <ConnectRow
                    key={platform}
                    delay={120 + index * 70}
                    mark={platform}
                    name={CONNECT_NAMES[platform]}
                    handle={handleFor(platform)}
                    available={available}
                    connection={state.accounts[platform]}
                    connect={() => connect(platform)}
                  />
                ))}
              </ul>
              <section aria-labelledby="reports-title" className="mt-6">
                <h2
                  id="reports-title"
                  className="font-display text-[17px] font-bold text-fg"
                >
                  Spotify, Apple Music and distributor reports
                </h2>
                <p className="mt-1 text-[13.5px] text-periwinkle">
                  Spotify and Apple Music come in as files. Point PopHatch at
                  the folder where you save them, or upload them.
                </p>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  {FOLDERS.map((provider) => (
                    <FolderButton key={provider} provider={provider} />
                  ))}
                  <label
                    className={`${CHIP} cursor-pointer transition-[transform,background-color] hover:bg-fg/14 active:scale-96 has-focus-visible:outline-2 has-focus-visible:outline-offset-3 has-focus-visible:outline-fg has-focus-visible:outline-solid motion-reduce:transition-none`}
                  >
                    <PlatformMark mark="files" size={30} />
                    Upload reports
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
                  <ul aria-label="Uploaded files" className="mt-3 space-y-1">
                    {state.files.map((name) => (
                      <li
                        key={name}
                        className="flex animate-fade-in items-center gap-2 font-mono text-[12px] text-mist motion-reduce:animate-none"
                      >
                        <span aria-hidden className="text-lime">
                          ✓
                        </span>
                        {name}
                      </li>
                    ))}
                  </ul>
                )}
              </section>
              <div className="mt-9 flex items-center gap-6 max-tablet:mt-8 max-tablet:flex-col max-tablet:items-stretch max-tablet:gap-3.5">
                <Button
                  disabled={!ready}
                  onClick={() => router.push("/together")}
                  className="min-h-13.5 min-w-75 px-7 text-[17px] font-extrabold max-tablet:min-h-12 max-tablet:w-full max-tablet:min-w-0 max-tablet:px-5 max-tablet:text-base max-tablet:whitespace-normal"
                >
                  {ready ? (
                    <>
                      Continue with {count} connected
                      <span aria-hidden> →</span>
                    </>
                  ) : count === 0 ? (
                    "Connect one to continue"
                  ) : (
                    "Connect an account to continue"
                  )}
                </Button>
                <Button variant="link" onClick={() => router.push("/")}>
                  Try another link
                </Button>
              </div>
            </div>
            <div className="animate-rise [animation-delay:150ms] [animation-fill-mode:both] motion-reduce:animate-none max-tablet:order-first tablet:sticky tablet:top-6">
              <KnowledgeCard state={state} />
            </div>
          </div>
        </main>
      )}
    </Stage>
  );
}

export { ConnectScreen };
