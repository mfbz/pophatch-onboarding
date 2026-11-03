import { cn } from "cn";

type StatusDotProps = { tone: "lime" | "amber" | "pink" | "muted" };

const TONES: Record<StatusDotProps["tone"], string> = {
  lime: "bg-lime",
  amber: "bg-amber",
  pink: "bg-pink",
  muted: "bg-fg/35",
};

// The Stage System's status dot: 8px, colour only. The words beside it carry the meaning, so it is
// hidden from screen readers.
function StatusDot({ tone }: StatusDotProps) {
  return (
    <span
      aria-hidden
      className={cn("inline-block size-2 shrink-0 rounded-pill", TONES[tone])}
    />
  );
}

export { StatusDot };
