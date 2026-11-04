import { act, fireEvent, render, screen } from "@testing-library/react";
import { Activity } from "react";
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

const PHONE = "(max-width: 859px)";

function setPhone(phone: boolean) {
  window.matchMedia = vi.fn((query: string) => ({
    matches: phone && query === PHONE,
    media: query,
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }));
}

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
  return screen.getByRole("textbox", { name: "Or say it in your own words" });
}

// Both messages and the answer are in after the typing indicators.
async function untilAsked() {
  await wait(1700);
}

const read: Partial<OnboardingState> = {
  ...connected,
  goal: { kind: "preset", value: "More shows, better rooms" },
  reading: {
    sources: JSON.stringify([
      { kind: "account", platform: "instagram" },
      { kind: "files", count: 3 },
    ]),
    lines: [],
    done: true,
  },
};

describe("TogetherScreen", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    setPhone(false);
  });
  afterEach(() => {
    vi.useRealTimers();
    push.mockClear();
    replace.mockClear();
    sessionStorage.clear();
  });

  it("asks the question after greeting", async () => {
    await renderWith(connected);
    expect(
      screen.getByRole("heading", {
        level: 1,
        name: "What would make the next three months a win?",
      })
    ).toBeInTheDocument();
    expect(screen.queryByText(/Nice to meet you/)).toBeNull();
    await untilAsked();
    expect(
      screen.getByText(
        "Nice to meet you, Noor. I'm reading everything you connected; it takes a moment."
      )
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "While I do: what would make the next three months a win for you?"
      )
    ).toBeInTheDocument();
    for (const goal of GOALS) {
      expect(screen.getByRole("radio", { name: goal })).toBeInTheDocument();
    }
    expect(screen.queryByRole("button", { name: /Enter PopHatch/ })).toBeNull();
  });

  it("picking a goal replies, confirms and shows the button", async () => {
    await renderWith(connected);
    await untilAsked();
    fireEvent.click(
      screen.getByRole("radio", { name: "More shows, better rooms" })
    );
    expect(screen.queryByRole("radio")).toBeNull();
    expect(
      screen.getByText("More shows, better rooms", { selector: "p" })
    ).toBeInTheDocument();
    await wait(1000);
    expect(
      screen.getByText(
        "Got it: more shows, better rooms. I'll build your first plan around it."
      )
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Finishing the reading · \d of 3/ })
    ).toBeDisabled();
  });

  it("a written goal stops at 140 and gets the generic confirmation", async () => {
    await renderWith(connected);
    await untilAsked();
    expect(goalField()).toHaveAttribute("maxLength", "140");
    fireEvent.change(goalField(), { target: { value: "  Tour Europe " } });
    expect(screen.getByText("14 / 140")).toBeInTheDocument();
    fireEvent.keyDown(goalField(), { key: "Enter" });
    expect(
      screen.getByText("Tour Europe", { selector: "p" })
    ).toBeInTheDocument();
    await wait(1000);
    expect(
      screen.getByText("Got it. I'll build your first plan around that.")
    ).toBeInTheDocument();
  });

  it("does not send an empty written goal", async () => {
    await renderWith(connected);
    await untilAsked();
    fireEvent.change(goalField(), { target: { value: "   " } });
    fireEvent.click(screen.getByRole("button", { name: "Send" }));
    expect(goalField()).toBeInTheDocument();
  });

  it("Enter waits for the reading", async () => {
    await renderWith(connected);
    await untilAsked();
    fireEvent.click(screen.getByRole("radio", { name: "A bigger fanbase" }));
    await wait(1000);
    expect(
      screen.getByRole("button", { name: /Finishing the reading/ })
    ).toBeDisabled();
    await wait(3000);
    fireEvent.click(screen.getByRole("button", { name: "Enter PopHatch" }));
    expect(push).toHaveBeenCalledWith("/welcome");
  });

  it("Change brings the answer back with the goal selected", async () => {
    await renderWith(connected);
    await untilAsked();
    fireEvent.click(screen.getByRole("radio", { name: "A bigger fanbase" }));
    await wait(1000);
    fireEvent.click(screen.getByRole("button", { name: "Change" }));
    expect(
      screen.getByRole("radio", { name: "A bigger fanbase" })
    ).toBeChecked();
    expect(screen.queryByText(/Got it/)).toBeNull();
    expect(
      screen.queryByRole("button", { name: /Finishing|Enter/ })
    ).toBeNull();
  });

  it("Change brings a written goal back into the box", async () => {
    await renderWith(connected);
    await untilAsked();
    fireEvent.change(goalField(), { target: { value: "Tour Europe" } });
    fireEvent.click(screen.getByRole("button", { name: "Send" }));
    await wait(1000);
    fireEvent.click(screen.getByRole("button", { name: "Change" }));
    expect(goalField()).toHaveValue("Tour Europe");
  });

  it("keeps keyboard focus through answering and changing", async () => {
    await renderWith(connected);
    await untilAsked();
    screen.getByRole("radio", { name: "A bigger fanbase" }).focus();
    fireEvent.click(screen.getByRole("radio", { name: "A bigger fanbase" }));
    expect(document.activeElement).toBe(
      screen.getByRole("button", { name: "Change" })
    );
    fireEvent.click(screen.getByRole("button", { name: "Change" }));
    expect(document.activeElement).toBe(
      screen.getByRole("radio", { name: "A bigger fanbase" })
    );
  });

  it("returns focus to the box after changing a written goal", async () => {
    await renderWith(connected);
    await untilAsked();
    fireEvent.change(goalField(), { target: { value: "Tour Europe" } });
    fireEvent.click(screen.getByRole("button", { name: "Send" }));
    fireEvent.click(screen.getByRole("button", { name: "Change" }));
    expect(document.activeElement).toBe(goalField());
  });

  it("a reload restores the answered conversation without typing", async () => {
    await renderWith(read);
    expect(screen.getByText(/Nice to meet you/)).toBeInTheDocument();
    expect(
      screen.getByText(
        "Got it: more shows, better rooms. I'll build your first plan around it."
      )
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Enter PopHatch" })
    ).toBeEnabled();
  });

  it("the panel says what it reads now", async () => {
    await renderWith(connected);
    expect(
      screen.getByText("Reading SoundCharts · 1 of 3")
    ).toBeInTheDocument();
    await wait(1100);
    expect(screen.getByText("Reading Instagram · 2 of 3")).toBeInTheDocument();
    const rows = screen.getByRole("list", { name: "Sources" });
    expect(rows).toHaveTextContent(
      "SoundCharts11 releases, 18 months of history✓ Read"
    );
    expect(rows).toHaveTextContent("Your reportsWaiting");
    await wait(2100);
    expect(rows).toHaveTextContent("Your reports3 files✓ Read");
    expect(
      screen.getByText("Read everything you connected.")
    ).toBeInTheDocument();
  });

  it("the compact block folds when done", async () => {
    setPhone(true);
    await renderWith(connected);
    await wait(800);
    const header = screen.getByRole("button", { name: /Reading SoundCharts/ });
    expect(header).toHaveAttribute("aria-expanded", "true");
    await wait(2400);
    await wait(1300);
    const folded = screen.getByRole("button", { name: /✓ Read 3 sources/ });
    expect(folded).toHaveAttribute("aria-expanded", "false");
    fireEvent.click(folded);
    expect(folded).toHaveAttribute("aria-expanded", "true");
  });

  it("keeps a finished reading when the artist comes back to it", async () => {
    sessionStorage.setItem(
      "pophatch-onboarding",
      JSON.stringify({ ...initialState, ...connected })
    );
    const tree = (mode: "visible" | "hidden") => (
      <OnboardingProvider>
        <Activity mode={mode}>
          <TogetherScreen />
        </Activity>
      </OnboardingProvider>
    );
    const { rerender } = render(tree("visible"));
    await wait(0);
    await untilAsked();
    fireEvent.click(screen.getByRole("radio", { name: "A bigger fanbase" }));
    await wait(3500);
    rerender(tree("hidden"));
    rerender(tree("visible"));
    await wait(1200);
    expect(
      screen.getByRole("button", { name: "Enter PopHatch" })
    ).toBeEnabled();
    expect(screen.getByRole("list", { name: "Sources" })).toHaveTextContent(
      "Your reports3 files✓ Read"
    );
  });

  it("sends the artist to the start with nothing connected", async () => {
    await renderWith({ artist: connected.artist, confirmed: true });
    expect(replace).toHaveBeenCalledWith("/");
  });
});
