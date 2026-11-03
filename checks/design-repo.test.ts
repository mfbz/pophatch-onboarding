import { describe, expect, it } from "vitest";
import { parse } from "yaml";

import { readRepoFile } from "./repo";

// The Stage System's colors, verbatim. DESIGN.md and the theme must both carry exactly these, so a
// token changed in one place and not the other fails here instead of drifting on screen.
const STAGE_COLORS: Record<string, string> = {
  klein: "#0A2EB0",
  navy: "#0A1B66",
  night: "#060C2A",
  lime: "#D4FF3A",
  pink: "#FF4FA3",
  amber: "#FFB020",
  fg: "#FFFFFF",
  mist: "#D6DEFF",
  periwinkle: "#C7D2FF",
  hair: "rgba(255, 255, 255, 0.26)",
  "hair-soft": "rgba(255, 255, 255, 0.14)",
  glass: "rgba(255, 255, 255, 0.07)",
};

function designColors(): Record<string, string> {
  const front = /^---\n([\s\S]*?)\n---/.exec(readRepoFile("DESIGN.md"));
  const data = parse(front?.[1] ?? "") as { colors?: Record<string, string> };
  return data.colors ?? {};
}

describe("the design system", () => {
  it("DESIGN.md front matter carries every Stage System color", () => {
    expect(designColors()).toEqual(STAGE_COLORS);
  });

  it("globals.css defines every DESIGN.md color as a CSS variable", () => {
    // Prettier lowercases hex in CSS, and hex is case-insensitive, so compare without case.
    const css = readRepoFile("src", "app", "globals.css").toLowerCase();
    const missing = Object.entries(designColors()).filter(
      ([name, value]) =>
        !css.includes(`--color-${name}: ${value};`.toLowerCase())
    );
    expect(missing).toEqual([]);
  });
});
