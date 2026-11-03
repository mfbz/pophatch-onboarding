import Image from "next/image";
import Link from "next/link";

import { type FlowStage, Stepper } from "@/components/stepper";

type TopBarProps = { current?: FlowStage | null; done?: FlowStage[] };

// On a phone the mark stands alone so the stepper keeps its one line. The logo goes back to step 1
// and clears nothing. Without `done` there is no stepper: the arrival has nothing left to track.
function TopBar({ current, done }: TopBarProps) {
  return (
    <header className="flex items-center justify-between gap-4 py-7 max-tablet:py-4">
      <Link
        href="/"
        aria-label="PopHatch, back to the start"
        className="flex items-center gap-2.5 rounded-pill outline-none focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-fg focus-visible:outline-solid"
      >
        <Image
          src="/brand/logo-pearl.png"
          alt=""
          width={38}
          height={38}
          preload
          className="size-9.5"
        />
        <span
          aria-hidden
          className="font-display text-wordmark font-bold text-fg text-halo max-tablet:hidden"
        >
          PopHatch
        </span>
      </Link>
      {done && <Stepper current={current ?? null} done={done} />}
    </header>
  );
}

export { TopBar };
