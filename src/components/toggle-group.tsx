"use client";

import { cn } from "@/lib/cn";
import { ToggleGroup as ToggleGroupPrimitive } from "radix-ui";
import type * as React from "react";

import { toggleVariants } from "@/components/toggle";

function ToggleGroup({
  className,
  ...props
}: React.ComponentProps<typeof ToggleGroupPrimitive.Root>) {
  return (
    <ToggleGroupPrimitive.Root
      data-slot="toggle-group"
      className={cn("flex flex-wrap gap-3", className)}
      {...props}
    />
  );
}

function ToggleGroupItem({
  className,
  ...props
}: React.ComponentProps<typeof ToggleGroupPrimitive.Item>) {
  return (
    <ToggleGroupPrimitive.Item
      data-slot="toggle-group-item"
      className={cn(toggleVariants(), className)}
      {...props}
    />
  );
}

export { ToggleGroup, ToggleGroupItem };
