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
    <form noValidate onSubmit={submit} className="mt-10 max-w-4xl">
      <label htmlFor="artist-link" className="sr-only">
        Your link
      </label>
      <div className="relative flex gap-3 max-tablet:flex-col">
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
          className="tablet:min-h-16 tablet:pr-36"
        />
        <Button
          type="submit"
          disabled={sending}
          className="max-tablet:min-h-12 max-tablet:w-full tablet:absolute tablet:top-2 tablet:right-2 tablet:bottom-2 tablet:px-7"
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
      <div className="mt-5 flex flex-wrap items-center gap-2">
        {PLATFORMS.map((platform) => (
          <Button
            key={platform}
            type="button"
            variant="secondary"
            aria-label={`Use a ${PLATFORM_NAMES[platform]} example`}
            onClick={() => fillExample(platform)}
            className="min-h-9 px-3.5 py-1.5 max-tablet:min-h-11"
          >
            {PLATFORM_NAMES[platform]}
          </Button>
        ))}
        <span className="ml-1 text-lg text-fg">Any one works.</span>
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
      <main className="flex flex-1 flex-col pt-20 max-tablet:pt-10">
        <h1 className="max-w-[12ch] font-display text-display font-bold text-fg">
          Noor, let&apos;s run your <span className="text-lime">business.</span>
        </h1>
        <p className="mt-6 text-xl text-mist max-tablet:mt-4 max-tablet:text-lg">
          One link to start. PopHatch finds the rest.
        </p>
        {/* Remounted once saved progress is read, and on each return to step 1 with a notice, so
            the field starts from the right state. */}
        <LinkForm
          key={ready ? `returns-${state.returns}` : "loading"}
          notice={state.notice}
        />
        <ul className="mt-14 grid gap-x-10 gap-y-6 max-tablet:mt-10 tablet:grid-cols-3">
          {PROMISES.map((promise) => (
            <li key={promise.title} className="border-t border-hair pt-5">
              <h2 className="font-display text-row-title font-semibold text-fg">
                {promise.title}
              </h2>
              <p className="mt-1.5 text-mist">{promise.body}</p>
            </li>
          ))}
        </ul>
        <div className="mt-10">
          <Button variant="link" onClick={startManual}>
            No link? Connect your pages one by one
          </Button>
        </div>
      </main>
    </Stage>
  );
}

export { LinkScreen };
