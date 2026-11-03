"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useLayoutEffect, useState } from "react";

import { resolveLink, searchPlatforms } from "@/app/_lib/mock-api";
import { useOnboarding } from "@/app/_lib/onboarding-provider";
import { PLATFORM_NAMES, type Platform } from "@/app/_lib/parse-link";
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

// Step 2 moves on by itself: it resolves the link, reports each platform as the search finds it,
// then replaces itself with step 3, so going back from step 3 skips the search. A link that finds
// no one returns to step 1 with a line saying so. The list empties when Next hides this page
// (Activity) and each run rebuilds it from the start, so a second search never shows the first.
function FindingScreen() {
  const { state, dispatch } = useOnboarding();
  const router = useRouter();
  const allowed = useStepGuard((current) => current.link !== null);
  const [found, setFound] = useState<Platform[]>([]);
  const link = state.link;

  useLayoutEffect(() => () => setFound([]), []);

  useEffect(() => {
    if (!allowed || link === null) return;
    let cancelled = false;
    const reported: Platform[] = [];

    async function search(url: string) {
      const result = await resolveLink(url);
      if (cancelled) return;
      if (result.status === "not-found") {
        dispatch({ type: "notFound" });
        router.replace("/");
        return;
      }
      for await (const platform of searchPlatforms(result.artist.id)) {
        if (cancelled) return;
        reported.push(platform);
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
      <main className="relative flex flex-1 flex-col items-center justify-center pb-10 text-center">
        <div className="relative grid size-72 place-items-center max-tablet:size-52">
          <Rings className="absolute top-1/2 left-1/2 -z-10 -translate-1/2 max-tablet:scale-75" />
          {LOGOS.map((logo, index) => (
            <Image
              key={logo}
              src={`/brand/logo-${logo}.png`}
              alt=""
              width={288}
              height={288}
              preload={index === 0}
              className={`absolute inset-0 size-full animate-logo-cycle object-contain opacity-0 ${DELAYS[index]} motion-reduce:animate-none ${index === 0 ? "motion-reduce:opacity-100" : ""}`}
            />
          ))}
        </div>
        <h1 className="mt-14 font-display text-page-title font-bold text-fg max-tablet:mt-10 max-tablet:text-page-title-phone">
          Getting to know you.
        </h1>
        <div role="status" aria-live="polite" className="mt-5 min-h-32">
          <ul className="flex flex-col items-center gap-1.5 text-lg text-mist">
            {found.map((platform) => (
              <li key={platform}>Found you on {PLATFORM_NAMES[platform]}.</li>
            ))}
          </ul>
        </div>
      </main>
    </Stage>
  );
}

export { FindingScreen };
