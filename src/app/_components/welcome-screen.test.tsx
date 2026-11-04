import { act, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { ArtistSchema } from "@/app/_lib/mock-api";
import { DEMO_ARTIST } from "@/app/_lib/mock-data";
import { OnboardingProvider } from "@/app/_lib/onboarding-provider";
import {
  initialState,
  type OnboardingState,
} from "@/app/_lib/onboarding-state";

import { WelcomeScreen } from "./welcome-screen";

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
      <WelcomeScreen />
    </OnboardingProvider>
  );
}

const arrived: Partial<OnboardingState> = {
  artist: ArtistSchema.parse(DEMO_ARTIST),
  confirmed: true,
  accounts: { instagram: { status: "connected", handle: "@nooradeyemi" } },
  goal: { kind: "preset", value: "A bigger fanbase" },
};

describe("WelcomeScreen", () => {
  afterEach(() => {
    push.mockClear();
    replace.mockClear();
    sessionStorage.clear();
  });

  it("welcomes the artist by name with the logo, and no stepper", async () => {
    renderWith(arrived);
    expect(
      await screen.findByRole("heading", { level: 1, name: "You're in, Noor." })
    ).toBeInTheDocument();
    expect(
      screen.getByText("Your first plan is on its way.")
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("list", { name: "Onboarding progress" })
    ).not.toBeInTheDocument();
    const sources = screen
      .getAllByRole("img", { name: "PopHatch" })
      .map((image) => image.getAttribute("src"));
    expect(sources).toContainEqual(expect.stringContaining("logo-pearl"));
  });

  it("the card shows the chosen goal", async () => {
    renderWith(arrived);
    const card = await screen.findByRole("region", { name: "Your goal" });
    expect(card).toHaveTextContent("Your goal · next three months");
    expect(card).toHaveTextContent("Grow the fanbase you already have");
    expect(card).toHaveTextContent("Your first plan is built around it.");
    expect(card.querySelector("img")?.getAttribute("src")).toContain("lantern");
  });

  it("a written goal is quoted", async () => {
    renderWith({ ...arrived, goal: { kind: "written", value: "Tour Europe" } });
    const card = await screen.findByRole("region", { name: "Your goal" });
    expect(card).toHaveTextContent("\u201cTour Europe\u201d");
  });

  it("keeps Start over out of reach until the card has docked", async () => {
    vi.useFakeTimers();
    renderWith(arrived);
    await act(async () => {
      await vi.advanceTimersByTimeAsync(0);
    });
    const card = screen.getByRole("region", { name: "Your goal" });
    expect(card).toHaveAttribute("inert");
    await act(async () => {
      await vi.advanceTimersByTimeAsync(3400);
    });
    expect(card).not.toHaveAttribute("inert");
    vi.useRealTimers();
  });

  it("starts over from step 1", async () => {
    const user = userEvent.setup();
    renderWith(arrived);
    const card = await screen.findByRole("region", { name: "Your goal" });
    expect(screen.getAllByRole("button", { name: "Start over" })).toHaveLength(
      1
    );
    await user.click(within(card).getByRole("button", { name: "Start over" }));
    expect(saved()).toEqual({ ...initialState, returns: 1 });
    expect(push).toHaveBeenCalledWith("/");
  });

  it("sends the artist to the start without a goal", async () => {
    renderWith({ ...arrived, goal: null });
    await waitFor(() => expect(replace).toHaveBeenCalledWith("/"));
  });
});
