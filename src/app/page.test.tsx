import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import Home from "./page";

describe("the home page", () => {
  it("opens on its one heading", () => {
    render(<Home />);
    expect(
      screen.getByRole("heading", { level: 1, name: "One link to start." })
    ).toBeInTheDocument();
  });
});
