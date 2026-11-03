"use client";

import { cva } from "class-variance-authority";

// A choice pill (DESIGN.md, Components): off it is a secondary button, on it is lime with navy text
// and a leading ✓, the system's mark for a chosen control.
const toggleVariants = cva(
  "inline-flex min-h-11 cursor-pointer items-center justify-center rounded-pill border-[1.5px] border-fg/70 px-4.5 py-2.5 text-left text-[15px] font-bold text-fg transition-transform outline-none select-none hover:border-fg focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-fg active:scale-96 disabled:cursor-not-allowed disabled:opacity-60 data-[state=on]:border-lime data-[state=on]:bg-lime data-[state=on]:text-navy data-[state=on]:before:mr-1.5 data-[state=on]:before:content-['✓']"
);

export { toggleVariants };
