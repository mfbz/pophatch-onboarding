import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { PLATFORM_COLORS, PlatformMark } from "./platform-mark";

describe("PlatformMark", () => {
  it("renders the mark's tile with its key, hidden from screen readers", () => {
    const { container } = render(<PlatformMark mark="instagram" />);
    const tile = container.querySelector('[data-mark="instagram"]');
    expect(tile).not.toBeNull();
    expect(tile).toHaveAttribute("aria-hidden", "true");
    expect(tile?.querySelector("svg path")).not.toBeNull();
  });

  it("greys out a muted mark", () => {
    const { container } = render(<PlatformMark mark="tiktok" muted />);
    expect(container.firstElementChild).toHaveClass("grayscale");
  });

  it("takes its size in pixels", () => {
    const { container } = render(<PlatformMark mark="spotify" size={20} />);
    expect(container.firstElementChild).toHaveStyle({
      width: "20px",
      height: "20px",
    });
  });

  it("has a colour for every platform the meter shows", () => {
    for (const mark of [
      "spotify",
      "instagram",
      "tiktok",
      "youtube",
      "facebook",
    ] as const) {
      expect(PLATFORM_COLORS[mark]).toMatch(/^#[0-9a-f]{6}$/i);
    }
  });
});
