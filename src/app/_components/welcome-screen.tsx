"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";

import { useOnboarding } from "@/app/_lib/onboarding-provider";
import { useStepGuard } from "@/app/_lib/use-step-guard";
import { Button } from "@/components/button";
import { Rings, Stage } from "@/components/stage";
import { TopBar } from "@/components/top-bar";

// The five other finishes the logo flashes through before it lands on pearl, 0.3s apart.
const FINISHES = ["violet", "blue", "halftone", "chrome", "silver"];

const FLASH_DELAYS = [
  "[animation-delay:0s]",
  "[animation-delay:0.3s]",
  "[animation-delay:0.6s]",
  "[animation-delay:0.9s]",
  "[animation-delay:1.2s]",
];

// The arrival, where the app would open: the logo pops in and runs through its finishes once while
// the rings burst out from it, then it lands on pearl and the welcome and "Start over" rise in.
// Then everything stays still. Under reduced motion it all simply appears, on pearl.
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
        <main className="flex flex-1 flex-col items-center justify-center pb-16 text-center">
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
          <h1 className="mt-6 animate-line-in px-14 py-3 font-display text-title font-bold text-fg [animation-delay:1.9s] bg-halo text-halo motion-reduce:animate-none max-tablet:mt-4 max-tablet:px-4 max-tablet:text-page-title-phone">
            You&apos;re in, <span className="text-lime">{firstName}.</span>
          </h1>
          <p className="mt-1 animate-line-in px-14 py-3 text-lead text-mist [animation-delay:2.15s] bg-halo text-halo motion-reduce:animate-none max-tablet:px-4 max-tablet:text-lg">
            Your first plan is on its way.
          </p>
          <Button
            onClick={startOver}
            className="mt-8 min-h-13.5 min-w-60 animate-line-in px-7 text-[17px] font-extrabold [animation-delay:2.4s] motion-reduce:animate-none max-tablet:min-h-12 max-tablet:text-base"
          >
            Start over
          </Button>
        </main>
      )}
    </Stage>
  );
}

export { WelcomeScreen };
