import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { BarRing } from "./bar-ring";
import { Vinyl } from "./vinyl";
import { Waveform } from "./waveform";

describe("Vinyl", () => {
  it("prints the label round the record", () => {
    const { container } = render(<Vinyl id="t" photo="/artist/noor.jpg" />);
    expect(container.querySelector("textPath")?.textContent).toContain(
      "NOOR ADEYEMI · LANTERN · SIDE A · 33⅓ RPM"
    );
  });

  it("turns the disc but keeps the photo upright", () => {
    const { container } = render(<Vinyl id="t" photo="/artist/noor.jpg" />);
    const turning = container.querySelector(".animate-record");
    expect(turning).not.toBeNull();
    expect(turning?.querySelector("img")).toBeNull();
    expect(container.querySelector("img")).not.toBeNull();
  });

  it("draws the same grooves every time", () => {
    const a = render(<Vinyl id="same" photo="/artist/noor.jpg" />);
    const first = a.container.innerHTML;
    a.unmount();
    const b = render(<Vinyl id="same" photo="/artist/noor.jpg" />);
    expect(b.container.innerHTML).toBe(first);
  });
});

describe("Waveform and BarRing", () => {
  it("draws one bar per level", () => {
    const { container } = render(<Waveform bars={48} seed={19} />);
    expect(container.querySelectorAll("rect")).toHaveLength(48);
  });

  it("draws a ring of bars", () => {
    const { container } = render(<BarRing bars={200} seed={23} />);
    expect(container.querySelectorAll("rect")).toHaveLength(200);
  });
});
