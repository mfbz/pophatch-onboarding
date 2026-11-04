import { act, fireEvent, render, screen, within } from "@testing-library/react";
import { Activity } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { ArtistSchema } from "@/app/_lib/mock-api";
import { DEMO_ARTIST } from "@/app/_lib/mock-data";
import { OnboardingProvider } from "@/app/_lib/onboarding-provider";
import {
  initialState,
  type OnboardingState,
} from "@/app/_lib/onboarding-state";

import { ConnectScreen } from "./connect-screen";

const push = vi.fn();
const replace = vi.fn();
const router = { push, replace };

vi.mock("next/navigation", () => ({ useRouter: () => router }));

const artist = ArtistSchema.parse(DEMO_ARTIST);

function saved(): Partial<OnboardingState> {
  return JSON.parse(
    sessionStorage.getItem("pophatch-onboarding") ?? "{}"
  ) as Partial<OnboardingState>;
}

async function renderWith(state: Partial<OnboardingState>) {
  sessionStorage.setItem(
    "pophatch-onboarding",
    JSON.stringify({ ...initialState, ...state })
  );
  render(
    <OnboardingProvider>
      <ConnectScreen />
    </OnboardingProvider>
  );
  await act(async () => {
    await vi.advanceTimersByTimeAsync(0);
  });
}

async function wait(ms: number) {
  await act(async () => {
    await vi.advanceTimersByTimeAsync(ms);
  });
}

function row(name: string) {
  return within(screen.getByRole("listitem", { name }));
}

const confirmed = {
  artist,
  confirmed: true,
  link: "https://open.spotify.com/artist/x",
};

describe("ConnectScreen", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
    push.mockClear();
    replace.mockClear();
    sessionStorage.clear();
  });

  it("lists the accounts found from the link, none connected", async () => {
    await renderWith(confirmed);
    expect(
      screen.getByRole("heading", { level: 1, name: "Connect your pages." })
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "PopHatch found these from your Spotify. Connect what you have; one is enough to start."
      )
    ).toBeInTheDocument();
    for (const name of ["Instagram", "TikTok", "YouTube", "Facebook"]) {
      expect(
        row(name).getByRole("button", { name: `Connect ${name}` })
      ).toBeEnabled();
    }
    expect(row("Instagram").getByText("@nooradeyemi")).toBeInTheDocument();
    expect(row("SoundCloud").getByText("Coming soon")).toBeInTheDocument();
    expect(row("SoundCloud").queryByRole("button")).toBeNull();
    expect(
      screen.getByRole("button", { name: "Connect one to continue" })
    ).toBeDisabled();
  });

  it("connects an account, keeps focus in the row and counts it", async () => {
    await renderWith(confirmed);
    const connect = row("Instagram").getByRole("button", {
      name: "Connect Instagram",
    });
    connect.focus();
    fireEvent.click(connect);
    const pending = row("Instagram").getByRole("button", {
      name: "Connecting…",
    });
    expect(pending).toHaveAttribute("aria-disabled", "true");
    expect(pending).toHaveFocus();
    await wait(1300);
    expect(row("Instagram").getByText("Connected")).toBeInTheDocument();
    expect(row("Instagram").getByRole("status")).toHaveFocus();
    fireEvent.click(
      screen.getByRole("button", { name: "Continue with 1 connected" })
    );
    expect(push).toHaveBeenCalledWith("/together");
  });

  it("says when Facebook fails, and connects it on a second try", async () => {
    await renderWith(confirmed);
    const connect = row("Facebook").getByRole("button", {
      name: "Connect Facebook",
    });
    connect.focus();
    fireEvent.click(connect);
    await wait(1300);
    expect(
      row("Facebook").getByText("Facebook didn't answer. Try again.")
    ).toBeInTheDocument();
    const retry = row("Facebook").getByRole("button", {
      name: "Try Facebook again",
    });
    expect(retry).toHaveFocus();
    fireEvent.click(retry);
    await wait(1300);
    expect(row("Facebook").getByText("Connected")).toBeInTheDocument();
  });

  it("counts uploaded files and a connected folder", async () => {
    await renderWith(confirmed);
    fireEvent.change(screen.getByLabelText("Upload reports"), {
      target: {
        files: [new File(["x"], "royalties-2025.csv", { type: "text/csv" })],
      },
    });
    fireEvent.change(screen.getByLabelText("Upload reports"), {
      target: {
        files: [new File(["x"], "shows.pdf", { type: "application/pdf" })],
      },
    });
    expect(screen.getByText("royalties-2025.csv")).toBeInTheDocument();
    expect(screen.getByText("shows.pdf")).toBeInTheDocument();
    fireEvent.click(
      screen.getByRole("button", { name: "Connect Google Drive" })
    );
    await wait(1300);
    expect(screen.getByText("Google Drive connected")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Continue with 2 connected" })
    ).toBeEnabled();
  });

  it("names the platform the link came from", async () => {
    await renderWith({ ...confirmed, link: "https://linktr.ee/nooradeyemi" });
    expect(
      screen.getByText(
        "PopHatch found these from your Linktree. Connect what you have; one is enough to start."
      )
    ).toBeInTheDocument();
  });

  it("goes back to try another link", async () => {
    await renderWith(confirmed);
    fireEvent.click(screen.getByRole("button", { name: "Try another link" }));
    expect(push).toHaveBeenCalledWith("/");
  });

  it("finds the artist from the first account on the one-by-one path", async () => {
    await renderWith({ path: "manual" });
    expect(
      screen.getByText("Connect what you have; one is enough to start.")
    ).toBeInTheDocument();
    expect(screen.queryByText("@nooradeyemi")).toBeNull();
    fireEvent.click(
      row("TikTok").getByRole("button", { name: "Connect TikTok" })
    );
    await wait(3000);
    expect(row("TikTok").getByText("@nooradeyemi")).toBeInTheDocument();
    expect(saved().artist?.name).toBe("Noor Adeyemi");
  });

  it("starts her card at 20% from Spotify on the link path", async () => {
    await renderWith(confirmed);
    const meter = screen.getByRole("meter", { name: "How well I know you" });
    expect(meter).toHaveAttribute("aria-valuenow", "20");
    expect(
      screen.getByText("Spotify got me started. Each account fills in more.")
    ).toBeInTheDocument();
  });

  it("fills her card as an account connects", async () => {
    await renderWith(confirmed);
    fireEvent.click(
      row("Instagram").getByRole("button", { name: "Connect Instagram" })
    );
    await wait(1300);
    expect(
      screen.getByRole("meter", { name: "How well I know you" })
    ).toHaveAttribute("aria-valuenow", "40");
    expect(
      screen.getByText(
        "Good start. Now I can see your fans, not just your listeners."
      )
    ).toBeInTheDocument();
    expect(
      screen.getAllByText("312 posts · 4,120 followers").length
    ).toBeGreaterThan(0);
    expect(
      screen.getByText("Gives me where your fans are, when they're online")
    ).toBeInTheDocument();
  });

  it("shows Facebook's failure on her card", async () => {
    await renderWith(confirmed);
    fireEvent.click(
      row("Facebook").getByRole("button", { name: "Connect Facebook" })
    );
    await wait(1300);
    expect(screen.getByText("Didn't answer")).toBeInTheDocument();
    expect(
      screen.getByText(
        "Facebook didn't answer. Try it again whenever you like."
      )
    ).toBeInTheDocument();
  });

  it("starts empty without a name on the one-by-one path", async () => {
    await renderWith({ path: "manual" });
    expect(
      screen.getByRole("meter", { name: "How well I know you" })
    ).toHaveAttribute("aria-valuenow", "0");
    expect(screen.queryAllByText("Noor Adeyemi")).toHaveLength(0);
    fireEvent.click(
      row("Instagram").getByRole("button", { name: "Connect Instagram" })
    );
    await wait(3000);
    expect(screen.getAllByText("Noor Adeyemi").length).toBeGreaterThan(0);
    expect(
      screen.getByRole("meter", { name: "How well I know you" })
    ).toHaveAttribute("aria-valuenow", "40");
  });

  it("keeps her card after a reload", async () => {
    await renderWith({
      ...confirmed,
      accounts: {
        instagram: { status: "connected", handle: "@nooradeyemi" },
        tiktok: { status: "connected", handle: "@nooradeyemi" },
      },
    });
    expect(
      screen.getByRole("meter", { name: "How well I know you" })
    ).toHaveAttribute("aria-valuenow", "60");
  });

  it("counts files toward Continue but not on her card", async () => {
    await renderWith(confirmed);
    fireEvent.change(screen.getByLabelText("Upload reports"), {
      target: {
        files: [new File(["x"], "royalties-2025.csv", { type: "text/csv" })],
      },
    });
    expect(
      screen.getByRole("meter", { name: "How well I know you" })
    ).toHaveAttribute("aria-valuenow", "20");
    expect(
      screen.getByRole("button", { name: "Continue with 1 connected" })
    ).toBeEnabled();
  });

  it("drops an answer that comes back after the artist left the page", async () => {
    sessionStorage.setItem(
      "pophatch-onboarding",
      JSON.stringify({ ...initialState, ...confirmed })
    );
    const tree = (mode: "visible" | "hidden") => (
      <OnboardingProvider>
        <Activity mode={mode}>
          <ConnectScreen />
        </Activity>
      </OnboardingProvider>
    );
    const { rerender } = render(tree("visible"));
    await wait(0);
    fireEvent.click(screen.getByRole("button", { name: "Connect Instagram" }));
    fireEvent.click(
      screen.getByRole("button", { name: "Connect Google Drive" })
    );
    rerender(tree("hidden"));
    await wait(3000);
    expect(saved().accounts).toEqual({});
    expect(saved().folders).toEqual({});
  });

  it("sends the artist to the start before confirming", async () => {
    await renderWith({ artist });
    expect(replace).toHaveBeenCalledWith("/");
  });
});
