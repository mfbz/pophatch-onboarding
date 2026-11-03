import { act, render, screen } from "@testing-library/react";
import { Activity } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { OnboardingProvider } from "@/app/_lib/onboarding-provider";
import {
  initialState,
  type OnboardingState,
} from "@/app/_lib/onboarding-state";

import { FindingScreen } from "./finding-screen";

const replace = vi.fn();

const router = { replace };

vi.mock("next/navigation", () => ({ useRouter: () => router }));

function saved(): Partial<OnboardingState> {
  return JSON.parse(
    sessionStorage.getItem("pophatch-onboarding") ?? "{}"
  ) as Partial<OnboardingState>;
}

async function renderWithLink(link: string | null) {
  sessionStorage.setItem(
    "pophatch-onboarding",
    JSON.stringify({ ...initialState, link })
  );
  render(
    <OnboardingProvider>
      <FindingScreen />
    </OnboardingProvider>
  );
  await act(async () => {
    await vi.advanceTimersByTimeAsync(0);
  });
}

describe("FindingScreen", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
    replace.mockClear();
    sessionStorage.clear();
  });

  it("reports each platform as it is found, then shows who it found", async () => {
    await renderWithLink("https://open.spotify.com/artist/5kZ2nooradeyemi");
    expect(
      screen.getByRole("heading", { level: 1, name: "Getting to know you." })
    ).toBeInTheDocument();
    const log = screen.getByRole("status");
    expect(log).toHaveAttribute("aria-live", "polite");

    await act(async () => {
      await vi.advanceTimersByTimeAsync(1600);
    });
    expect(log).toHaveTextContent("Found you on Spotify.");
    expect(log).not.toHaveTextContent("Instagram");

    await act(async () => {
      await vi.advanceTimersByTimeAsync(5000);
    });
    expect(log.textContent).toBe(
      "Found you on Spotify.Found you on Instagram.Found you on YouTube.Found you on TikTok."
    );
    expect(saved().artist?.name).toBe("Noor Adeyemi");
    expect(replace).toHaveBeenCalledWith("/found");
  });

  it("starts the list over when the screen is shown again", async () => {
    sessionStorage.setItem(
      "pophatch-onboarding",
      JSON.stringify({
        ...initialState,
        link: "https://open.spotify.com/artist/5kZ2nooradeyemi",
      })
    );
    const tree = (mode: "visible" | "hidden") => (
      <OnboardingProvider>
        <Activity mode={mode}>
          <FindingScreen />
        </Activity>
      </OnboardingProvider>
    );
    const { rerender } = render(tree("visible"));
    await act(async () => {
      await vi.advanceTimersByTimeAsync(2500);
    });
    rerender(tree("hidden"));
    rerender(tree("visible"));
    expect(screen.getByRole("status")).toHaveTextContent("");
    await act(async () => {
      await vi.advanceTimersByTimeAsync(6000);
    });
    expect(screen.getByRole("status").textContent).toBe(
      "Found you on Spotify.Found you on Instagram.Found you on YouTube.Found you on TikTok."
    );
  });

  it("sends the artist back to the start when the link finds no one", async () => {
    await renderWithLink("https://open.spotify.com/artist/not-found");
    await act(async () => {
      await vi.advanceTimersByTimeAsync(5000);
    });
    expect(saved().notice).toBe("not-found");
    expect(replace).toHaveBeenCalledWith("/");
    expect(replace).not.toHaveBeenCalledWith("/found");
  });

  it("sends the artist to the start without a link", async () => {
    await renderWithLink(null);
    expect(replace).toHaveBeenCalledWith("/");
  });
});
