import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import Home from "./page";

describe("the home page", () => {
  it("names the product in its one heading", () => {
    render(<Home />);
    expect(
      screen.getByRole("heading", { level: 1, name: "PopHatch" })
    ).toBeInTheDocument();
  });
});
