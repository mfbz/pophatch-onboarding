import { describe, expect, it } from "vitest";

import { levels, seeded } from "./levels";

describe("seeded", () => {
  it("gives the same numbers for the same seed", () => {
    const a = seeded(7);
    const b = seeded(7);
    expect([a(), a(), a()]).toEqual([b(), b(), b()]);
  });

  it("levels are rounded, so every browser draws the bars the server drew", () => {
    const values = levels(48, 19, (x, value) => value * Math.exp(-x));
    for (const value of values) {
      expect(Math.round(value * 1000) / 1000).toBe(value);
    }
  });

  it("levels stay between 0 and 1", () => {
    const values = levels(48, 19);
    expect(values).toHaveLength(48);
    expect(values.every((v) => v >= 0 && v <= 1)).toBe(true);
  });
});
