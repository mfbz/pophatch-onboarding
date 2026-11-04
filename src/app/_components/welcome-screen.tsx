"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { useOnboarding } from "@/app/_lib/onboarding-provider";
import type { OnboardingState } from "@/app/_lib/onboarding-state";
import { useStepGuard } from "@/app/_lib/use-step-guard";
import { Button } from "@/components/button";
import { Rings, Stage } from "@/components/stage";
import { TopBar } from "@/components/top-bar";
import { useReducedMotion } from "@/lib/motion";

type GoalCardProps = {
  goal: NonNullable<OnboardingState["goal"]>;
  cover: string | undefined;
  startOver: () => void;
};

// Each preset goal as the line PopHatch will plan around.
const GOAL_LINES: Record<string, string> = {
  "My next release landing": "Get your next release heard",
  "More shows, better rooms": "Book more shows, in better rooms",
  "A bigger fanbase": "Grow the fanbase you already have",
  "Making money from this": "Make your music pay",
  "Getting noticed by playlists, press and bookers":
    "Get in front of playlists, press and bookers",
};

// The five other finishes the logo flashes through before it lands on pearl, 0.3s apart.
const FINISHES = ["violet", "blue", "halftone", "chrome", "silver"];

// When the goal card has docked: its 2.6s delay plus the 0.8s dock.
const DOCKED_AFTER = 3400;

const FLASH_DELAYS = [
  "[animation-delay:0s]",
  "[animation-delay:0.3s]",
  "[animation-delay:0.6s]",
  "[animation-delay:0.9s]",
  "[animation-delay:1.2s]",
];

// The goal the first plan is built around, docked at the bottom like a now-playing bar, with the
// cover of the artist's latest release. A written goal is quoted in the artist's own words. Until
// it has docked it is inert, so "Start over" can't be reached while it is still invisible. On a
// phone it sits under the welcome instead of over it, its button on a row of its own.
function GoalCard({ goal, cover, startOver }: GoalCardProps) {
  const reduced = useReducedMotion();
  const [docked, setDocked] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setDocked(true), DOCKED_AFTER);
    return () => clearTimeout(timer);
  }, []);
  const line =
    goal.kind === "preset"
      ? (GOAL_LINES[goal.value] ?? goal.value)
      : `\u201c${goal.value}\u201d`;
  return (
    <section
      aria-label="Your goal"
      inert={!docked && !reduced}
      className="absolute inset-x-0 bottom-0 mx-auto flex w-[min(880px,100%)] animate-dock items-center gap-4 rounded-[22px] bg-night/65 px-3.5 py-3 text-left ring-1 ring-fg/14 backdrop-blur-lg [animation-delay:2.6s] motion-reduce:animate-none max-tablet:relative max-tablet:mt-10 max-tablet:flex-wrap max-tablet:gap-3 max-tablet:px-3"
    >
      {cover && (
        <Image
          src={cover}
          alt=""
          width={54}
          height={54}
          className="size-13.5 shrink-0 rounded-[10px] object-cover max-tablet:size-12"
        />
      )}
      <div className="min-w-0 flex-1">
        <p className="font-mono text-[10.5px] tracking-widest text-lime uppercase">
          Your goal · next three months
        </p>
        <p className="mt-0.5 text-[15px] leading-snug font-bold wrap-break-word text-fg">
          {line}
        </p>
        <p className="text-[13px] text-periwinkle max-tablet:text-xs">
          Your first plan is built around it.
        </p>
      </div>
      <Button
        onClick={startOver}
        className="shrink-0 px-4.5 font-extrabold max-tablet:w-full"
      >
        Start over
      </Button>
    </section>
  );
}

// The arrival, where the app would open: the logo pops in and runs through its finishes once while
// the rings burst out from it, then it lands on pearl, the welcome rises in and the goal docks at
// the bottom. Then everything stays still. Under reduced motion it all simply appears, on pearl.
// "Start over" clears the flow so anyone trying it can run it again.
function WelcomeScreen() {
  const { state, dispatch } = useOnboarding();
  const router = useRouter();
  const allowed = useStepGuard(
    (current) => current.goal !== null && current.artist !== null
  );
  const firstName = state.artist?.name.split(" ")[0];

  function startOver() {
    dispatch({ type: "reset" });
    router.push("/");
  }

  return (
    <Stage rings="none">
      <TopBar />
      {allowed && firstName && (
        <main className="relative flex flex-1 flex-col items-center justify-center pb-32 text-center max-tablet:justify-start max-tablet:pt-10 max-tablet:pb-6">
          <div className="relative grid size-110 place-items-center max-tablet:size-72">
            <div className="absolute top-1/2 left-1/2 -z-10 -translate-1/2">
              <div className="animate-rings-in motion-reduce:animate-none">
                <Rings
                  hole={220}
                  pulse="once"
                  className="max-tablet:scale-[0.6545]"
                />
              </div>
            </div>
            <div className="relative size-90 animate-pop motion-reduce:animate-none max-tablet:size-58">
              {FINISHES.map((logo, index) => (
                <Image
                  key={logo}
                  src={`/brand/logo-${logo}.png`}
                  alt=""
                  width={360}
                  height={360}
                  className={`absolute inset-0 size-full animate-flash object-contain opacity-0 ${FLASH_DELAYS[index]} motion-reduce:animate-none`}
                />
              ))}
              <Image
                src="/brand/logo-pearl.png"
                alt="PopHatch"
                width={360}
                height={360}
                preload
                className="absolute inset-0 size-full animate-fade-in object-contain [animation-delay:1.45s] motion-reduce:animate-none"
              />
            </div>
          </div>
          <h1 className="mt-6 animate-line-in bg-halo px-14 py-3 font-display text-title font-bold text-fg [animation-delay:1.9s] text-halo motion-reduce:animate-none max-tablet:mt-4 max-tablet:px-4 max-tablet:text-page-title-phone">
            You&apos;re in, <span className="text-lime">{firstName}.</span>
          </h1>
          <p className="mt-1 animate-line-in bg-halo px-14 py-3 text-lead text-mist [animation-delay:2.15s] text-halo motion-reduce:animate-none max-tablet:px-4 max-tablet:text-lg">
            Your first plan is on its way.
          </p>
          {state.goal && (
            <GoalCard
              goal={state.goal}
              cover={state.artist?.releases[0]?.cover}
              startOver={startOver}
            />
          )}
        </main>
      )}
    </Stage>
  );
}

export { WelcomeScreen };
