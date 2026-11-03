import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Stepper } from "./stepper";

describe("Stepper", () => {
  it("lists the four stages in order, without anything to press", () => {
    render(<Stepper current="confirm" done={["find"]} />);
    const list = screen.getByRole("list", { name: "Onboarding progress" });
    const items = within(list).getAllByRole("listitem");
    expect(items.map((item) => item.textContent)).toEqual([
      expect.stringContaining("Find you"),
      expect.stringContaining("Confirm"),
      expect.stringContaining("Connect"),
      expect.stringContaining("Enter"),
    ]);
    expect(screen.queryAllByRole("button")).toEqual([]);
  });

  it("marks the current stage and the done ones", () => {
    render(<Stepper current="confirm" done={["find"]} />);
    const [find, confirm, connect] = screen.getAllByRole("listitem");
    expect(confirm).toHaveAttribute("aria-current", "step");
    expect(find).not.toHaveAttribute("aria-current");
    expect(find).toHaveTextContent("✓");
    expect(within(find!).getByText("done", { exact: false })).toBeTruthy();
    expect(connect).not.toHaveTextContent("✓");
  });

  it("names the current stage and its position for a phone", () => {
    render(<Stepper current="connect" done={["find", "confirm"]} />);
    expect(screen.getByText("Connect · 3 of 4")).toBeInTheDocument();
  });
});
