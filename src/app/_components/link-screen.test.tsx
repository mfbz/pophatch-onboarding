import { render, screen, waitFor } from "@testing-library/react";
import { Activity } from "react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { EXAMPLE_LINKS } from "@/app/_lib/parse-link";
import { OnboardingProvider } from "@/app/_lib/onboarding-provider";
import {
  initialState,
  type OnboardingState,
} from "@/app/_lib/onboarding-state";

import { LinkScreen } from "./link-screen";

const push = vi.fn();

const router = { push };

vi.mock("next/navigation", () => ({ useRouter: () => router }));

function saved(): Partial<OnboardingState> {
  return JSON.parse(
    sessionStorage.getItem("pophatch-onboarding") ?? "{}"
  ) as Partial<OnboardingState>;
}

async function renderScreen(notice: "not-me" | "not-found" | null = null) {
  if (notice) {
    sessionStorage.setItem(
      "pophatch-onboarding",
      JSON.stringify({ ...initialState, notice })
    );
  }
  render(
    <OnboardingProvider>
      <LinkScreen />
    </OnboardingProvider>
  );
  // The provider reads saved progress after the first render.
  await waitFor(() => expect(saved()).toHaveProperty("path"));
}

describe("LinkScreen", () => {
  afterEach(() => {
    push.mockClear();
    sessionStorage.clear();
  });

  it("opens with the headline and the demo link ready to go", async () => {
    await renderScreen();
    expect(
      screen.getByRole("heading", {
        level: 1,
        name: "Noor, let's run your business.",
      })
    ).toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: "Your link" })).toHaveValue(
      EXAMPLE_LINKS.spotify
    );
  });

  it("says what went wrong when the text is not a link, and keeps it", async () => {
    const user = userEvent.setup();
    await renderScreen();
    const field = screen.getByRole("textbox", { name: "Your link" });
    await user.clear(field);
    await user.type(field, "noor adeyemi");
    await user.click(screen.getByRole("button", { name: "Find me" }));
    expect(
      screen.getByText(
        "That doesn't look like a link. Paste one from Spotify, Instagram, TikTok, YouTube, Apple Music, SoundCloud or Linktree."
      )
    ).toBeInTheDocument();
    expect(field).toHaveValue("noor adeyemi");
    expect(field).toHaveAttribute("aria-invalid", "true");
    expect(push).not.toHaveBeenCalled();
  });

  it("stores the link and moves on to the search, once", async () => {
    const user = userEvent.setup();
    await renderScreen();
    const findMe = screen.getByRole("button", { name: "Find me" });
    await user.click(findMe);
    await user.click(findMe);
    expect(findMe).toBeDisabled();
    expect(push).toHaveBeenCalledTimes(1);
    expect(push).toHaveBeenCalledWith("/finding");
    expect(saved().link).toBe(EXAMPLE_LINKS.spotify);
  });

  it("is ready again when the artist comes back to it", async () => {
    const user = userEvent.setup();
    const { rerender } = render(
      <OnboardingProvider>
        <Activity mode="visible">
          <LinkScreen />
        </Activity>
      </OnboardingProvider>
    );
    await waitFor(() => expect(saved()).toHaveProperty("path"));
    await user.click(screen.getByRole("button", { name: "Find me" }));
    for (const mode of ["hidden", "visible"] as const) {
      rerender(
        <OnboardingProvider>
          <Activity mode={mode}>
            <LinkScreen />
          </Activity>
        </OnboardingProvider>
      );
    }
    expect(screen.getByRole("button", { name: "Find me" })).toBeEnabled();
  });

  it("fills in an example link for any platform", async () => {
    const user = userEvent.setup();
    await renderScreen();
    await user.click(
      screen.getByRole("button", { name: "Use a TikTok example" })
    );
    expect(screen.getByRole("textbox", { name: "Your link" })).toHaveValue(
      EXAMPLE_LINKS.tiktok
    );
    expect(
      screen.getAllByRole("button", { name: /^Use a .+ example$/ })
    ).toHaveLength(7);
  });

  it("offers the one-by-one path", async () => {
    const user = userEvent.setup();
    await renderScreen();
    await user.click(
      screen.getByRole("button", {
        name: "No link? Connect your pages one by one",
      })
    );
    expect(saved().path).toBe("manual");
    expect(push).toHaveBeenCalledWith("/connect");
  });

  it.each([
    [
      "not-me",
      "Not you? Try a different link, or connect your pages one by one.",
    ],
    [
      "not-found",
      "We couldn't find you from that link. Try another one, or connect your pages one by one.",
    ],
  ] as const)(
    "explains a return after %s with an empty, focused field",
    async (notice, line) => {
      await renderScreen(notice);
      expect(await screen.findByText(line)).toBeInTheDocument();
      const field = screen.getByRole("textbox", { name: "Your link" });
      expect(field).toHaveValue("");
      expect(field).toHaveFocus();
    }
  );
});
