"use client";

import { useRouter } from "next/navigation";
import {
  type FormEvent,
  type ReactNode,
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
import { Promises } from "@/app/_components/promises";
import { Button } from "@/components/button";
import { Input } from "@/components/input";
import { PlatformMark } from "@/components/platform-mark";
import { Stage } from "@/components/stage";
import { StatusDot } from "@/components/status-dot";
import { TopBar } from "@/components/top-bar";
import { cn } from "@/lib/cn";

type LinkFormProps = {
  notice: OnboardingState["notice"];
  children?: ReactNode;
};

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

// Back from "Not me" or a link that found no one, the field starts empty and focused so the
// artist can paste another link straight away. Next keeps this page alive while hidden (Activity),
// so the sending state and any error reset when it hides, and the focus runs each time it shows.
function LinkForm({ notice, children }: LinkFormProps) {
  const { dispatch } = useOnboarding();
  const router = useRouter();
  const [link, setLink] = useState(notice ? "" : EXAMPLE_LINKS.spotify);
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const field = useRef<HTMLInputElement>(null);
  const line = error ?? (notice ? NOTICES[notice] : null);
  const parsed = parseArtistLink(link);
  const recognised = parsed.ok ? parsed.platform : null;

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
    <form noValidate onSubmit={submit} className="mt-7">
      <label htmlFor="artist-link" className="sr-only">
        Your link
      </label>
      <div
        data-platform={recognised ?? undefined}
        className={cn(
          "flex max-w-[860px] items-center gap-3 rounded-pill bg-fg py-2 pr-2 pl-2.5 shadow-card outline-pink transition-shadow duration-500 focus-within:outline-2 focus-within:outline-offset-3 focus-within:outline-fg focus-within:outline-solid has-[[aria-invalid=true]]:outline-2 has-[[aria-invalid=true]]:outline-solid",
          recognised &&
            "shadow-[0_0_0_6px_rgb(212_255_58/0.3),0_20px_50px_-20px_rgb(0_0_0/0.5)]"
        )}
      >
        <span className="grid size-11.5 shrink-0 place-items-center max-tablet:size-10">
          {recognised && (
            <PlatformMark
              key={recognised}
              mark={recognised}
              size={46}
              className="animate-pop motion-reduce:animate-none max-tablet:size-10!"
            />
          )}
        </span>
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
        className="mt-3 flex min-h-5 max-w-[860px] items-center gap-2 text-caption text-fg empty:mt-0"
      >
        {line && (
          <>
            <StatusDot tone="pink" />
            {line}
          </>
        )}
      </p>
      <div className="mt-5 flex flex-wrap items-center gap-1.5 max-tablet:gap-2">
        {PLATFORMS.map((platform) => (
          <Button
            key={platform}
            type="button"
            variant="secondary"
            aria-pressed={recognised === platform}
            aria-label={`Use ${/^[AEIOU]/.test(PLATFORM_NAMES[platform]) ? "an" : "a"} ${PLATFORM_NAMES[platform]} example`}
            onClick={() => fillExample(platform)}
            className="min-h-0 gap-1.5 border-0 bg-fg/12 py-1 pr-3 pl-1 text-[13px] font-semibold enabled:hover:-translate-y-px enabled:hover:bg-fg/20 aria-pressed:bg-fg aria-pressed:text-navy max-tablet:min-h-11"
          >
            <PlatformMark mark={platform} size={22} />
            {PLATFORM_NAMES[platform]}
          </Button>
        ))}
        <span className="ml-1.5 text-[15px] whitespace-nowrap text-mist text-halo">
          Any one works.
        </span>
      </div>
      {children}
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
        >
          <p className="mt-3.5 text-[14px] text-mist text-halo">
            No link to hand?{" "}
            <button
              type="button"
              onClick={startManual}
              className="cursor-pointer font-semibold text-fg underline decoration-lime decoration-2 underline-offset-4 outline-none hover:text-lime focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-fg focus-visible:outline-solid max-tablet:min-h-11"
            >
              Connect your pages one by one
            </button>
          </p>
        </LinkForm>
        <div className="mt-12 max-tablet:mt-10">
          <Promises />
        </div>
      </main>
    </Stage>
  );
}

export { LinkScreen };
