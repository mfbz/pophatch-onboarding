"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useLayoutEffect, useState } from "react";

import {
  type FoundOn,
  resolveLink,
  searchPlatforms,
} from "@/app/_lib/mock-api";
import { useOnboarding } from "@/app/_lib/onboarding-provider";
import { PLATFORM_NAMES } from "@/app/_lib/parse-link";
import { useStepGuard } from "@/app/_lib/use-step-guard";
import { PlatformMark } from "@/components/platform-mark";
import { Rings, Stage } from "@/components/stage";
import { TopBar } from "@/components/top-bar";

// The six looks of the logo, in the order they take turns (2s each, a 12s cycle).
const LOGOS = ["pearl", "violet", "blue", "halftone", "chrome", "silver"];

const DELAYS = [
  "[animation-delay:0s]",
  "[animation-delay:2s]",
  "[animation-delay:4s]",
  "[animation-delay:6s]",
  "[animation-delay:8s]",
  "[animation-delay:10s]",
];

type Spot = { x: number; y: number; size: number };

// Where each platform lands round the logo, in the order the search reports them: px from the
// centre and the mark's size, one set for a computer and one for a phone, so no mark covers the
// logo, another mark or the line under the logo.
const SPOTS: { desk: Spot; phone: Spot }[] = [
  {
    desk: { x: -390, y: -150, size: 100 },
    phone: { x: -100, y: -138, size: 58 },
  },
  { desk: { x: 390, y: -190, size: 76 }, phone: { x: 100, y: -150, size: 48 } },
  { desk: { x: 400, y: 70, size: 64 }, phone: { x: 96, y: 168, size: 42 } },
  { desk: { x: -380, y: 110, size: 58 }, phone: { x: -96, y: 172, size: 40 } },
];

// How long "That's all of you." stays before "Found you" takes over.
const SETTLE = 700;

// Step 2 moves on by itself: it resolves the link, reports each platform as the search finds it
// (one line at a time on screen, the whole list for a screen reader),
// then replaces itself with step 3, so going back from step 3 skips the search. A link that finds
// no one returns to step 1 with a line saying so. The list empties when Next hides this page
// (Activity) and each run rebuilds it from the start, so a second search never shows the first.
function FindingScreen() {
  const { state, dispatch } = useOnboarding();
  const router = useRouter();
  const allowed = useStepGuard((current) => current.link !== null);
  const [found, setFound] = useState<FoundOn[]>([]);
  const [complete, setComplete] = useState(false);
  const link = state.link;

  useLayoutEffect(
    () => () => {
      setFound([]);
      setComplete(false);
    },
    []
  );

  useEffect(() => {
    if (!allowed || link === null) return;
    let cancelled = false;
    const reported: FoundOn[] = [];

    async function search(url: string) {
      const result = await resolveLink(url);
      if (cancelled) return;
      if (result.status === "not-found") {
        dispatch({ type: "notFound" });
        router.replace("/");
        return;
      }
      for await (const place of searchPlatforms(result.artist.id)) {
        if (cancelled) return;
        reported.push(place);
        setFound([...reported]);
      }
      if (cancelled) return;
      setComplete(true);
      await new Promise((resolve) => setTimeout(resolve, SETTLE));
      if (cancelled) return;
      dispatch({ type: "found", artist: result.artist });
      router.replace("/found");
    }

    void search(link);
    return () => {
      cancelled = true;
    };
    // The search runs once per link; `found` would restart it on every platform it reports.
  }, [allowed, link, dispatch, router]);

  return (
    <Stage rings="none">
      <TopBar current="find" done={[]} />
      <main className="flex flex-1 flex-col items-center justify-center pb-16 text-center max-tablet:pb-10 max-tablet:[@media(max-height:520px)]:pb-0">
        {/* On a phone held sideways the search shrinks to fit the screen, so the line under the logo stays in view. */}
        <div className="relative h-150 w-full max-tablet:h-125 max-tablet:[@media(max-height:520px)]:-my-23.75 max-tablet:[@media(max-height:520px)]:scale-[0.62]">
          <div className="absolute top-1/2 left-1/2 grid size-110 -translate-1/2 place-items-center max-tablet:size-72">
            <Rings
              hole={150}
              className="absolute top-1/2 left-1/2 -z-10 -translate-1/2 max-tablet:scale-[0.6545]"
            />
            <div className="relative size-65 animate-float motion-reduce:animate-none max-tablet:size-40">
              {LOGOS.map((logo, index) => (
                <Image
                  key={logo}
                  src={`/brand/logo-${logo}.png`}
                  alt=""
                  width={360}
                  height={360}
                  preload={index === 0}
                  className={`absolute inset-0 size-full animate-logo-cycle object-contain opacity-0 ${DELAYS[index]} motion-reduce:animate-none ${index === 0 ? "motion-reduce:opacity-100" : ""}`}
                />
              ))}
            </div>
          </div>
          {found.map(({ platform, detail }, index) => {
            const spot = SPOTS[index % SPOTS.length];
            if (!spot) return null;
            return (
              <div
                key={platform}
                aria-hidden
                data-found={platform}
                style={
                  {
                    "--x": `${spot.desk.x}px`,
                    "--y": `${spot.desk.y}px`,
                    "--size": `${spot.desk.size}px`,
                    "--px": `${spot.phone.x}px`,
                    "--py": `${spot.phone.y}px`,
                    "--psize": `${spot.phone.size}px`,
                  } as React.CSSProperties
                }
                className="absolute top-[calc(50%+var(--y))] left-[calc(50%+var(--x))] max-tablet:top-[calc(50%+var(--py))] max-tablet:left-[calc(50%+var(--px))]"
              >
                <span className="absolute top-0 left-0 size-30 animate-ping-ring rounded-full border-2 border-fg opacity-0 motion-reduce:hidden" />
                <div className="-translate-1/2">
                  <div className="animate-pop motion-reduce:animate-none">
                    <PlatformMark
                      mark={platform}
                      size={100}
                      className="size-(--size)! shadow-[0_8px_22px_-10px_rgb(0_0_0/0.7)] max-tablet:size-(--psize)!"
                    />
                  </div>
                  <p className="absolute top-[calc(100%+6px)] left-1/2 -translate-x-1/2 animate-fade-in text-[12.5px] leading-tight font-semibold whitespace-nowrap text-fg text-halo motion-reduce:animate-none">
                    {PLATFORM_NAMES[platform]}
                    <span className="block font-mono text-[10.5px] font-medium text-lime">
                      {detail}
                    </span>
                  </p>
                </div>
              </div>
            );
          })}
          <div className="absolute top-[calc(50%+150px)] left-1/2 grid w-full -translate-x-1/2 place-items-center font-display text-status font-bold text-fg text-halo max-tablet:top-[calc(50%+92px)] max-tablet:text-[22px]">
            <h1
              className={
                found.length > 0
                  ? "sr-only"
                  : "col-start-1 row-start-1 animate-line-in bg-halo px-14 py-3 motion-reduce:animate-none"
              }
            >
              Getting to know you.
            </h1>
            <div
              role="status"
              aria-live="polite"
              className="col-start-1 row-start-1"
            >
              <ul>
                {found.map(({ platform }, index) => (
                  <li
                    key={platform}
                    className={
                      index === found.length - 1 && !complete
                        ? "animate-line-in bg-halo px-14 py-3 motion-reduce:animate-none max-tablet:px-4"
                        : "sr-only"
                    }
                  >
                    Found you on{" "}
                    <span className="text-lime">
                      {PLATFORM_NAMES[platform]}
                    </span>
                    .
                  </li>
                ))}
                {complete && (
                  <li className="animate-line-in bg-halo px-14 py-3 motion-reduce:animate-none max-tablet:px-4">
                    That&apos;s <span className="text-lime">all of you</span>.
                  </li>
                )}
              </ul>
            </div>
          </div>
        </div>
      </main>
    </Stage>
  );
}

export { FindingScreen };
