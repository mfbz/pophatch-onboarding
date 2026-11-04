import { act, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { ReadLine, ReadingStep } from "@/app/_lib/mock-api";

import { ReadingPanel } from "./reading-panel";

const plan: ReadingStep[] = [
  { mark: "soundcharts", name: "SoundCharts" },
  { mark: "instagram", name: "Instagram" },
];

const lines: ReadLine[] = [
  { mark: "soundcharts", label: "SoundCharts", detail: "11 releases" },
  { mark: "instagram", label: "Instagram", detail: "312 posts" },
];

describe("ReadingPanel, compact", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it("opens again when a new reading starts after it folded", async () => {
    const { rerender } = render(
      <ReadingPanel plan={plan} lines={lines} done compact />
    );
    await act(async () => {
      await vi.advanceTimersByTimeAsync(1300);
    });
    expect(
      screen.getByRole("button", { name: /Read 2 sources/ })
    ).toHaveAttribute("aria-expanded", "false");
    rerender(<ReadingPanel plan={plan} lines={[]} done={false} compact />);
    expect(
      screen.getByRole("button", { name: /Reading SoundCharts/ })
    ).toHaveAttribute("aria-expanded", "true");
  });

  it("announces the reading outside its button", () => {
    render(<ReadingPanel plan={plan} lines={[]} done={false} compact />);
    const button = screen.getByRole("button", { name: /Reading SoundCharts/ });
    expect(button.querySelector("[aria-live]")).toBeNull();
    expect(screen.getByRole("status")).toHaveTextContent(
      "Reading SoundCharts · 1 of 2"
    );
  });
});
