"use client";

import { useRouter } from "next/navigation";
import {
  type FormEvent,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";

import { useOnboarding } from "@/app/_lib/onboarding-provider";
import type { OnboardingState } from "@/app/_lib/onboarding-state";
import {
  EXAMPLE_LINKS,
  type ParsedLink,
  parseArtistLink,
  PLATFORM_NAMES,
  type Platform,
} from "@/app/_lib/parse-link";
import { Button } from "@/components/button";
import { Input } from "@/components/input";
import { Stage } from "@/components/stage";
import { StatusDot } from "@/components/status-dot";
import { TopBar } from "@/components/top-bar";

type LinkFormProps = { notice: OnboardingState["notice"] };

const PLATFORMS = Object.keys(PLATFORM_NAMES) as Platform[];

const PLATFORM_LIST = `${PLATFORMS.slice(0, -1)
  .map((platform) => PLATFORM_NAMES[platform])
  .join(
    ", "
  )} or ${PLATFORM_NAMES[PLATFORMS[PLATFORMS.length - 1] ?? "linktree"]}`;

const ERRORS: Record<Extract<ParsedLink, { ok: false }>["reason"], string> = {
  empty: `Paste a link to start: ${PLATFORM_LIST} all work.`,
  "not-a-link": `That doesn't look like a link. Paste one from ${PLATFORM_LIST}.`,
  unsupported: `PopHatch can't read that site yet. Paste a link from ${PLATFORM_LIST}.`,
};

const NOTICES: Record<NonNullable<OnboardingState["notice"]>, string> = {
  "not-me": "Not you? Try a different link, or connect your pages one by one.",
  "not-found":
    "We couldn't find you from that link. Try another one, or connect your pages one by one.",
};

const PROMISES = [
  {
    title: "Knows the business",
    body: "Fifteen years inside the biggest labels, now on your side.",
  },
  {
    title: "Knows you",
    body: "Your streams, your fans, your releases, your money.",
  },
  {
    title: "Decides what's next",
    body: "What to do this week, and whether it worked.",
  },
];

// The prototype's lime signal: a dot inside two rings, the stage's rings in small.
function SignalMark() {
  return (
    <svg aria-hidden viewBox="0 0 40 40" className="size-10 shrink-0 text-lime">
      <circle cx={20} cy={20} r={6.4} fill="currentColor" />
      <circle
        cx={20}
        cy={20}
        r={12.8}
        fill="none"
        stroke="currentColor"
        strokeWidth={1.6}
      />
      <circle
        cx={20}
        cy={20}
        r={18.8}
        fill="none"
        stroke="currentColor"
        strokeWidth={1.4}
        opacity={0.8}
      />
    </svg>
  );
}

// Back from "Not me" or a link that found no one, the field starts empty and focused so the
// artist can paste another link straight away. Next keeps this page alive while hidden (Activity),
// so the sending state and any error reset when it hides, and the focus runs each time it shows.
function LinkForm({ notice }: LinkFormProps) {
  const { dispatch } = useOnboarding();
  const router = useRouter();
  const [link, setLink] = useState(notice ? "" : EXAMPLE_LINKS.spotify);
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const field = useRef<HTMLInputElement>(null);
  const line = error ?? (notice ? NOTICES[notice] : null);

  useLayoutEffect(
    () => () => {
      setSending(false);
      setError(null);
    },
    []
  );

  useEffect(() => {
    if (notice) field.current?.focus();
  }, [notice]);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (sending) return;
    const parsed = parseArtistLink(link);
    if (!parsed.ok) {
      setError(ERRORS[parsed.reason]);
      return;
    }
    setSending(true);
    dispatch({ type: "linkEntered", link: parsed.url });
    router.push("/finding");
  }

  function fillExample(platform: Platform) {
    setLink(EXAMPLE_LINKS[platform]);
    setError(null);
  }

  return (
    <form noValidate onSubmit={submit} className="mt-7 max-w-[860px]">
      <label htmlFor="artist-link" className="sr-only">
        Your link
      </label>
      <div className="flex items-center gap-2.5 rounded-pill bg-fg py-2 pr-2 pl-6.5 shadow-card outline-pink focus-within:outline-2 focus-within:outline-offset-3 focus-within:outline-fg focus-within:outline-solid has-[[aria-invalid=true]]:outline-2 has-[[aria-invalid=true]]:outline-solid max-tablet:pl-4">
        <Input
          id="artist-link"
          type="url"
          inputMode="url"
          autoComplete="url"
          spellCheck={false}
          ref={field}
          placeholder="Paste a link to your music or your page"
          value={link}
          onChange={(event) => {
            setLink(event.target.value);
            setError(null);
          }}
          aria-invalid={error !== null}
          aria-describedby="artist-link-line"
          className="min-h-0 rounded-none bg-transparent px-0 shadow-none focus-visible:outline-none aria-invalid:outline-none max-tablet:px-0"
        />
        <Button
          type="submit"
          disabled={sending}
          className="min-h-13.5 px-7 text-[17px] font-extrabold max-tablet:min-h-12 max-tablet:px-5 max-tablet:text-base"
        >
          Find me
        </Button>
      </div>
      <p
        id="artist-link-line"
        aria-live="polite"
        className="mt-3 flex min-h-5 items-center gap-2 text-caption text-fg empty:mt-0"
      >
        {line && (
          <>
            <StatusDot tone="pink" />
            {line}
          </>
        )}
      </p>
      <div className="mt-7 flex flex-wrap items-center gap-2">
        {PLATFORMS.map((platform) => (
          <Button
            key={platform}
            type="button"
            variant="secondary"
            aria-label={`Use ${/^[AEIOU]/.test(PLATFORM_NAMES[platform]) ? "an" : "a"} ${PLATFORM_NAMES[platform]} example`}
            onClick={() => fillExample(platform)}
            className="min-h-0 border-0 bg-fg/12 px-3.5 py-1.5 text-caption font-semibold enabled:hover:bg-fg/20 max-tablet:min-h-11"
          >
            {PLATFORM_NAMES[platform]}
          </Button>
        ))}
        <span className="ml-1 text-lead text-mist text-halo">
          Any one works.
        </span>
      </div>
    </form>
  );
}

function LinkScreen() {
  const { state, dispatch, ready } = useOnboarding();
  const router = useRouter();

  function startManual() {
    dispatch({ type: "startManual" });
    router.push("/connect");
  }

  return (
    <Stage>
      <TopBar current="find" done={[]} />
      <main className="flex flex-1 flex-col pt-16.5 max-tablet:pt-10 tablet:px-14.5">
        <h1 className="max-w-[12ch] font-display text-display font-bold text-fg text-halo">
          Noor, let&apos;s run your <span className="text-lime">business.</span>
        </h1>
        <p className="mt-7 text-lead text-mist text-halo max-tablet:mt-4 max-tablet:text-lg">
          One link to start. PopHatch finds the rest.
        </p>
        {/* Remounted once saved progress is read, and on each return to step 1 with a notice, so
            the field starts from the right state. */}
        <LinkForm
          key={ready ? `returns-${state.returns}` : "loading"}
          notice={state.notice}
        />
        <ul className="mt-8.5 grid max-w-[1100px] gap-4.5 max-tablet:mt-8 tablet:grid-cols-3">
          {PROMISES.map((promise) => (
            <li
              key={promise.title}
              className="flex flex-col gap-2 rounded-card bg-fg px-7 py-6.5 text-navy shadow-card"
            >
              <SignalMark />
              <h2 className="font-display text-card-title font-bold">
                {promise.title}
              </h2>
              <p className="text-navy/70">{promise.body}</p>
            </li>
          ))}
        </ul>
        <div className="mt-7">
          <Button variant="link" onClick={startManual}>
            No link? Connect your pages one by one
          </Button>
        </div>
      </main>
    </Stage>
  );
}

export { LinkScreen };
