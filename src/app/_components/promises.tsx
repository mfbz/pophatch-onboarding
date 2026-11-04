"use client";

import Image from "next/image";
import type { CSSProperties } from "react";

import { type MarkKey, PlatformMark } from "@/components/platform-mark";
import { Waveform } from "@/components/waveform";
import { useInView } from "@/lib/motion";
import { cn } from "@/lib/cn";

type PictureProps = { play: boolean };

type Disc = {
  size: number;
  grooves: [string, string];
  label: string;
  inset?: string;
  hole?: number;
  // Where the record ends up once it slides out: x and y in px, then the turn in degrees.
  to: [number, number, number];
};

type Orb = {
  mark: MarkKey;
  size: number;
  x: number;
  y: number;
  chip?: string;
};

// The crate, back to front: a black LP, a pink LP, an amber 10", a lime 7" with its wide hole.
const DISCS: Disc[] = [
  {
    size: 170,
    grooves: ["#0c1442", "#151e5a"],
    label: "var(--color-klein)",
    to: [150, 40, -32],
  },
  {
    size: 190,
    grooves: ["rgb(255 79 163 / 0.92)", "rgb(214 40 130 / 0.92)"],
    label: "var(--color-navy)",
    to: [0, 0, 0],
  },
  {
    size: 150,
    grooves: ["rgb(255 176 32 / 0.95)", "rgb(225 140 10 / 0.95)"],
    label: "#ffffff",
    to: [118, 0, 96],
  },
  {
    size: 116,
    grooves: ["#dff86a", "#c5e52a"],
    label: "var(--color-navy)",
    inset: "30%",
    hole: 30,
    to: [60, 6, -56],
  },
];

// Her world round her: the platforms she is on, two of them with a number already.
const ORBS: Orb[] = [
  { mark: "spotify", size: 64, x: 0.18, y: 0.24, chip: "18.4k listeners" },
  { mark: "instagram", size: 52, x: 0.83, y: 0.2, chip: "4,120 fans" },
  { mark: "tiktok", size: 42, x: 0.86, y: 0.78 },
  { mark: "youtube", size: 46, x: 0.13, y: 0.8 },
  { mark: "apple-music", size: 34, x: 0.5, y: 0.06 },
];

const NOW = 0.3;

const TICKS = [
  ["−1 mo", 4],
  ["Now", 30],
  ["+1", 54],
  ["+2", 76],
  ["+3", 96],
] as const;

const PROMISES = [
  {
    kicker: "The experience",
    title: "Knows the business",
    body: "Fifteen years inside the biggest labels, now on your side.",
    Picture: Crate,
  },
  {
    kicker: "Your world",
    title: "Knows you",
    body: "Your streams, your fans, your releases, your money.",
    Picture: Orbit,
  },
  {
    kicker: "The plan",
    title: "Decides what's next",
    body: "What to do this week, and whether it worked.",
    Picture: PlanTimeline,
  },
];

// Fifteen years of records, sliding out of the crate and fanning out once in view.
function Crate({ play }: PictureProps) {
  return (
    <>
      <div className="absolute inset-x-0 bottom-0 h-55">
        {DISCS.map((disc, index) => {
          const style: CSSProperties = {
            width: disc.size,
            height: disc.size,
            bottom: index === 0 ? 6 : 0,
            background: `repeating-radial-gradient(circle, ${disc.grooves[0]} 0 2px, ${disc.grooves[1]} 2px 4px)`,
            transform: play
              ? `translate(${disc.to[0]}px, ${-disc.to[1]}px) rotate(${disc.to[2]}deg)`
              : "none",
            transitionDelay: `${80 + index * 90}ms`,
          };
          return (
            <div
              key={disc.size}
              style={style}
              className="absolute left-0 rounded-full shadow-[0_24px_40px_-18px_#000] transition-transform duration-1100 ease-stage motion-reduce:transition-none"
            >
              <span className="absolute inset-0 rounded-full bg-[conic-gradient(from_200deg,transparent_0_20%,rgb(255_255_255/0.22)_26%,transparent_33%_70%,rgb(255_255_255/0.14)_76%,transparent_83%)]" />
              <span
                style={{ inset: disc.inset ?? "34%", background: disc.label }}
                className="absolute rounded-full shadow-[0_0_0_3px_rgb(255_255_255/0.15)]"
              />
              <span
                style={{ width: disc.hole ?? 8, height: disc.hole ?? 8 }}
                className="absolute top-1/2 left-1/2 z-10 -translate-1/2 rounded-full bg-klein"
              />
            </div>
          );
        })}
      </div>
      <p className="absolute top-0 right-0 z-10 text-right">
        <span className="block font-display text-[130px] leading-[0.8] font-bold tracking-[-0.06em] text-fg">
          15
        </span>
        <span className="font-mono text-[11px] tracking-[0.04em] text-periwinkle uppercase">
          years inside the
          <br />
          biggest labels
        </span>
      </p>
    </>
  );
}

// The artist at the centre of her own platforms.
function Orbit({ play }: PictureProps) {
  return (
    <div className="absolute inset-0">
      <svg
        aria-hidden
        viewBox="0 0 360 270"
        preserveAspectRatio="none"
        className="absolute inset-0 size-full overflow-visible"
      >
        {[78, 112, 150].map((r, index) => (
          <ellipse
            key={r}
            cx={180}
            cy={135}
            rx={r * 1.25}
            ry={r * 0.85}
            fill="none"
            stroke="#ffffff"
            strokeOpacity={0.35 - index * 0.09}
            strokeWidth={1.5}
            vectorEffect="non-scaling-stroke"
          />
        ))}
      </svg>
      <div className="absolute top-1/2 left-1/2 size-29 -translate-1/2 rounded-full bg-lime p-1.5">
        <Image
          src="/artist/noor.jpg"
          alt=""
          width={104}
          height={104}
          className="size-full rounded-full object-cover"
        />
      </div>
      {ORBS.map((orb, index) => (
        <div key={orb.mark}>
          <div
            style={{
              left: `${orb.x * 100}%`,
              top: `${orb.y * 100}%`,
              transitionDelay: `${200 + index * 130}ms`,
            }}
            className={cn(
              "absolute -translate-1/2 transition-transform duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)] motion-reduce:transition-none",
              play ? "scale-100" : "scale-0"
            )}
          >
            <PlatformMark
              mark={orb.mark}
              size={orb.size}
              className="shadow-[0_8px_22px_-10px_rgb(0_0_0/0.7)]"
            />
          </div>
          {orb.chip && (
            <span
              style={{
                left: `${orb.x * 100}%`,
                top: `calc(${orb.y * 100}% + ${orb.size / 2 + 16}px)`,
                transitionDelay: `${900 + index * 150}ms`,
              }}
              className={cn(
                "absolute -translate-1/2 rounded-pill bg-fg px-2.5 py-1 text-xs font-bold whitespace-nowrap text-navy transition-opacity duration-400 motion-reduce:transition-none",
                play ? "opacity-100" : "opacity-0"
              )}
            >
              {orb.chip}
            </span>
          )}
        </div>
      ))}
    </div>
  );
}

// The plan as a song: what's done, this week in lime, what's planned in pink, and this week's move.
function PlanTimeline({ play }: PictureProps) {
  return (
    <div className="absolute inset-0">
      <div className="absolute top-0 right-0 flex gap-3 font-mono text-[11px] tracking-[0.04em] text-periwinkle uppercase">
        {[
          ["Done", "bg-fg/50"],
          ["This week", "bg-lime"],
          ["Planned", "bg-pink"],
        ].map(([name, color]) => (
          <span key={name} className="flex items-center gap-1.5">
            <i className={cn("inline-block size-2 rounded-[2px]", color)} />
            {name}
          </span>
        ))}
      </div>
      <span
        style={{ left: `${NOW * 100 + 1}%` }}
        className={cn(
          "absolute bottom-51.5 -translate-x-1/2 rounded-pill bg-lime px-2.75 py-1.25 text-xs font-bold whitespace-nowrap text-navy transition-[opacity,translate] delay-700 duration-600 ease-[cubic-bezier(0.34,1.56,0.64,1)] after:absolute after:top-full after:left-1/2 after:h-3 after:w-0.5 after:bg-lime motion-reduce:transition-none",
          play ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"
        )}
      >
        This week
      </span>
      <Waveform
        bars={48}
        seed={19}
        grow
        play={play}
        shape={(x, value) =>
          value * (0.45 + 0.55 * Math.exp(-Math.pow((x - NOW) * 5, 2)))
        }
        fill={(x) =>
          Math.abs(x - NOW) < 0.045
            ? "var(--color-lime)"
            : x < NOW
              ? "rgb(255 255 255 / 0.5)"
              : "rgb(255 79 163 / 0.75)"
        }
        className="absolute inset-x-0 bottom-23 h-26 w-full"
      />
      <div className="absolute inset-x-0 bottom-17.5 h-3.5 font-mono text-[11px] tracking-[0.04em] text-periwinkle uppercase">
        {TICKS.map(([tick, left]) => (
          <span
            key={tick}
            style={{ left: `${left}%` }}
            className="absolute -translate-x-1/2 whitespace-nowrap"
          >
            {tick}
          </span>
        ))}
      </div>
      <div
        className={cn(
          "absolute inset-x-0 bottom-0 flex items-center gap-3 rounded-cover bg-fg/8 px-3 py-2.5 transition-[opacity,translate] delay-1000 duration-500 ease-stage motion-reduce:transition-none",
          play ? "translate-y-0 opacity-100" : "translate-y-2.5 opacity-0"
        )}
      >
        <Image
          src="/artist/cover-lantern.jpg"
          alt=""
          width={42}
          height={42}
          className="size-10.5 shrink-0 rounded-lg object-cover"
        />
        <div className="min-w-0">
          <b className="block text-sm leading-tight text-fg">
            Pitch &ldquo;Lantern&rdquo; to 3 playlists
          </b>
          <span className="text-[12.5px] text-periwinkle">
            Saves are up 40% since Friday
          </span>
        </div>
        <em className="ml-auto shrink-0 font-mono text-[11px] font-bold text-lime not-italic">
          → DO
        </em>
      </div>
    </div>
  );
}

type PromiseItemProps = (typeof PROMISES)[number];

// One promise: its picture plays once it is in view, on its own, so a phone that shows them one
// under the other plays each as the artist reaches it.
function PromiseItem({ kicker, title, body, Picture }: PromiseItemProps) {
  const [ref, play] = useInView<HTMLLIElement>();
  return (
    <li
      ref={ref}
      className="flex flex-col desktop:px-8.5 desktop:first:pl-0 desktop:last:pr-0 desktop:[&+&]:border-l desktop:[&+&]:border-fg/12"
    >
      <div aria-hidden className="relative mb-5.5 h-67.5 max-w-[420px]">
        <Picture play={play} />
      </div>
      <p className="mb-2 font-mono text-[11px] tracking-[0.04em] text-lime uppercase">
        {kicker}
      </p>
      <h2 className="mb-1.5 font-display text-headline font-bold text-fg">
        {title}
      </h2>
      <p className="text-[15.5px] text-periwinkle">{body}</p>
    </li>
  );
}

// The three promises (DESIGN.md, The promises): pictures instead of cards, divided by hairlines on
// a computer and stacked on a phone.
function Promises() {
  return (
    <ul className="grid max-w-[1180px] gap-y-10 desktop:grid-cols-3 desktop:gap-y-0">
      {PROMISES.map((promise) => (
        <PromiseItem key={promise.title} {...promise} />
      ))}
    </ul>
  );
}

export { Promises };
