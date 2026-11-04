import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { ArtistSchema } from "@/app/_lib/mock-api";
import { DEMO_ARTIST } from "@/app/_lib/mock-data";
import { OnboardingProvider } from "@/app/_lib/onboarding-provider";
import {
  initialState,
  type OnboardingState,
} from "@/app/_lib/onboarding-state";

import { FoundScreen } from "./found-screen";

const push = vi.fn();
const replace = vi.fn();
const router = { push, replace };

vi.mock("next/navigation", () => ({ useRouter: () => router }));

function saved(): Partial<OnboardingState> {
  return JSON.parse(
    sessionStorage.getItem("pophatch-onboarding") ?? "{}"
  ) as Partial<OnboardingState>;
}

function renderWith(state: Partial<OnboardingState>) {
  sessionStorage.setItem(
    "pophatch-onboarding",
    JSON.stringify({ ...initialState, ...state })
  );
  render(
    <OnboardingProvider>
      <FoundScreen />
    </OnboardingProvider>
  );
}

const withArtist = {
  link: "https://open.spotify.com/artist/5kZ2nooradeyemi",
  artist: ArtistSchema.parse(DEMO_ARTIST),
};

describe("FoundScreen", () => {
  afterEach(() => {
    push.mockClear();
    replace.mockClear();
    sessionStorage.clear();
  });

  it("shows who PopHatch found", async () => {
    renderWith(withArtist);
    expect(
      await screen.findByRole("heading", { level: 1, name: "Found you." })
    ).toBeInTheDocument();
    expect(screen.getByText("Noor Adeyemi")).toBeInTheDocument();
    expect(screen.getByText("Atlanta, GA")).toBeInTheDocument();
    for (const title of [
      "Lantern",
      "Lowlight",
      "Grove",
      "Slow Water",
      "Early Hours",
    ]) {
      expect(screen.getByRole("img", { name: title })).toBeInTheDocument();
    }
    expect(screen.getByText("Alt R&B")).toBeInTheDocument();
    expect(screen.getByText("Latest")).toBeInTheDocument();
    expect(screen.getByText("Single · 2025 · 412K plays")).toBeInTheDocument();
  });

  it("ends the numbers at their values", async () => {
    vi.stubGlobal(
      "matchMedia",
      vi.fn((query: string) => ({
        matches: query.includes("reduce"),
        media: query,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      }))
    );
    renderWith(withArtist);
    expect(await screen.findByText("18,400")).toBeInTheDocument();
    expect(screen.getByText("2,310")).toBeInTheDocument();
    expect(screen.getByText("4,120")).toBeInTheDocument();
    vi.unstubAllGlobals();
  });

  it("confirms and moves on to connecting", async () => {
    const user = userEvent.setup();
    renderWith(withArtist);
    await user.click(await screen.findByRole("button", { name: "That's me" }));
    expect(saved().confirmed).toBe(true);
    expect(push).toHaveBeenCalledWith("/connect");
  });

  it("goes back to the start when it found the wrong artist", async () => {
    const user = userEvent.setup();
    renderWith(withArtist);
    await user.click(await screen.findByRole("button", { name: "Not me" }));
    expect(saved().notice).toBe("not-me");
    expect(push).toHaveBeenCalledWith("/");
  });

  it("sends the artist to the start when no one was found", async () => {
    renderWith({});
    await waitFor(() => expect(replace).toHaveBeenCalledWith("/"));
  });
});
