import { cn } from "cn";
import type * as React from "react";

// The Stage System's writing box: a pill at white 8% with a 1.5px border at 40%, 16px text so a
// phone never zooms in. A field that could not be saved keeps its text and shows aria-invalid.
function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "min-h-12 w-full min-w-0 rounded-pill border-[1.5px] border-fg/40 bg-fg/8 px-5 text-base text-fg outline-none placeholder:text-periwinkle/80 focus-visible:border-fg focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-fg disabled:opacity-60 aria-invalid:border-pink",
        className
      )}
      {...props}
    />
  );
}

export { Input };
