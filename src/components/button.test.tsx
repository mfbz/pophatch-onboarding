import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Button } from "./button";

describe("Button", () => {
  it("is the Stage System's primary button by default", () => {
    render(<Button>Find me</Button>);
    expect(screen.getByRole("button", { name: "Find me" })).toHaveAttribute(
      "data-variant",
      "primary"
    );
  });

  it("offers the secondary and link variants", () => {
    render(
      <>
        <Button variant="secondary">Connect</Button>
        <Button variant="link">Not me</Button>
      </>
    );
    expect(screen.getByRole("button", { name: "Connect" })).toHaveAttribute(
      "data-variant",
      "secondary"
    );
    expect(screen.getByRole("button", { name: "Not me" })).toHaveAttribute(
      "data-variant",
      "link"
    );
  });

  it("can be disabled", () => {
    render(<Button disabled>Enter</Button>);
    expect(screen.getByRole("button", { name: "Enter" })).toBeDisabled();
  });
});
