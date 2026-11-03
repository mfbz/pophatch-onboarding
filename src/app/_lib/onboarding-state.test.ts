import { describe, expect, it } from "vitest";

import { ArtistSchema } from "./mock-api";
import { DEMO_ARTIST } from "./mock-data";
import {
  connectedCount,
  connectedSources,
  initialState,
  type OnboardingAction,
  onboardingReducer,
  stageProgress,
} from "./onboarding-state";

const artist = ArtistSchema.parse(DEMO_ARTIST);

function run(...actions: OnboardingAction[]) {
  return actions.reduce(onboardingReducer, initialState);
}

describe("the onboarding reducer", () => {
  it("forgets the link and the artist when the artist says not me", () => {
    const state = run(
      { type: "linkEntered", link: "https://open.spotify.com/artist/x" },
      { type: "found", artist },
      { type: "rejected" }
    );
    expect(state.artist).toBeNull();
    expect(state.link).toBeNull();
    expect(state.confirmed).toBe(false);
  });

  it("starts the one-by-one path", () => {
    expect(run({ type: "startManual" }).path).toBe("manual");
  });

  it("counts an account once it connects after a failure", () => {
    const state = run(
      {
        type: "account",
        platform: "facebook",
        connection: { status: "failed", message: "x", attempts: 1 },
      },
      {
        type: "account",
        platform: "facebook",
        connection: { status: "connected", handle: "Noor Adeyemi" },
      }
    );
    expect(connectedCount(state)).toBe(1);
    expect(connectedSources(state)).toEqual([
      { kind: "account", platform: "facebook" },
    ]);
  });

  it("counts uploaded files and connected folders toward the total", () => {
    const state = run(
      { type: "files", names: ["royalties.csv", "shows.pdf"] },
      {
        type: "folder",
        provider: "google-drive",
        connection: { status: "connected" },
      }
    );
    expect(connectedCount(state)).toBe(2);
    expect(connectedSources(state)).toEqual([
      { kind: "folder", provider: "google-drive" },
      { kind: "files", count: 2 },
    ]);
  });

  it("keeps only the latest goal", () => {
    const state = run(
      { type: "goal", goal: { kind: "preset", value: "A bigger fanbase" } },
      { type: "goal", goal: { kind: "written", value: "Tour Europe" } }
    );
    expect(state.goal).toEqual({ kind: "written", value: "Tour Europe" });
  });

  it("starts over from nothing", () => {
    const state = run(
      { type: "linkEntered", link: "https://open.spotify.com/artist/x" },
      { type: "found", artist },
      { type: "confirmed" },
      { type: "reset" }
    );
    expect(state).toEqual(initialState);
  });
});

describe("stageProgress", () => {
  it("marks find and confirm done on the one-by-one path", () => {
    const state = run({ type: "startManual" });
    expect(stageProgress(state, "/connect")).toEqual({
      current: "connect",
      done: ["find", "confirm"],
    });
  });

  it("marks every stage done on arrival", () => {
    expect(stageProgress(initialState, "/welcome")).toEqual({
      current: null,
      done: ["find", "confirm", "connect", "enter"],
    });
  });
});
