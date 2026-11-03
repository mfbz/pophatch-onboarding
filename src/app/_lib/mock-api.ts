import { z } from "zod";

import {
  ACCOUNT_READS,
  DEMO_ARTIST,
  FOUND_ON,
  SOUNDCHARTS_READ,
} from "@/app/_lib/mock-data";
import type { Platform } from "@/app/_lib/parse-link";

type ConnectPlatform = z.infer<typeof ConnectPlatformSchema>;

type FolderProvider = "google-drive" | "onedrive";

type Artist = z.infer<typeof ArtistSchema>;

type Source =
  | { kind: "account"; platform: ConnectPlatform }
  | { kind: "folder"; provider: FolderProvider }
  | { kind: "files"; count: number };

type ReadLine = z.infer<typeof ReadLineSchema>;

const ConnectPlatformSchema = z.enum([
  "instagram",
  "tiktok",
  "youtube",
  "facebook",
  "soundcloud",
]);

const ArtistSchema = z.object({
  id: z.string(),
  name: z.string(),
  city: z.string(),
  photo: z.string(),
  releases: z.array(z.object({ title: z.string(), cover: z.string() })),
  stats: z.object({
    releases: z.number(),
    monthlyListeners: z.number(),
    followers: z.number(),
  }),
  accounts: z.array(
    z.object({
      platform: ConnectPlatformSchema,
      handle: z.string(),
      available: z.boolean(),
    })
  ),
});

const PlatformSchema = z.enum([
  "spotify",
  "instagram",
  "tiktok",
  "youtube",
  "apple-music",
  "soundcloud",
  "linktree",
]);

const ReadLineSchema = z.object({ label: z.string(), detail: z.string() });

const CONNECT_NAMES: Record<ConnectPlatform, string> = {
  instagram: "Instagram",
  tiktok: "TikTok",
  youtube: "YouTube",
  facebook: "Facebook",
  soundcloud: "SoundCloud",
};

const FOLDER_NAMES: Record<FolderProvider, string> = {
  "google-drive": "Google Drive",
  onedrive: "OneDrive",
};

// Delays stand in for the network so every waiting state in the flow can be seen.
function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function readLine(source: Source): ReadLine {
  switch (source.kind) {
    case "account":
      return {
        label: `Reading ${CONNECT_NAMES[source.platform]}`,
        detail: ACCOUNT_READS[source.platform],
      };
    case "folder":
      return {
        label: `Reading your ${FOLDER_NAMES[source.provider]} folder`,
        detail: "Contracts and statements",
      };
    case "files":
      return {
        label: "Reading your reports",
        detail: `${source.count} ${source.count === 1 ? "file" : "files"}`,
      };
  }
}

async function resolveLink(
  url: string
): Promise<{ status: "found"; artist: Artist } | { status: "not-found" }> {
  // A search that comes back empty takes longer, so step 2 is seen before the flow returns.
  if (url.includes("not-found")) {
    await wait(1800);
    return { status: "not-found" };
  }
  await wait(600);
  return { status: "found", artist: ArtistSchema.parse(DEMO_ARTIST) };
}

async function* searchPlatforms(artistId: string): AsyncGenerator<Platform> {
  void artistId;
  for (const platform of FOUND_ON) {
    await wait(900);
    yield PlatformSchema.parse(platform);
  }
}

async function connectAccount(
  platform: ConnectPlatform,
  attempt: number
): Promise<
  | { status: "connected"; handle: string }
  | { status: "failed"; message: string }
> {
  await wait(1200);
  // Facebook fails on the first try so the flow's failure state can be seen in the demo.
  if (platform === "facebook" && attempt === 1) {
    return { status: "failed", message: "Facebook didn't answer. Try again." };
  }
  const account = DEMO_ARTIST.accounts.find(
    (candidate) => candidate.platform === platform
  );
  return { status: "connected", handle: z.string().parse(account?.handle) };
}

async function connectFolder(
  provider: FolderProvider
): Promise<{ status: "connected" }> {
  void provider;
  await wait(1200);
  return { status: "connected" };
}

async function* readSources(sources: Source[]): AsyncGenerator<ReadLine> {
  await wait(1000);
  yield ReadLineSchema.parse(SOUNDCHARTS_READ);
  for (const source of sources) {
    await wait(1000);
    yield ReadLineSchema.parse(readLine(source));
  }
}

async function resolveFromAccount(platform: ConnectPlatform): Promise<Artist> {
  void platform;
  await wait(600);
  return ArtistSchema.parse(DEMO_ARTIST);
}

export {
  ArtistSchema,
  CONNECT_NAMES,
  connectAccount,
  connectFolder,
  readSources,
  resolveFromAccount,
  resolveLink,
  searchPlatforms,
};
export type { Artist, ConnectPlatform, FolderProvider, ReadLine, Source };
