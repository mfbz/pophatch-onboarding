import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { levels, seeded, useCountUp, useInView } from "./motion";

function mockReducedMotion(reduce: boolean) {
  vi.stubGlobal(
    "matchMedia",
    vi.fn((query: string) => ({
      matches: reduce && query.includes("reduce"),
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }))
  );
}

describe("useCountUp", () => {
  beforeEach(() => {
    vi.useFakeTimers({
      toFake: ["requestAnimationFrame", "performance", "setTimeout"],
    });
  });
  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it("counts up to the target", () => {
    mockReducedMotion(false);
    const { result } = renderHook(() => useCountUp(18_400, true));
    expect(result.current).toBe(0);
    act(() => {
      vi.advanceTimersByTime(1200);
    });
    expect(result.current).toBe(18_400);
  });

  it("shows the target at once under reduced motion", () => {
    mockReducedMotion(true);
    const { result } = renderHook(() => useCountUp(18_400, true));
    expect(result.current).toBe(18_400);
  });

  it("moves from the last value to a new target", () => {
    mockReducedMotion(false);
    const { result, rerender } = renderHook(
      ({ target }) => useCountUp(target, true),
      { initialProps: { target: 20 } }
    );
    act(() => {
      vi.advanceTimersByTime(1200);
    });
    rerender({ target: 40 });
    act(() => {
      vi.advanceTimersByTime(100);
    });
    expect(result.current).toBeGreaterThan(20);
    act(() => {
      vi.advanceTimersByTime(1200);
    });
    expect(result.current).toBe(40);
  });
});

describe("useInView", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("is in view at once where IntersectionObserver is missing", () => {
    vi.stubGlobal("IntersectionObserver", undefined);
    const { result } = renderHook(() => useInView<HTMLDivElement>());
    expect(result.current[1]).toBe(true);
  });
});

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
