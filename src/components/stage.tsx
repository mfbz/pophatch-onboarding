import type * as React from "react";

type StageProps = { children: React.ReactNode };

// The prototype's rings, centered off the top-right corner: radius 110 to 710 in steps of 120,
// fading from 90% to 20%.
const RINGS = [0.9, 0.76, 0.62, 0.48, 0.34, 0.2].map((opacity, index) => ({
  r: 110 + index * 120,
  opacity,
}));

// The stage (DESIGN.md, Layout): the gradient, a patch of light and the rings in the top-right
// corner, the content column, and the Stage System's two circles growing and fading every 7.5s, the second 3.75s after
// the first. The rings fade out under the top bar so its labels stay legible. Under reduced motion the circles stay still and hidden.
function Stage({ children }: StageProps) {
  return (
    <div className="relative isolate flex min-h-dvh flex-col overflow-x-clip bg-stage-gradient">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[1000px] overflow-hidden [mask-image:linear-gradient(to_bottom,transparent_24px,black_150px)]"
      >
        <div className="absolute inset-0 bg-[radial-gradient(640px_420px_at_92%_8%,rgb(255_255_255/0.13),transparent_70%)]" />
        <svg
          viewBox="-720 -720 1440 1440"
          className="absolute top-[-600px] right-[-610px] size-[1440px] text-fg max-tablet:top-[-660px] max-tablet:right-[-690px] max-tablet:scale-60"
        >
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
            className="animate-stage-pulse motion-reduce:hidden"
          />
          <circle
            r={710}
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            className="animate-stage-pulse [animation-delay:3.75s] motion-reduce:hidden"
          />
        </svg>
      </div>
      <div className="mx-auto flex w-full max-w-[1180px] flex-1 flex-col px-12 pb-12 max-tablet:px-4 max-tablet:pb-8">
        {children}
      </div>
    </div>
  );
}

export { Stage };
