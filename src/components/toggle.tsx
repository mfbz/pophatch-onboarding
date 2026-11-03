import { cva } from "class-variance-authority";

// A choice pill (DESIGN.md, Components): off it is a secondary button, on it is lime with navy text
// and a leading ✓, the system's mark for a chosen control. The ✓ has empty alt text because the
// pressed state already says it.
const toggleVariants = cva(
  "inline-flex cursor-pointer items-center justify-center min-h-12.5 rounded-pill border-2 border-fg/50 px-5 py-3 text-left text-[17px] leading-snug font-bold text-fg transition-transform outline-none select-none enabled:hover:border-fg focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-fg focus-visible:outline-solid active:scale-96 motion-reduce:transition-none motion-reduce:active:scale-100 disabled:cursor-not-allowed disabled:opacity-60 data-[state=on]:border-lime data-[state=on]:bg-lime data-[state=on]:text-navy data-[state=on]:before:mr-1.5 data-[state=on]:before:content-['✓'/'']"
);

export { toggleVariants };
