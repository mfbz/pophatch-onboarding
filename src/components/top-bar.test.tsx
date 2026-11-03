import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { TopBar } from "./top-bar";

describe("TopBar", () => {
  it("links the logo back to the first step", () => {
    render(<TopBar current="connect" done={["find", "confirm"]} />);
    expect(
      screen.getByRole("link", { name: "PopHatch, back to the start" })
    ).toHaveAttribute("href", "/");
  });

  it("leaves the stepper out when there is nothing to track", () => {
    render(<TopBar />);
    expect(
      screen.queryByRole("list", { name: "Onboarding progress" })
    ).not.toBeInTheDocument();
  });
});
