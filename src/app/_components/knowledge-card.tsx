"use client";

import Image from "next/image";
import type { CSSProperties } from "react";

import { knowledge } from "@/app/_lib/knowledge";
import { CONNECT_NAMES, CONNECT_PLATFORMS } from "@/app/_lib/mock-api";
import type { OnboardingState } from "@/app/_lib/onboarding-state";
import { PLATFORM_COLORS, PlatformMark } from "@/components/platform-mark";
import { StatusDot } from "@/components/status-dot";
import { cn } from "@/lib/cn";
import { useCountUp } from "@/lib/motion";

type KnowledgeCardProps = { state: OnboardingState };

// What each account adds to what PopHatch knows, said once it is connected.
const GIVES: Record<string, string> = {
  instagram: "where your fans are, when they're online",
  tiktok: "videos using your sounds, views",
  youtube: "watch time, most replayed songs",
  facebook: "events, fans near you",
};

function AccountLines({ state }: KnowledgeCardProps) {
  return (
    <div className="mt-5 grid gap-1 border-t border-hair-soft pt-4 max-tablet:hidden">
      {CONNECT_PLATFORMS.map(({ platform, available }) => {
        const connection = state.accounts[platform];
        const connected = connection?.status === "connected";
        const failed = connection?.status === "failed";
        return (
          <div
            key={platform}
            data-account={platform}
            className={cn(
              "flex items-center gap-3 rounded-thumb px-2 py-2 transition-colors duration-500",
              connected && "bg-lime/7",
              !available && "opacity-50"
            )}
          >
            <PlatformMark mark={platform} size={30} muted={!connected} />
            <div className="min-w-0 flex-1">
              <p className="text-[14px] leading-tight font-bold text-fg">
                {CONNECT_NAMES[platform]}
                {connected && connection.numbers && (
                  <span className="ml-2 font-mono text-[11.5px] font-medium text-lime">
                    {connection.numbers}
                  </span>
                )}
              </p>
              <p className="mt-0.5 text-[12.5px] leading-snug text-periwinkle">
                {!available ? (
                  "Coming soon"
                ) : connected && GIVES[platform] ? (
                  <span className="animate-fade-in motion-reduce:animate-none">
                    Gives me {GIVES[platform]}
                  </span>
                ) : failed ? (
                  <span className="inline-flex items-center gap-1.5">
                    <StatusDot tone="pink" />
                    Didn&apos;t answer
                  </span>
                ) : (
                  "Not connected"
                )}
              </p>
            </div>
            {connected && (
              <span
                aria-hidden
                className="grid size-6 animate-pop place-items-center rounded-full bg-lime text-[13px] font-extrabold text-navy motion-reduce:animate-none"
              >
                ✓
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}

// Step 4's portrait of the artist, filling in as each account connects: a fifth of the meter per
// source, the source's colour on its segment, a line in the manager's voice. On a phone it shrinks
// to a header above the accounts, and the numbers land in the rows instead.
function KnowledgeCard({ state }: KnowledgeCardProps) {
  const { percent, segments, line } = knowledge(state);
  const shown = useCountUp(percent, true, 900);
  const artist = state.artist;
  const listeners = artist?.stats.monthlyListeners.toLocaleString("en-US");

  return (
    <section
      aria-label="What PopHatch knows"
      className="overflow-hidden rounded-card bg-night/35 ring-1 ring-fg/10"
    >
      <div className="relative h-62.5 bg-klein max-tablet:hidden">
        {artist ? (
          <Image
            src={artist.photo}
            alt=""
            fill
            sizes="460px"
            className="animate-fade-in object-cover object-[50%_24%] mix-blend-luminosity brightness-[1.9] contrast-[1.15] motion-reduce:animate-none"
          />
        ) : (
          <div
            aria-hidden
            className="absolute top-[42%] left-1/2 grid size-28 -translate-1/2 place-items-center rounded-full border-2 border-dashed border-fg/35"
          >
            <Image
              src="/brand/logo-pearl.png"
              alt=""
              width={56}
              height={56}
              className="size-14 animate-float motion-reduce:animate-none"
            />
          </div>
        )}
        <div className="absolute inset-0 bg-linear-to-b from-[rgb(10_46_176/0)] from-35% to-[rgb(8_18_70/0.95)]" />
        <div className="absolute inset-x-6 bottom-5">
          <p className="font-mono text-[11px] tracking-[0.08em] text-lime uppercase">
            What PopHatch knows
          </p>
          {artist ? (
            <>
              <p className="mt-1 font-display text-[34px] leading-none font-bold tracking-[-0.03em] text-fg">
                {artist.name}
              </p>
              <p className="mt-1.5 text-[13px] text-mist">
                {artist.city} · {listeners} monthly listeners
              </p>
              <ul aria-label="Genres" className="mt-2.5 flex flex-wrap gap-1.5">
                {artist.genres.map((genre, index) => (
                  <li
                    key={genre}
                    className={cn(
                      "rounded-pill px-2.5 py-1 text-[11.5px] font-bold",
                      index === 0 ? "bg-pink text-navy" : "bg-fg/14 text-fg"
                    )}
                  >
                    {genre}
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <p className="mt-1 font-display text-[22px] leading-tight font-bold text-fg">
              Your card fills in as you connect.
            </p>
          )}
        </div>
      </div>

      <div className="p-6 max-tablet:p-4">
        <div className="flex items-center gap-3">
          <div className="relative hidden size-12 shrink-0 overflow-hidden rounded-full bg-fg/12 ring-2 ring-lime max-tablet:block">
            {artist && (
              <Image
                src={artist.photo}
                alt=""
                fill
                sizes="48px"
                className="object-cover"
              />
            )}
          </div>
          <div className="min-w-0 flex-1">
            {artist && (
              <p className="hidden font-display text-[18px] leading-tight font-bold text-fg max-tablet:block">
                {artist.name}
              </p>
            )}
            <p className="text-[13px] font-bold text-mist max-tablet:font-normal">
              How well I know you
            </p>
          </div>
          <p
            aria-hidden
            className="font-display text-[40px] leading-none font-bold tracking-[-0.04em] text-fg tabular-nums max-tablet:text-[30px]"
          >
            {shown}
            <span className="text-[0.55em] text-lime">%</span>
          </p>
        </div>

        <div
          role="meter"
          aria-label="How well I know you"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={percent}
          aria-valuetext={`${percent}%`}
          className="mt-4 grid grid-cols-5 gap-1.5"
        >
          {segments.map(({ mark, state: segment }) => (
            <div key={mark} data-segment={mark} data-state={segment}>
              <div className="h-2 overflow-hidden rounded-pill bg-fg/12">
                <div
                  style={{ "--fill": PLATFORM_COLORS[mark] } as CSSProperties}
                  className={cn(
                    "h-full w-full origin-left rounded-pill bg-(--fill) transition-transform duration-900 ease-stage motion-reduce:transition-none",
                    segment === "filled" ? "scale-x-100" : "scale-x-0"
                  )}
                />
              </div>
              <div className="mt-2 flex justify-center">
                <PlatformMark
                  mark={mark}
                  size={22}
                  muted={segment !== "filled"}
                  className={cn(
                    "transition-[filter,opacity] duration-500",
                    segment === "failed" &&
                      "opacity-100 ring-2 ring-pink grayscale-0"
                  )}
                />
              </div>
            </div>
          ))}
        </div>

        <p
          aria-live="polite"
          className="mt-4 text-[14.5px] leading-snug text-fg max-tablet:mt-3 max-tablet:text-[13.5px]"
        >
          {line}
        </p>

        <AccountLines state={state} />
      </div>
    </section>
  );
}

export { KnowledgeCard };
