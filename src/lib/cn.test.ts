import { describe, expect, it } from "vitest";

import { cn } from "./cn";

describe("cn", () => {
  it("keeps a theme type size next to a text color", () => {
    expect(cn("text-caption", "text-navy")).toBe("text-caption text-navy");
  });

  it("keeps the halo next to a size and a color", () => {
    expect(cn("text-lead text-mist text-halo")).toBe(
      "text-lead text-mist text-halo"
    );
  });

  it("still lets a later size replace an earlier one", () => {
    expect(cn("text-caption", "text-body")).toBe("text-body");
  });
});
