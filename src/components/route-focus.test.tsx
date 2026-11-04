import { act, render } from "@testing-library/react";
import { Activity, StrictMode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { RouteFocus } from "./route-focus";

let pathname = "/";

vi.mock("next/navigation", () => ({ usePathname: () => pathname }));

function Pages({ at }: { at: "/" | "/found" }) {
  return (
    <>
      <RouteFocus />
      <Activity mode={at === "/" ? "visible" : "hidden"}>
        <h1>Noor, let&apos;s run your business.</h1>
        <button type="button">Find me</button>
      </Activity>
      <Activity mode={at === "/found" ? "visible" : "hidden"}>
        <h1>Found you.</h1>
        <button type="button">That&apos;s me</button>
      </Activity>
    </>
  );
}

async function frame() {
  await act(async () => {
    await vi.advanceTimersByTimeAsync(20);
  });
}

describe("RouteFocus", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    pathname = "/";
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it("leaves focus alone on the first page", async () => {
    render(<Pages at="/" />);
    await frame();
    expect(document.body).toHaveFocus();
  });

  it("leaves focus alone on the first page when effects run twice", async () => {
    render(
      <StrictMode>
        <Pages at="/" />
      </StrictMode>
    );
    await frame();
    expect(document.body).toHaveFocus();
  });

  it("leaves focus alone when a step sends a fresh load to the start", async () => {
    pathname = "/found";
    const { rerender } = render(<Pages at="/found" />);
    pathname = "/";
    rerender(<Pages at="/" />);
    await frame();
    expect(document.body).toHaveFocus();
  });

  it("moves to the heading after a click that left focus nowhere", async () => {
    const { rerender, getByRole } = render(<Pages at="/" />);
    getByRole("button", { name: "Find me" }).dispatchEvent(
      new Event("pointerdown", { bubbles: true })
    );
    pathname = "/found";
    rerender(<Pages at="/found" />);
    await frame();
    expect(getByRole("heading", { name: "Found you." })).toHaveFocus();
  });

  it("moves focus left on a hidden page to the new page's heading", async () => {
    const { rerender, getByRole } = render(<Pages at="/" />);
    getByRole("button", { name: "Find me" }).focus();
    pathname = "/found";
    rerender(<Pages at="/found" />);
    await frame();
    expect(getByRole("heading", { name: "Found you." })).toHaveFocus();
  });

  it("keeps focus a page has placed itself", async () => {
    const { rerender, getByRole } = render(<Pages at="/" />);
    pathname = "/found";
    rerender(<Pages at="/found" />);
    getByRole("button", { name: "That's me" }).focus();
    await frame();
    expect(getByRole("button", { name: "That's me" })).toHaveFocus();
  });
});
