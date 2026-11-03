import { describe, expect, it } from "vitest";

import { EXAMPLE_LINKS, parseArtistLink, type Platform } from "./parse-link";

describe("parseArtistLink", () => {
  it.each<[string, Platform, string]>([
    [
      "open.spotify.com/artist/x",
      "spotify",
      "https://open.spotify.com/artist/x",
    ],
    [
      "https://open.spotify.com/artist/x?si=abc",
      "spotify",
      "https://open.spotify.com/artist/x?si=abc",
    ],
    [
      "  HTTPS://WWW.INSTAGRAM.COM/nooradeyemi/  ",
      "instagram",
      "https://instagram.com/nooradeyemi/",
    ],
    [
      "m.youtube.com/@nooradeyemi",
      "youtube",
      "https://youtube.com/@nooradeyemi",
    ],
    ["youtube.com/@x", "youtube", "https://youtube.com/@x"],
    ["youtu.be/x", "youtube", "https://youtu.be/x"],
    ["tiktok.com/@x", "tiktok", "https://tiktok.com/@x"],
    [
      "music.apple.com/us/artist/x/1",
      "apple-music",
      "https://music.apple.com/us/artist/x/1",
    ],
    ["soundcloud.com/x", "soundcloud", "https://soundcloud.com/x"],
    ["linktr.ee/x", "linktree", "https://linktr.ee/x"],
  ])("reads %s as %s", (input, platform, url) => {
    expect(parseArtistLink(input)).toEqual({ ok: true, platform, url });
  });

  it("reads every example link as its own platform", () => {
    for (const [platform, link] of Object.entries(EXAMPLE_LINKS)) {
      expect(parseArtistLink(link)).toMatchObject({ ok: true, platform });
    }
  });

  it.each([
    ["", "empty"],
    ["   ", "empty"],
    ["noor adeyemi", "not-a-link"],
    ["https://example.com/x", "unsupported"],
  ])("refuses %j as %s", (input, reason) => {
    expect(parseArtistLink(input)).toEqual({ ok: false, reason });
  });
});
