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

  it("welcomes the artist by name with the mark", async () => {
    renderWith(arrived);
    expect(
      await screen.findByRole("heading", { level: 1, name: "You're in, Noor." })
    ).toBeInTheDocument();
    expect(
      screen.getByText("Your first plan is on its way.")
    ).toBeInTheDocument();
    const sources = screen
      .getAllByRole("img", { name: "PopHatch" })
      .map((image) => image.getAttribute("src"));
    expect(sources).toContainEqual(expect.stringContaining("mark.svg"));
  });

  it("starts over from step 1", async () => {
    const user = userEvent.setup();
    renderWith(arrived);
    await user.click(await screen.findByRole("button", { name: "Start over" }));
    expect(saved()).toEqual(initialState);
    expect(push).toHaveBeenCalledWith("/");
  });

  it("sends the artist to the start without a goal", async () => {
    renderWith({ ...arrived, goal: null });
    await waitFor(() => expect(replace).toHaveBeenCalledWith("/"));
  });
});
