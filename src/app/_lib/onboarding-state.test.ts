import { describe, expect, it } from "vitest";

import { ArtistSchema } from "./mock-api";
import { DEMO_ARTIST } from "./mock-data";
import {
  connectedCount,
  connectedSources,
  initialState,
  OnboardingStateSchema,
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

  it("explains why the artist is back at the start", () => {
    expect(run({ type: "found", artist }, { type: "rejected" }).notice).toBe(
      "not-me"
    );
    const notFound = run(
      {
        type: "linkEntered",
        link: "https://open.spotify.com/artist/not-found",
      },
      { type: "notFound" }
    );
    expect(notFound.notice).toBe("not-found");
    expect(notFound.link).toBeNull();
    expect(
      onboardingReducer(notFound, { type: "linkEntered", link: "x" }).notice
    ).toBeNull();
  });

  it("starts a new link from nothing but the count of returns", () => {
    const state = run(
      { type: "linkEntered", link: "https://open.spotify.com/artist/x" },
      { type: "found", artist },
      { type: "confirmed" },
      {
        type: "account",
        platform: "instagram",
        connection: { status: "connected", handle: "@x" },
      },
      { type: "goal", goal: { kind: "preset", value: "A bigger fanbase" } },
      { type: "rejected" },
      { type: "linkEntered", link: "https://www.tiktok.com/@y" }
    );
    expect(state).toEqual({
      ...initialState,
      link: "https://www.tiktok.com/@y",
      returns: 1,
    });
  });

  it("counts starting over as a return, so step 1 starts fresh", () => {
    const state = run({ type: "rejected" }, { type: "reset" });
    expect(state).toEqual({ ...initialState, returns: 2 });
  });

  it("keeps a finished reading only for the sources it read", () => {
    const line = {
      mark: "soundcharts" as const,
      label: "Reading SoundCharts",
      detail: "11 releases",
    };
    const state = run(
      { type: "readingStarted", sources: "a" },
      { type: "readingLine", line },
      { type: "readingDone" }
    );
    expect(state.reading).toEqual({ sources: "a", lines: [line], done: true });
    expect(
      onboardingReducer(state, { type: "readingStarted", sources: "b" }).reading
    ).toEqual({ sources: "b", lines: [], done: false });
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
    expect(state).toEqual({ ...initialState, returns: 1 });
  });
});

describe("stageProgress", () => {
  it("marks nothing done on the one-by-one path until an account finds the artist", () => {
    const state = run({ type: "startManual" });
    expect(stageProgress(state, "/connect")).toEqual({
      current: "connect",
      done: [],
    });
    expect(
      stageProgress(
        onboardingReducer(state, { type: "found", artist }),
        "/connect"
      )
    ).toEqual({ current: "connect", done: ["find", "confirm"] });
  });

  it("marks every stage done on arrival", () => {
    expect(stageProgress(initialState, "/welcome")).toEqual({
      current: null,
      done: ["find", "confirm", "connect", "enter"],
    });
  });
});

describe("saved progress", () => {
  it("keeps an account's numbers", () => {
    const saved = OnboardingStateSchema.parse({
      ...initialState,
      accounts: {
        instagram: {
          status: "connected",
          handle: "@nooradeyemi",
          numbers: "312 posts · 4,120 followers",
        },
      },
    });
    expect(saved.accounts.instagram).toMatchObject({
      numbers: "312 posts · 4,120 followers",
    });
  });
});
