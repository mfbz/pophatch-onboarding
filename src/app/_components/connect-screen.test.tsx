import { act, fireEvent, render, screen, within } from "@testing-library/react";
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

  it("connects an account and counts it", async () => {
    await renderWith(confirmed);
    fireEvent.click(
      row("Instagram").getByRole("button", { name: "Connect Instagram" })
    );
    const pending = row("Instagram").getByRole("button", {
      name: "Connecting…",
    });
    expect(pending).toBeDisabled();
    await wait(1300);
    expect(row("Instagram").getByText("Connected")).toBeInTheDocument();
    fireEvent.click(
      screen.getByRole("button", { name: "Continue with 1 connected" })
    );
    expect(push).toHaveBeenCalledWith("/together");
  });

  it("says when Facebook fails, and connects it on a second try", async () => {
    await renderWith(confirmed);
    fireEvent.click(
      row("Facebook").getByRole("button", { name: "Connect Facebook" })
    );
    await wait(1300);
    expect(
      row("Facebook").getByText("Facebook didn't answer. Try again.")
    ).toBeInTheDocument();
    fireEvent.click(
      row("Facebook").getByRole("button", { name: "Try Facebook again" })
    );
    await wait(1300);
    expect(row("Facebook").getByText("Connected")).toBeInTheDocument();
  });

  it("counts uploaded files and a connected folder", async () => {
    await renderWith(confirmed);
    fireEvent.change(screen.getByLabelText("Upload files"), {
      target: {
        files: [new File(["x"], "royalties-2025.csv", { type: "text/csv" })],
      },
    });
    expect(screen.getByText("royalties-2025.csv")).toBeInTheDocument();
    fireEvent.click(
      screen.getByRole("button", { name: "Connect Google Drive" })
    );
    await wait(1300);
    expect(screen.getByText("Google Drive connected")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Continue with 2 connected" })
    ).toBeEnabled();
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

  it("sends the artist to the start before confirming", async () => {
    await renderWith({ artist });
    expect(replace).toHaveBeenCalledWith("/");
  });
});
