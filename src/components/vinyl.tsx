import Image from "next/image";

import { seeded } from "@/lib/levels";
import { cn } from "@/lib/cn";

type VinylProps = {
  id: string;
  photo: string;
  label?: string;
  base?: string;
  deep?: string;
  className?: string;
};

const LABEL = "NOOR ADEYEMI · LANTERN · SIDE A · 33⅓ RPM · ";

// The grooves: fine dark rings with faint light ones between, and four wider gaps between tracks.
function Grooves({ id }: { id: string }) {
  const random = seeded(id.length * 97 + 7);
  const dark: number[] = [];
  const light: number[] = [];
  for (let r = 43.5; r < 97.6; r += 0.7) dark.push(r);
  for (let r = 43.8; r < 97.6; r += 1.4) light.push(r);
  return (
    <g fill="none">
      {dark.map((r) => (
        <circle
          key={`d${r}`}
          r={r.toFixed(2)}
          stroke={`rgba(0,0,0,${(0.08 + random() * 0.16).toFixed(3)})`}
          strokeWidth={0.4}
        />
      ))}
      {light.map((r) => (
        <circle
          key={`l${r}`}
          r={r.toFixed(2)}
          stroke={`rgba(255,255,255,${(0.025 + random() * 0.05).toFixed(3)})`}
          strokeWidth={0.28}
        />
      ))}
      {[56, 67, 77, 88].map((r) => (
        <g key={`g${r}`}>
          <circle r={r} stroke="rgba(0,0,0,.32)" strokeWidth={1.5} />
          <circle
            r={r + 0.95}
            stroke="rgba(255,255,255,.12)"
            strokeWidth={0.45}
          />
        </g>
      ))}
    </g>
  );
}

// The artist's record (DESIGN.md, The record): an amber vinyl with grooves and track gaps, its navy
// label printed round the edge, her photo in the middle. The disc spins in, then turns once every
// 30 seconds; the photo stays upright. Under reduced motion it is still.
function Vinyl({
  id,
  photo,
  label = LABEL,
  base = "#ffb020",
  deep = "#d98a00",
  className,
}: VinylProps) {
  return (
    <div
      className={cn(
        "relative aspect-square rounded-full shadow-[0_40px_80px_-30px_#000,0_0_90px_rgb(255_176_32/0.28)]",
        className
      )}
    >
      <div className="absolute inset-0 animate-record motion-reduce:animate-none">
        <svg
          aria-hidden
          viewBox="-100 -100 200 200"
          className="block size-full"
        >
          <defs>
            <radialGradient id={`vinyl-${id}`}>
              <stop offset="0" stopColor={base} />
              <stop offset=".72" stopColor={base} />
              <stop offset="1" stopColor={deep} />
            </radialGradient>
            <path
              id={`label-${id}`}
              d="M 0,-37.4 a 37.4,37.4 0 1,1 0,74.8 a 37.4,37.4 0 1,1 0,-74.8"
            />
          </defs>
          <circle r={100} fill={`url(#vinyl-${id})`} />
          <Grooves id={id} />
          <circle
            r={99.4}
            fill="none"
            stroke="rgba(255,255,255,.35)"
            strokeWidth={0.6}
          />
          <circle r={43} fill="none" stroke="rgba(0,0,0,.35)" strokeWidth={1} />
          <circle r={42.2} className="fill-navy" />
          <text className="fill-lime font-mono" fontSize={4.2} fontWeight={500}>
            <textPath
              href={`#label-${id}`}
              textLength={233}
              lengthAdjust="spacing"
            >
              {label + label}
            </textPath>
          </text>
        </svg>
      </div>
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-full bg-[conic-gradient(from_205deg,transparent_0_6%,rgb(255_255_255/0.26)_11%,transparent_17%_53%,rgb(255_255_255/0.16)_59%,transparent_65%)] mix-blend-screen [mask:radial-gradient(circle_closest-side,transparent_0_42.4%,#000_42.8%)]"
      />
      <div className="absolute inset-[33%] overflow-hidden rounded-full shadow-[0_0_0_1px_rgb(212_255_58/0.8)]">
        <Image
          src={photo}
          alt=""
          fill
          sizes="(max-width: 860px) 120px, 280px"
          className="object-cover"
        />
      </div>
      <div
        aria-hidden
        className="absolute top-1/2 left-1/2 size-[4.4%] -translate-1/2 rounded-full bg-night shadow-[0_0_0_1.5px_rgb(255_255_255/0.55)]"
      />
    </div>
  );
}

export { Vinyl };
