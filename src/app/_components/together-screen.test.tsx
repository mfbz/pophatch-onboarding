import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { ArtistSchema } from "@/app/_lib/mock-api";
import { DEMO_ARTIST } from "@/app/_lib/mock-data";
import { OnboardingProvider } from "@/app/_lib/onboarding-provider";
import {
  initialState,
  type OnboardingState,
} from "@/app/_lib/onboarding-state";

import { TogetherScreen } from "./together-screen";

const push = vi.fn();
const replace = vi.fn();
const router = { push, replace };

vi.mock("next/navigation", () => ({ useRouter: () => router }));

const GOALS = [
  "My next release landing",
  "More shows, better rooms",
  "A bigger fanbase",
  "Making money from this",
  "Getting noticed by playlists, press and bookers",
];

const connected: Partial<OnboardingState> = {
  artist: ArtistSchema.parse(DEMO_ARTIST),
  confirmed: true,
  accounts: { instagram: { status: "connected", handle: "@nooradeyemi" } },
  files: ["royalties.csv", "shows.pdf", "statement.pdf"],
};

async function renderWith(state: Partial<OnboardingState>) {
  sessionStorage.setItem(
    "pophatch-onboarding",
    JSON.stringify({ ...initialState, ...state })
  );
  render(
    <OnboardingProvider>
      <TogetherScreen />
    </OnboardingProvider>
  );
  await wait(0);
}

async function wait(ms: number) {
  await act(async () => {
    await vi.advanceTimersByTimeAsync(ms);
  });
}

function goalField() {
  return screen.getByRole("textbox", { name: "Or write it in" });
}

describe("TogetherScreen", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
    push.mockClear();
    replace.mockClear();
    sessionStorage.clear();
  });

  it("asks one question with five goals to pick from", async () => {
    await renderWith(connected);
    expect(
      screen.getByRole("heading", {
        level: 1,
        name: "What would make the next three months a win?",
      })
    ).toBeInTheDocument();
    for (const goal of GOALS) {
      expect(screen.getByRole("radio", { name: goal })).toBeInTheDocument();
    }
  });

  it("keeps one goal: a pick clears the text and the text clears the pick", async () => {
    await renderWith(connected);
    fireEvent.click(screen.getByRole("radio", { name: "A bigger fanbase" }));
    expect(
      screen.getByRole("radio", { name: "A bigger fanbase" })
    ).toBeChecked();
    fireEvent.change(goalField(), { target: { value: "Tour Europe" } });
    expect(
      screen.getByRole("radio", { name: "A bigger fanbase" })
    ).not.toBeChecked();
    fireEvent.click(
      screen.getByRole("radio", { name: "More shows, better rooms" })
    );
    expect(goalField()).toHaveValue("");
  });

  it("caps a written goal at 140 characters and shows the count", async () => {
    await renderWith(connected);
    expect(goalField()).toHaveAttribute("maxLength", "140");
    fireEvent.change(goalField(), { target: { value: "Tour Europe" } });
    expect(screen.getByText("11/140")).toBeInTheDocument();
  });

  it("reads SoundCharts, then each connected source as it arrives", async () => {
    await renderWith(connected);
    const reading = screen.getByRole("list", { name: "Putting it together" });
    await wait(1100);
    expect(reading).toHaveTextContent("Reading SoundCharts");
    expect(reading).not.toHaveTextContent("Reading Instagram");
    await wait(2100);
    expect(reading).toHaveTextContent(
      "Reading Instagram312 posts, 4,120 followers"
    );
    expect(reading).toHaveTextContent("Reading your reports3 files");
  });

  it("enters once a goal is set and the reading is done", async () => {
    await renderWith(connected);
    expect(
      screen.getByRole("button", { name: "Pick a goal to enter" })
    ).toBeDisabled();
    fireEvent.click(screen.getByRole("radio", { name: "A bigger fanbase" }));
    expect(screen.getByRole("button", { name: "Reading…" })).toBeDisabled();
    await wait(3500);
    fireEvent.click(screen.getByRole("button", { name: "Enter" }));
    expect(push).toHaveBeenCalledWith("/welcome");
  });

  it("sends the artist to the start with nothing connected", async () => {
    await renderWith({ artist: connected.artist, confirmed: true });
    expect(replace).toHaveBeenCalledWith("/");
  });
});
