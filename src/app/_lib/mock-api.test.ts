import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  connectAccount,
  connectFolder,
  readingPlan,
  readSources,
  resolveFromAccount,
  resolveLink,
  searchPlatforms,
} from "./mock-api";

async function collect<T>(generator: AsyncGenerator<T>): Promise<T[]> {
  const items: T[] = [];
  for await (const item of generator) items.push(item);
  return items;
}

async function settle<T>(promise: Promise<T>): Promise<T> {
  await vi.runAllTimersAsync();
  return promise;
}

describe("the mock API", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it("finds the demo artist from a Spotify link", async () => {
    const result = await settle(
      resolveLink("https://open.spotify.com/artist/5kZ2nooradeyemi")
    );
    expect(result.status).toBe("found");
    if (result.status !== "found") return;
    expect(result.artist.name).toBe("Noor Adeyemi");
    expect(result.artist.city).toBe("Atlanta, GA");
    expect(result.artist.releases.map((release) => release.title)).toEqual([
      "Lantern",
      "Lowlight",
      "Grove",
      "Slow Water",
      "Early Hours",
    ]);
    expect(result.artist.genres).toEqual(["Alt R&B", "Neo-soul", "Late-night"]);
    expect(result.artist.releases[0]).toMatchObject({
      kind: "Single",
      year: 2025,
      plays: "412K plays",
    });
    expect(result.artist.stats.instagramFollowers).toBe(4_120);
  });

  it("finds no one behind the not-found demo link", async () => {
    const result = await settle(
      resolveLink("https://open.spotify.com/artist/not-found")
    );
    expect(result).toEqual({ status: "not-found" });
  });

  it("finds the artist on four platforms, in order, with a number for each", async () => {
    const found = collect(searchPlatforms("noor-adeyemi"));
    expect(await settle(found)).toEqual([
      { platform: "spotify", detail: "18.4k listeners" },
      { platform: "instagram", detail: "4,120 followers" },
      { platform: "youtube", detail: "860 subscribers" },
      { platform: "tiktok", detail: "1,200 followers" },
    ]);
  });

  it("returns an account's numbers when it connects", async () => {
    expect(await settle(connectAccount("instagram", 1))).toEqual({
      status: "connected",
      handle: "@nooradeyemi",
      numbers: "312 posts · 4,120 followers",
    });
  });

  it("fails Facebook once, then connects it", async () => {
    expect(await settle(connectAccount("facebook", 1))).toEqual({
      status: "failed",
      message: "Facebook didn't answer. Try again.",
    });
    expect(await settle(connectAccount("facebook", 2))).toEqual({
      status: "connected",
      handle: "Noor Adeyemi",
      numbers: "1,860 followers",
    });
  });

  it("connects a folder", async () => {
    expect(await settle(connectFolder("google-drive"))).toEqual({
      status: "connected",
    });
  });

  it("reads SoundCharts first, then each source in order", async () => {
    const lines = collect(
      readSources([
        { kind: "account", platform: "instagram" },
        { kind: "files", count: 3 },
      ])
    );
    expect(await settle(lines)).toEqual([
      {
        mark: "soundcharts",
        label: "Reading SoundCharts",
        detail: "11 releases, 18 months of history",
      },
      {
        mark: "instagram",
        label: "Reading Instagram",
        detail: "312 posts, 4,120 followers",
      },
      { mark: "files", label: "Reading your reports", detail: "3 files" },
    ]);
  });

  it("plans the reading before it starts, SoundCharts first", () => {
    expect(
      readingPlan([
        { kind: "account", platform: "instagram" },
        { kind: "folder", provider: "google-drive" },
        { kind: "files", count: 3 },
      ])
    ).toEqual([
      { mark: "soundcharts", name: "SoundCharts" },
      { mark: "instagram", name: "Instagram" },
      { mark: "google-drive", name: "Google Drive" },
      { mark: "files", name: "Your reports" },
    ]);
  });

  it("resolves the artist from a connected account", async () => {
    const artist = await settle(resolveFromAccount("instagram"));
    expect(artist.name).toBe("Noor Adeyemi");
  });
});
