import { levels } from "@/lib/motion";

type BarRingProps = {
  bars?: number;
  inner?: number;
  maxLength?: number;
  width?: number;
  seed?: number;
  colors?: string[];
  play?: boolean;
  className?: string;
};

function hex(color: string): number[] {
  return [1, 3, 5].map((start) =>
    Number.parseInt(color.slice(start, start + 2), 16)
  );
}

// A colour along a gradient of hex stops, for x from 0 to 1.
function along(colors: string[], x: number): string {
  const scaled = x * (colors.length - 1);
  const index = Math.min(colors.length - 2, Math.floor(scaled));
  const t = scaled - index;
  const a = hex(colors[index] ?? "#ffffff");
  const b = hex(colors[index + 1] ?? "#ffffff");
  return `rgb(${a.map((value, channel) => Math.round(value + ((b[channel] ?? value) - value) * t)).join(",")})`;
}

// One song's waveform wrapped round a circle, louder in the middle of the track, coloured from
// amber through pink to lime. The bars fade in round the circle once `play` turns true.
function BarRing({
  bars = 200,
  inner = 166,
  maxLength = 66,
  width = 3.6,
  seed = 23,
  colors = ["#ffb020", "#ff4fa3", "#d4ff3a"],
  play = true,
  className,
}: BarRingProps) {
  const values = levels(
    bars,
    seed,
    (x, value) => value * (0.5 + 0.5 * Math.sin(x * Math.PI))
  );
  return (
    <svg
      aria-hidden
      viewBox="-240 -240 480 480"
      className={className}
      overflow="visible"
    >
      {values.map((value, index) => {
        const x = index / bars;
        const length = 12 + value * maxLength;
        return (
          <rect
            key={index}
            transform={`rotate(${(x * 360).toFixed(2)})`}
            x={-width / 2}
            y={-(inner + length)}
            width={width}
            height={length}
            rx={width / 2}
            fill={along(colors, x)}
            style={{ animationDelay: `${index * 5}ms` }}
            className={
              play
                ? "animate-fade-in motion-reduce:animate-none"
                : "opacity-0 motion-reduce:opacity-100"
            }
          />
        );
      })}
    </svg>
  );
}

export { BarRing };
