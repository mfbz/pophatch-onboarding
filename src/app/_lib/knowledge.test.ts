import { describe, expect, it } from "vitest";

import { ArtistSchema } from "./mock-api";
import { DEMO_ARTIST } from "./mock-data";
import { knowledge } from "./knowledge";
import { initialState, type OnboardingState } from "./onboarding-state";

const artist = ArtistSchema.parse(DEMO_ARTIST);
const connected = { status: "connected" as const, handle: "@nooradeyemi" };

function on(state: Partial<OnboardingState>) {
  return knowledge({ ...initialState, artist, confirmed: true, ...state });
}

describe("knowledge", () => {
  it("starts at 20% from Spotify on the link path", () => {
    const result = on({});
    expect(result.percent).toBe(20);
    expect(result.segments.map((segment) => segment.state)).toEqual([
      "filled",
      "empty",
      "empty",
      "empty",
      "empty",
    ]);
    expect(result.line).toBe(
      "Spotify got me started. Each account fills in more."
    );
  });

  it("adds 20% for each account and says what it gives", () => {
    const result = on({ accounts: { instagram: connected } });
    expect(result.percent).toBe(40);
    expect(result.segments[1]).toEqual({ mark: "instagram", state: "filled" });
    expect(result.line).toBe(
      "Good start. Now I can see your fans, not just your listeners."
    );
  });

  it("reaches 100% with every account", () => {
    const result = on({
      accounts: {
        instagram: connected,
        tiktok: connected,
        youtube: connected,
        facebook: connected,
      },
    });
    expect(result.percent).toBe(100);
    expect(result.line).toBe("That's everything I can read for now.");
  });

  it("marks a failed account and says so", () => {
    const result = on({
      accounts: {
        facebook: {
          status: "failed",
          message: "Facebook didn't answer. Try again.",
          attempts: 1,
        },
      },
    });
    expect(result.percent).toBe(20);
    expect(result.segments[4]).toEqual({ mark: "facebook", state: "failed" });
    expect(result.line).toBe(
      "Facebook didn't answer. Try it again whenever you like."
    );
  });

  it("starts empty on the one-by-one path", () => {
    const result = knowledge({ ...initialState, path: "manual" });
    expect(result.percent).toBe(0);
    expect(result.segments.every((segment) => segment.state === "empty")).toBe(
      true
    );
    expect(result.line).toBe("Connect an account and I'll find you.");
  });

  it("fills Spotify and the first account once it finds the artist", () => {
    const result = knowledge({
      ...initialState,
      path: "manual",
      artist,
      accounts: { instagram: connected },
    });
    expect(result.percent).toBe(40);
    expect(result.segments[0]?.state).toBe("filled");
    expect(result.line).toBe(
      "Good start. Now I can see your fans, not just your listeners."
    );
  });

  it("does not count files or folders", () => {
    const result = on({
      files: ["royalties.csv"],
      folders: { onedrive: { status: "connected" } },
    });
    expect(result.percent).toBe(20);
  });
});
