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
  const link = state.link;

  useLayoutEffect(() => () => setFound([]), []);

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
      <main className="flex flex-1 flex-col items-center justify-center gap-9 pb-16 text-center max-tablet:gap-7">
        <div className="relative grid size-110 place-items-center max-tablet:size-72">
          <Rings
            hole={220}
            className="absolute top-1/2 left-1/2 -z-10 -translate-1/2 max-tablet:scale-[0.6545]"
          />
          <div className="relative size-90 animate-float motion-reduce:animate-none max-tablet:size-58">
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
        <div className="relative grid h-16 w-full place-items-center font-display text-status font-bold text-fg text-halo max-tablet:text-headline">
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
                    index === found.length - 1
                      ? "animate-line-in bg-halo px-14 py-3 motion-reduce:animate-none"
                      : "sr-only"
                  }
                >
                  Found you on {PLATFORM_NAMES[platform]}.
                </li>
              ))}
            </ul>
          </div>
        </div>
      </main>
    </Stage>
  );
}

export { FindingScreen };
