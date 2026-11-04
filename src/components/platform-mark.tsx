import type { CSSProperties } from "react";

import { BRAND_PATHS } from "@/components/brand-paths";
import { cn } from "@/lib/cn";

type MarkKey =
  | "spotify"
  | "apple-music"
  | "instagram"
  | "tiktok"
  | "youtube"
  | "facebook"
  | "soundcloud"
  | "linktree"
  | "google-drive"
  | "onedrive"
  | "files"
  | "soundcharts";

type PlatformMarkProps = {
  mark: MarkKey;
  size?: number;
  muted?: boolean;
  className?: string;
};

// Each platform's own colour, used only for that platform: its tile, its segment of the meter.
const PLATFORM_COLORS: Record<MarkKey, string> = {
  spotify: "#1ed760",
  "apple-music": "#fa243c",
  instagram: "#e1306c",
  tiktok: "#25f4ee",
  youtube: "#ff0033",
  facebook: "#1877f2",
  soundcloud: "#ff5500",
  linktree: "#43e55e",
  "google-drive": "#4285f4",
  onedrive: "#0078d4",
  files: "#ffffff",
  soundcharts: "#d4ff3a",
};

const TILES: Record<MarkKey, string> = {
  spotify: "#1db954",
  "apple-music": "linear-gradient(180deg, #fb5c74, #fa233b)",
  instagram:
    "radial-gradient(circle at 30% 107%, #fdf497 0%, #fd5949 45%, #d6249f 60%, #285aeb 90%)",
  tiktok: "#000000",
  youtube: "#ff0033",
  facebook: "#0866ff",
  soundcloud: "#ff5500",
  linktree: "#43e55e",
  "google-drive": "#ffffff",
  onedrive: "#0078d4",
  files: "#ffffff",
  soundcharts: "#d4ff3a",
};

const ONEDRIVE =
  "M19 18H7a5 5 0 1 1 1.6-9.74A6 6 0 0 1 19.9 10.1 4 4 0 0 1 19 18z";

function Glyph({ mark }: { mark: MarkKey }) {
  if (mark === "soundcharts") {
    return (
      <svg viewBox="0 0 24 24" className="size-[52%] fill-navy">
        <rect x={3} y={12} width={3.5} height={9} rx={1} />
        <rect x={8.5} y={6} width={3.5} height={15} rx={1} />
        <rect x={14} y={9} width={3.5} height={12} rx={1} />
        <rect x={19.5} y={3} width={2} height={18} rx={1} />
      </svg>
    );
  }
  if (mark === "files") {
    return (
      <svg viewBox="0 0 24 24" className="size-[52%] fill-none stroke-klein">
        <path d="M12 19V5m0 0-6 6m6-6 6 6" strokeWidth={2.6} />
      </svg>
    );
  }
  const path = mark === "onedrive" ? ONEDRIVE : BRAND_PATHS[mark];
  return (
    <svg
      viewBox="0 0 24 24"
      className="size-[52%]"
      fill={mark === "google-drive" ? PLATFORM_COLORS[mark] : "#ffffff"}
    >
      <path d={path} />
    </svg>
  );
}

// A platform as the artist knows it: its mark on its own colour, in a round tile. Decorative
// everywhere it appears, because the platform's name is always written next to it.
function PlatformMark({
  mark,
  size = 34,
  muted = false,
  className,
}: PlatformMarkProps) {
  const style: CSSProperties = {
    width: size,
    height: size,
    background: TILES[mark],
  };
  return (
    <span
      aria-hidden
      data-mark={mark}
      style={style}
      className={cn(
        "inline-grid shrink-0 place-items-center rounded-full transition-[filter,opacity] duration-500",
        muted && "opacity-40 grayscale",
        className
      )}
    >
      <Glyph mark={mark} />
    </span>
  );
}

export { PLATFORM_COLORS, PlatformMark };
export type { MarkKey };
