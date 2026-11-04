import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Stepper } from "./stepper";

describe("Stepper", () => {
  it("lists the four stages in order, with nothing to press ahead", () => {
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
    expect(screen.getAllByRole("link")).toHaveLength(1);
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

  it("shows every stage done, and none current, on arrival", () => {
    render(
      <Stepper current={null} done={["find", "confirm", "connect", "enter"]} />
    );
    for (const item of screen.getAllByRole("listitem")) {
      expect(item).toHaveTextContent("✓");
      expect(item).not.toHaveAttribute("aria-current");
    }
  });

  it("joins the stages with lines, lit up to the current one", () => {
    const { container } = render(
      <Stepper current="connect" done={["find", "confirm"]} />
    );
    const lines = Array.from(container.querySelectorAll("[data-line]"));
    expect(lines.map((line) => line.getAttribute("data-line"))).toEqual([
      "lit",
      "lit",
      "dim",
    ]);
  });

  it("lights no line before the stages behind it are done", () => {
    const { container } = render(<Stepper current="connect" done={[]} />);
    const lines = Array.from(container.querySelectorAll("[data-line]"));
    expect(lines.map((line) => line.getAttribute("data-line"))).toEqual([
      "dim",
      "dim",
      "dim",
    ]);
  });

  it("names the current stage and its position for a phone", () => {
    render(<Stepper current="connect" done={["find", "confirm"]} />);
    const connect = screen.getByRole("listitem", { current: "step" });
    expect(connect).toHaveTextContent("Connect · 3 of 4");
  });

  it("takes a done stage back to its page, and leaves the others plain", () => {
    render(<Stepper current="connect" done={["find", "confirm"]} />);
    expect(screen.getByRole("link", { name: /Find you/ })).toHaveAttribute(
      "href",
      "/"
    );
    expect(screen.getByRole("link", { name: /Confirm/ })).toHaveAttribute(
      "href",
      "/found"
    );
    expect(screen.getAllByRole("link")).toHaveLength(2);
  });

  it("takes Enter back to the goal once it is done", () => {
    render(
      <Stepper current={null} done={["find", "confirm", "connect", "enter"]} />
    );
    expect(screen.getByRole("link", { name: /Connect/ })).toHaveAttribute(
      "href",
      "/connect"
    );
    expect(screen.getByRole("link", { name: /Enter/ })).toHaveAttribute(
      "href",
      "/together"
    );
  });
});
