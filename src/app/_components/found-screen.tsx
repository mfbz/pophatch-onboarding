"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import type { CSSProperties } from "react";

import type { Artist } from "@/app/_lib/mock-api";
import { useOnboarding } from "@/app/_lib/onboarding-provider";
import { useStepGuard } from "@/app/_lib/use-step-guard";
import { BarRing } from "@/components/bar-ring";
import { Button } from "@/components/button";
import { type MarkKey, PlatformMark } from "@/components/platform-mark";
import { Stage } from "@/components/stage";
import { TopBar } from "@/components/top-bar";
import { Vinyl } from "@/components/vinyl";
import { cn } from "@/lib/cn";
import { useCountUp, useInView } from "@/lib/motion";

type ArtistProps = { artist: Artist };

type StatProps = {
  value: number;
  label: string;
  mark: MarkKey;
  source: string;
  play: boolean;
};

function Stat({ value, label, mark, source, play }: StatProps) {
  const shown = useCountUp(value, play, 1100);
  return (
    <div>
      <b className="block font-display text-[48px] leading-[0.95] font-bold tracking-[-0.05em] text-fg tabular-nums max-tablet:text-[30px]">
        {shown.toLocaleString("en-US")}
      </b>
      <span className="my-1.5 block font-mono text-[11px] tracking-[0.04em] text-periwinkle uppercase">
        {label}
      </span>
      <span className="inline-flex items-center gap-1.5 text-xs text-fg">
        <PlatformMark mark={mark} size={18} />
        {source}
      </span>
    </div>
  );
}

// The releases as sleeves, each with its record peeking out in the release's colour; the latest
// first and larger, its record slid further out.
function Releases({ artist }: ArtistProps) {
  return (
    <ul
      aria-label="Releases"
      // The strip scrolls sideways on a phone; focusable so a keyboard can scroll it too.
      tabIndex={0}
      className="mt-6 grid grid-cols-[1.6fr_repeat(4,1fr)] items-end gap-5.5 rounded-thumb pr-6.5 outline-none focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-fg focus-visible:outline-solid max-tablet:-mx-4 max-tablet:flex max-tablet:snap-x max-tablet:scroll-px-4 max-tablet:gap-4 max-tablet:overflow-x-auto max-tablet:px-4 max-tablet:pb-2 max-tablet:text-left"
    >
      {artist.releases.map((release, index) => {
        const latest = index === 0;
        const style: CSSProperties = {
          background: `repeating-radial-gradient(circle, ${release.tint} 0 2px, color-mix(in srgb, ${release.tint} 72%, #000) 2px 4px)`,
        };
        return (
          <li
            key={release.title}
            style={{ animationDelay: `${300 + index * 110}ms` }}
            className={cn(
              "group relative animate-rise motion-reduce:animate-none max-tablet:shrink-0 max-tablet:snap-start",
              latest ? "max-tablet:w-40" : "max-tablet:w-24"
            )}
          >
            {latest && (
              <span className="absolute top-2.5 left-2.5 z-10 rounded-pill bg-lime px-2.25 py-0.75 text-[11px] font-extrabold text-navy">
                Latest
              </span>
            )}
            <div className="relative">
              <span
                aria-hidden
                style={style}
                className={cn(
                  "absolute top-[5%] right-0 bottom-[5%] aspect-square rounded-full transition-transform duration-600 ease-stage group-hover:translate-x-[26%] after:absolute after:inset-[36%] after:rounded-full after:bg-navy after:shadow-[0_0_0_2px_rgb(255_255_255/0.2)] motion-reduce:transition-none",
                  latest && "translate-x-[26%]"
                )}
              />
              <Image
                src={release.cover}
                alt={release.title}
                width={240}
                height={240}
                className={cn(
                  "relative aspect-square w-full rounded-cover object-cover shadow-cover",
                  latest && "ring-2 ring-lime/55"
                )}
              />
            </div>
            <div aria-hidden className="mt-2.5">
              <b
                className={cn(
                  "block leading-tight text-fg",
                  latest
                    ? "font-display text-[22px] tracking-[-0.03em]"
                    : "text-sm"
                )}
              >
                {release.title}
              </b>
              <span className="block font-mono text-[11px] tracking-[0.04em] text-periwinkle uppercase">
                {latest
                  ? `${release.kind} · ${release.year} · ${release.plays}`
                  : `${release.kind} · ${release.year}`}
              </span>
            </div>
          </li>
        );
      })}
    </ul>
  );
}

// Who PopHatch found, beside the record: name, city, her sound, her releases and three numbers
// that count up once in view.
function Profile({ artist }: ArtistProps) {
  const [ref, play] = useInView<HTMLDivElement>();
  const { stats } = artist;
  return (
    <div ref={ref} className="min-w-0">
      <h1 className="font-display text-hero font-bold text-fg max-tablet:text-page-title-phone">
        Found <span className="text-lime">you.</span>
      </h1>
      <p className="mt-2.5 flex flex-wrap items-baseline gap-x-2 max-tablet:justify-center">
        <span className="font-display text-name font-bold text-fg">
          {artist.name}
        </span>
        <span className="text-[17px] text-periwinkle">
          <span aria-hidden>· </span>
          {artist.city}
        </span>
      </p>
      <ul
        aria-label="Sound"
        className="mt-3.5 flex flex-wrap gap-2 max-tablet:justify-center"
      >
        {artist.genres.map((genre, index) => (
          <li
            key={genre}
            className={cn(
              "rounded-pill px-3 py-1.5 text-[13px] font-bold",
              index === 0 ? "bg-pink text-navy" : "bg-fg/10 text-fg"
            )}
          >
            {genre}
          </li>
        ))}
      </ul>
      <Releases artist={artist} />
      <div className="mt-6 flex gap-10 max-tablet:justify-center max-tablet:gap-6">
        <Stat
          value={stats.monthlyListeners}
          label="monthly listeners"
          mark="spotify"
          source="Spotify"
          play={play}
        />
        <Stat
          value={stats.followers}
          label="followers"
          mark="spotify"
          source="Spotify"
          play={play}
        />
        <Stat
          value={stats.instagramFollowers}
          label="on Instagram"
          mark="instagram"
          source="Instagram"
          play={play}
        />
      </div>
    </div>
  );
}

// Step 3 (DESIGN.md, The record): the artist's record at stage size, bleeding off the left edge on a
// computer and whole on top on a phone, with who PopHatch found beside it.
function FoundScreen() {
  const { state, dispatch } = useOnboarding();
  const router = useRouter();
  const allowed = useStepGuard((current) => current.artist !== null);
  const artist = state.artist;

  function confirm() {
    dispatch({ type: "confirmed" });
    router.push("/connect");
  }

  function reject() {
    dispatch({ type: "rejected" });
    router.push("/");
  }

  return (
    <Stage rings="none">
      <TopBar current="confirm" done={["find"]} />
      {allowed && artist && (
        <main className="relative flex flex-1 flex-col justify-center pb-6 max-tablet:items-center max-tablet:pt-2 max-tablet:text-center">
          <div
            aria-hidden
            className="absolute top-1/2 -left-[300px] size-[760px] -translate-y-1/2 max-desktop:-left-[270px] max-desktop:size-[600px] max-tablet:relative max-tablet:top-0 max-tablet:left-0 max-tablet:mb-6 max-tablet:size-[300px] max-tablet:translate-y-0"
          >
            <BarRing className="absolute inset-0 size-full overflow-visible" />
            <Vinyl
              id="found"
              photo={artist.photo}
              className="absolute! inset-[16.25%]"
            />
          </div>
          <div className="relative ml-[470px] max-desktop:ml-[340px] max-tablet:ml-0 max-tablet:w-full">
            <Profile artist={artist} />
            <div className="mt-8 flex items-center gap-6 max-tablet:mt-8 max-tablet:flex-col max-tablet:gap-3.5">
              <Button
                onClick={confirm}
                className="min-h-13.5 min-w-60 px-7 text-[17px] font-extrabold max-tablet:min-h-12 max-tablet:w-full max-tablet:text-base"
              >
                That&apos;s me
              </Button>
              <Button variant="link" onClick={reject}>
                Not me
              </Button>
            </div>
          </div>
        </main>
      )}
    </Stage>
  );
}

export { FoundScreen };
