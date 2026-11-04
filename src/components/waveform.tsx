import type { CSSProperties } from "react";

import { levels } from "@/lib/levels";

type WaveformProps = {
  bars: number;
  seed: number;
  shape?: (x: number, value: number) => number;
  fill?: (x: number) => string;
  grow?: boolean;
  play?: boolean;
  className?: string;
};

const BAR = 4;
const GAP = 2;
const HEIGHT = 40;

// A song drawn as bars, centred on a line. With `grow`, the bars rise from the line one after
// another once `play` turns true; until then they lie flat, so nothing shifts when they rise.
function Waveform({
  bars,
  seed,
  shape,
  fill = () => "rgb(255 255 255 / 0.3)",
  grow = false,
  play = true,
  className,
}: WaveformProps) {
  const width = bars * (BAR + GAP) - GAP;
  return (
    <svg
      aria-hidden
      viewBox={`0 0 ${width} ${HEIGHT}`}
      preserveAspectRatio="none"
      className={className}
    >
      {levels(bars, seed, shape).map((value, index) => {
        const height = Math.max(2, value * HEIGHT);
        const style: CSSProperties = grow
          ? {
              transformBox: "fill-box",
              transformOrigin: "center",
              transform: play ? undefined : "scaleY(0.04)",
              animationDelay: `${index * 7}ms`,
            }
          : {};
        return (
          <rect
            key={index}
            x={index * (BAR + GAP)}
            y={(HEIGHT - height) / 2}
            width={BAR}
            height={height}
            rx={2}
            fill={fill(index / bars)}
            style={style}
            className={
              grow && play
                ? "animate-bar-grow transition-[fill] duration-500 motion-reduce:animate-none"
                : "transition-[fill] duration-500"
            }
          />
        );
      })}
    </svg>
  );
}

export { Waveform };
