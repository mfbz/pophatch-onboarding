import type { Platform } from "@/app/_lib/mock-api";

type ParsedLink =
  | { ok: true; platform: Platform; url: string }
  | { ok: false; reason: "empty" | "not-a-link" | "unsupported" };

const PLATFORM_NAMES: Record<Platform, string> = {
  spotify: "Spotify",
  instagram: "Instagram",
  tiktok: "TikTok",
  youtube: "YouTube",
  "apple-music": "Apple Music",
  soundcloud: "SoundCloud",
  linktree: "Linktree",
};

// One link per platform for the demo artist, so the flow can be tried without a real profile.
const EXAMPLE_LINKS: Record<Platform, string> = {
  spotify: "https://open.spotify.com/artist/5kZ2nooradeyemi",
  instagram: "https://www.instagram.com/nooradeyemi",
  tiktok: "https://www.tiktok.com/@nooradeyemi",
  youtube: "https://www.youtube.com/@nooradeyemi",
  "apple-music": "https://music.apple.com/us/artist/noor-adeyemi/1700000000",
  soundcloud: "https://soundcloud.com/nooradeyemi",
  linktree: "https://linktr.ee/nooradeyemi",
};

const HOSTS: Record<string, Platform> = {
  "open.spotify.com": "spotify",
  "spotify.link": "spotify",
  "instagram.com": "instagram",
  "tiktok.com": "tiktok",
  "vm.tiktok.com": "tiktok",
  "youtube.com": "youtube",
  "youtu.be": "youtube",
  "music.youtube.com": "youtube",
  "music.apple.com": "apple-music",
  "soundcloud.com": "soundcloud",
  "on.soundcloud.com": "soundcloud",
  "linktr.ee": "linktree",
};

const SPOTIFY_URI = /^spotify:(artist|album|track|playlist):(\w+)$/i;

// Artists paste what an app's share button gives them: a link without the scheme, with "www." or
// the mobile "m." in front, a short share link, a Spotify URI, or a sentence with the link in it.
// All of those name the same profile. Anything with another scheme (mailto:, javascript:) or a
// user name before the host is not a profile link.
function parseArtistLink(input: string): ParsedLink {
  let text = input.trim();
  if (text === "") return { ok: false, reason: "empty" };

  const uri = SPOTIFY_URI.exec(text);
  if (uri) text = `https://open.spotify.com/${uri[1]?.toLowerCase()}/${uri[2]}`;
  if (/\s/.test(text)) {
    const inText = /https?:\/\/\S+/i.exec(text);
    if (!inText) return { ok: false, reason: "not-a-link" };
    text = inText[0];
  }

  const hasScheme = /^[a-z][a-z\d+.-]*:/i.test(text);
  if (hasScheme && !/^https?:\/\//i.test(text)) {
    return { ok: false, reason: "not-a-link" };
  }
  let url: URL;
  try {
    url = new URL(hasScheme ? text : `https://${text}`);
  } catch {
    return { ok: false, reason: "not-a-link" };
  }
  if (!url.hostname.includes(".") || url.username || url.password) {
    return { ok: false, reason: "not-a-link" };
  }

  const host = url.hostname.replace(/\.$/, "").replace(/^((www|m)\.)+/, "");
  const platform = HOSTS[host];
  if (!platform) return { ok: false, reason: "unsupported" };

  return {
    ok: true,
    platform,
    url: `https://${host}${url.pathname}${url.search}`,
  };
}

export { EXAMPLE_LINKS, PLATFORM_NAMES, parseArtistLink };
export type { ParsedLink };
