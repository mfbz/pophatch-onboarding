type Platform =
  | "spotify"
  | "instagram"
  | "tiktok"
  | "youtube"
  | "apple-music"
  | "soundcloud"
  | "linktree";

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
  "instagram.com": "instagram",
  "tiktok.com": "tiktok",
  "youtube.com": "youtube",
  "youtu.be": "youtube",
  "music.apple.com": "apple-music",
  "soundcloud.com": "soundcloud",
  "linktr.ee": "linktree",
};

// Artists paste links copied from an app, often without the scheme and with "www." or the
// mobile "m." in front; all of those name the same profile.
function parseArtistLink(input: string): ParsedLink {
  const text = input.trim();
  if (text === "") return { ok: false, reason: "empty" };

  const withScheme = /^[a-z][a-z\d+.-]*:\/\//i.test(text)
    ? text
    : `https://${text}`;
  let url: URL;
  try {
    url = new URL(withScheme);
  } catch {
    return { ok: false, reason: "not-a-link" };
  }
  if (!/^https?:$/.test(url.protocol) || !url.hostname.includes(".")) {
    return { ok: false, reason: "not-a-link" };
  }

  const host = url.hostname.replace(/^(www|m)\./, "");
  const platform = HOSTS[host];
  if (!platform) return { ok: false, reason: "unsupported" };

  return {
    ok: true,
    platform,
    url: `https://${host}${url.pathname}${url.search}`,
  };
}

export { EXAMPLE_LINKS, PLATFORM_NAMES, parseArtistLink };
export type { ParsedLink, Platform };
