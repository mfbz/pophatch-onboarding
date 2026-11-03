import { cn } from "@/lib/cn";
import { useId } from "react";
import type * as React from "react";

type StageProps = {
  children: React.ReactNode;
  rings?: "corner" | "bottom" | "none";
};

type RingsProps = {
  className?: string;
  hole?: number;
  pulse?: "loop" | "once";
};

// The prototype's rings: radius 110 to 710 in steps of 120, fading from 90% to 20%.
const RINGS = [0.9, 0.76, 0.62, 0.48, 0.34, 0.2].map((opacity, index) => ({
  r: 110 + index * 120,
  opacity,
}));

// The rings with the Stage System's two circles growing out of their center every 7.5s, the
// second 3.75s after the first. Under reduced motion the circles stay hidden. The center sits at
// the middle of the box, so a screen can center the rings on whatever it is about; `hole` keeps a
// disc of that radius clear, like the prototype's Klein disc behind the logo, on any background;
// `pulse="once"` sends the two circles out a single time, quickly, as a burst.
function Rings({ className, hole = 0, pulse = "loop" }: RingsProps) {
  const circle =
    pulse === "loop" ? "animate-stage-pulse" : "animate-ring-burst opacity-0";
  const id = useId();
  const mask = hole > 0 ? `rings-hole${id}` : undefined;
  return (
    <svg
      aria-hidden
      viewBox="-720 -720 1440 1440"
      className={cn("pointer-events-none size-[1440px] text-fg", className)}
    >
      {mask && (
        <mask id={mask}>
          <rect x={-720} y={-720} width={1440} height={1440} fill="white" />
          <circle r={hole} fill="black" />
        </mask>
      )}
      <g mask={mask && `url(#${mask})`}>
        {RINGS.map((ring) => (
          <circle
            key={ring.r}
            r={ring.r}
            fill="none"
            stroke="currentColor"
            strokeWidth={3}
            opacity={ring.opacity}
          />
        ))}
        <circle
          r={710}
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          className={`${circle} motion-reduce:hidden`}
        />
        <circle
          r={710}
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          className={`${circle} ${pulse === "loop" ? "[animation-delay:3.75s]" : "[animation-delay:0.35s]"} motion-reduce:hidden`}
        />
      </g>
    </svg>
  );
}

// The stage (DESIGN.md, Layout): the gradient, a patch of light, the rings in the top-right corner
// and the page, 52px in from the edges like the prototype. Each screen sets its own content inset.
// A screen whose cards fill the top passes rings="bottom", as the prototype's step 4 does; a screen
// that centers the rings on its own subject passes rings="none".
function Stage({ children, rings = "corner" }: StageProps) {
  return (
    <div className="relative isolate flex min-h-dvh flex-col overflow-clip bg-stage-gradient">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[1000px] overflow-hidden"
      >
        <div className="absolute inset-0 bg-[radial-gradient(640px_420px_at_92%_8%,rgb(255_255_255/0.13),transparent_70%)]" />
        {rings === "corner" && (
          <Rings className="absolute top-[-600px] right-[-610px] max-tablet:top-[-660px] max-tablet:right-[-690px] max-tablet:scale-60" />
        )}
        {rings === "bottom" && (
          <Rings className="absolute top-[260px] right-[-680px] max-tablet:top-[300px] max-tablet:right-[-760px] max-tablet:scale-60" />
        )}
      </div>
      <div className="flex w-full flex-1 flex-col px-13 pb-12 max-tablet:px-4 max-tablet:pb-8">
        {children}
      </div>
    </div>
  );
}

export { Rings, Stage };
