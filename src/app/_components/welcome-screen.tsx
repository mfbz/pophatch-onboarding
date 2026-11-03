"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";

import { useOnboarding } from "@/app/_lib/onboarding-provider";
import { stageProgress } from "@/app/_lib/onboarding-state";
import { useStepGuard } from "@/app/_lib/use-step-guard";
import { Button } from "@/components/button";
import { Rings, Stage } from "@/components/stage";
import { TopBar } from "@/components/top-bar";

// The arrival: the flat PopHatch mark large at the center of the rings, where the app would open.
// "Start over" clears the flow so anyone trying it can run it again.
function WelcomeScreen() {
  const { state, dispatch } = useOnboarding();
  const router = useRouter();
  const allowed = useStepGuard((current) => current.goal !== null);
  const progress = stageProgress(state, "/welcome");
  const firstName = state.artist?.name.split(" ")[0] ?? "Noor";

  function startOver() {
    router.push("/");
    dispatch({ type: "reset" });
  }

  return (
    <Stage rings="none">
      <TopBar current={progress.current} done={progress.done} />
      {allowed && (
        <main className="flex flex-1 flex-col items-center justify-center pb-10 text-center">
          <div className="relative grid size-70 place-items-center max-tablet:size-44">
            <Rings className="absolute top-1/2 left-1/2 -z-10 -translate-1/2 max-tablet:scale-75" />
            <Image
              src="/brand/mark.svg"
              alt="PopHatch"
              width={280}
              height={282}
              preload
              unoptimized
              className="size-full object-contain"
            />
          </div>
          <h1 className="mt-14 font-display text-page-title font-bold text-fg max-tablet:mt-10 max-tablet:text-page-title-phone">
            You&apos;re in, <span className="text-lime">{firstName}.</span>
          </h1>
          <p className="mt-4 text-xl text-mist max-tablet:text-lg">
            Your first plan is on its way.
          </p>
          <Button variant="link" onClick={startOver} className="mt-10">
            Start over
          </Button>
        </main>
      )}
    </Stage>
  );
}

export { WelcomeScreen };
