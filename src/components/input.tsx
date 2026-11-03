import { cn } from "@/lib/cn";
import type * as React from "react";

// The prototype's writing box: a white pill with navy text, 17px (16px on a phone, so it never
// zooms in). A field that could not be saved keeps its text and shows aria-invalid.
function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "min-h-15 w-full min-w-0 rounded-pill bg-fg px-6.5 text-[17px] text-navy shadow-card outline-none placeholder:text-navy/60 focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-fg focus-visible:outline-solid disabled:opacity-60 aria-invalid:outline-2 aria-invalid:outline-pink aria-invalid:outline-solid max-tablet:px-5 max-tablet:text-base",
        className
      )}
      {...props}
    />
  );
}

export { Input };
