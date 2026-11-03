import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "cn";
import { Slot } from "radix-ui";
import type * as React from "react";

// The Stage System's three buttons (DESIGN.md, Components). Hover changes only the lime (to 90%)
// or the secondary border (to 100%); pressing shrinks any button to 96%,
// unless the artist asked for reduced motion.
const buttonVariants = cva(
  "inline-flex min-h-10 shrink-0 cursor-pointer items-center justify-center gap-1.5 rounded-pill text-sm font-bold whitespace-nowrap transition-transform outline-none select-none focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-fg focus-visible:outline-solid active:scale-96 motion-reduce:transition-none motion-reduce:active:scale-100 disabled:cursor-not-allowed disabled:opacity-60 disabled:active:scale-100 max-tablet:min-h-11",
  {
    variants: {
      variant: {
        primary: "bg-lime px-4.5 py-2.5 text-navy enabled:hover:bg-lime/90",
        secondary:
          "border-[1.5px] border-fg/70 px-4.5 py-2.5 text-fg enabled:hover:border-fg",
        link: "px-1 text-periwinkle underline underline-offset-4",
      },
      size: {
        default: "",
        wide: "min-h-12 w-full",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  }
);

function Button({
  className,
  variant = "primary",
  size = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot.Root : "button";

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
