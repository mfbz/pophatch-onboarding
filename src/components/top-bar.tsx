import Image from "next/image";

import { type FlowStage, Stepper } from "@/components/stepper";

type TopBarProps = { current: FlowStage; done: FlowStage[] };

// On a phone the mark stands alone so the stepper keeps its one line.
function TopBar({ current, done }: TopBarProps) {
  return (
    <header className="flex items-center justify-between gap-4 py-7 max-tablet:py-4">
      <div className="flex items-center gap-2.5">
        <Image
          src="/brand/logo-pearl.png"
          alt="PopHatch"
          width={36}
          height={36}
          preload
          className="size-9"
        />
        <span
          aria-hidden
          className="font-display text-wordmark font-bold text-fg max-tablet:hidden"
        >
          PopHatch
        </span>
      </div>
      <Stepper current={current} done={done} />
    </header>
  );
}

export { TopBar };
