"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";

import type { Artist } from "@/app/_lib/mock-api";
import { useOnboarding } from "@/app/_lib/onboarding-provider";
import { useStepGuard } from "@/app/_lib/use-step-guard";
import { Button } from "@/components/button";
import { Rings, Stage } from "@/components/stage";
import { TopBar } from "@/components/top-bar";

type ArtistCardProps = { artist: Artist };

function count(value: number): string {
  return value.toLocaleString("en-US");
}

function ArtistCard({ artist }: ArtistCardProps) {
  const { stats } = artist;
  return (
    <>
      <p className="mt-1 px-12 py-1.5 font-display text-name font-bold text-fg bg-halo text-halo max-tablet:text-headline">
        {artist.name}
      </p>
      <p className="mt-1 px-12 py-1.5 text-lead text-mist bg-halo text-halo max-tablet:text-xl">
        {artist.city}
      </p>
      <ul
        aria-label="Releases"
        tabIndex={0}
        className="mt-5.5 flex w-full snap-x scroll-px-4 gap-4 overflow-x-auto pb-2 outline-none focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-fg focus-visible:outline-solid max-tablet:-mx-4 max-tablet:w-[calc(100%+2rem)] max-tablet:px-4 tablet:justify-center"
      >
        {artist.releases.map((release) => (
          <li key={release.title} className="shrink-0 snap-start">
            <Image
              src={release.cover}
              alt={release.title}
              width={100}
              height={100}
              className="size-25 rounded-cover object-cover shadow-cover"
            />
            <p
              aria-hidden
              className="mt-2 text-caption font-semibold text-fg text-halo"
            >
              {release.title}
            </p>
          </li>
        ))}
      </ul>
      <p className="mt-3.5 rounded-pill bg-fg/12 px-5.5 py-2.5 text-base font-semibold text-fg backdrop-blur-sm max-tablet:text-caption">
        {count(stats.releases)} releases · {count(stats.monthlyListeners)}{" "}
        monthly listeners · {count(stats.followers)} followers on Spotify
      </p>
    </>
  );
}

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
        <main className="flex flex-1 flex-col items-center pt-2.5 text-center max-tablet:pt-2">
          <div className="relative">
            <Rings
              hole={100}
              className="absolute top-1/2 left-1/2 -z-10 -translate-1/2 max-tablet:scale-75"
            />
            <div className="rounded-full bg-lime p-2">
              <Image
                src={artist.photo}
                alt=""
                width={184}
                height={184}
                preload
                className="size-46 rounded-full object-cover max-tablet:size-32"
              />
            </div>
          </div>
          <h1 className="mt-1 px-14 py-2.5 font-display text-hero font-bold text-fg bg-halo text-halo max-tablet:text-page-title">
            Found <span className="text-lime">you.</span>
          </h1>
          <ArtistCard artist={artist} />
          <div className="mt-5.5 flex w-full max-w-70 flex-col items-center gap-3.5 max-tablet:mt-auto max-tablet:max-w-none max-tablet:pt-8">
            <Button
              size="wide"
              onClick={confirm}
              className="min-h-13.5 text-[17px] font-extrabold max-tablet:text-base"
            >
              That&apos;s me
            </Button>
            <Button variant="link" onClick={reject}>
              Not me
            </Button>
          </div>
        </main>
      )}
    </Stage>
  );
}

export { FoundScreen };
