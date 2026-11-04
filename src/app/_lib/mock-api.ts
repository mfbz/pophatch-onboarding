import { z } from "zod";

import {
  ACCOUNT_NUMBERS,
  ACCOUNT_READS,
  DEMO_ARTIST,
  FOUND_ON,
  SOUNDCHARTS_READ,
} from "@/app/_lib/mock-data";

type ConnectPlatform = z.infer<typeof ConnectPlatformSchema>;

type FolderProvider = z.infer<typeof FolderProviderSchema>;

type Platform = z.infer<typeof PlatformSchema>;

type Artist = z.infer<typeof ArtistSchema>;

type Source =
  | { kind: "account"; platform: ConnectPlatform }
  | { kind: "folder"; provider: FolderProvider }
  | { kind: "files"; count: number };

type ReadLine = z.infer<typeof ReadLineSchema>;

type ReadingStep = { mark: ReadLine["mark"]; name: string };

type FoundOn = z.infer<typeof FoundOnSchema>;

const ConnectPlatformSchema = z.enum([
  "instagram",
  "tiktok",
  "youtube",
  "facebook",
  "soundcloud",
]);

const FolderProviderSchema = z.enum(["google-drive", "onedrive"]);

// Where a pasted link can come from.
const PlatformSchema = z.enum([
  "spotify",
  "instagram",
  "tiktok",
  "youtube",
  "apple-music",
  "soundcloud",
  "linktree",
]);

const ArtistSchema = z.object({
  id: z.string(),
  name: z.string(),
  city: z.string(),
  photo: z.string(),
  genres: z.array(z.string()),
  releases: z.array(
    z.object({
      title: z.string(),
      cover: z.string(),
      kind: z.string(),
      year: z.number(),
      plays: z.string(),
      tint: z.string(),
    })
  ),
  stats: z.object({
    releases: z.number(),
    monthlyListeners: z.number(),
    followers: z.number(),
    instagramFollowers: z.number(),
  }),
  accounts: z.array(
    z.object({
      platform: ConnectPlatformSchema,
      handle: z.string(),
      available: z.boolean(),
    })
  ),
});

const FoundOnSchema = z.object({
  platform: PlatformSchema,
  detail: z.string(),
});

const ReadLineSchema = z.object({
  mark: z.enum([
    "soundcharts",
    ...ConnectPlatformSchema.options,
    ...FolderProviderSchema.options,
    "files",
  ]),
  label: z.string(),
  detail: z.string(),
});

const CONNECT_NAMES: Record<ConnectPlatform, string> = {
  instagram: "Instagram",
  tiktok: "TikTok",
  youtube: "YouTube",
  facebook: "Facebook",
  soundcloud: "SoundCloud",
};

// What PopHatch can connect today, in the order it offers them. SoundCloud is not ready yet.
const CONNECT_PLATFORMS: { platform: ConnectPlatform; available: boolean }[] = [
  { platform: "instagram", available: true },
  { platform: "tiktok", available: true },
  { platform: "youtube", available: true },
  { platform: "facebook", available: true },
  { platform: "soundcloud", available: false },
];

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
        mark: source.platform,
        label: `Reading ${CONNECT_NAMES[source.platform]}`,
        detail: ACCOUNT_READS[source.platform],
      };
    case "folder":
      return {
        mark: source.provider,
        label: `Reading your ${FOLDER_NAMES[source.provider]} folder`,
        detail: "Contracts and statements",
      };
    case "files":
      return {
        mark: "files",
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

// The arguments are the contract a real service would take; the mock answers the same for all.
async function* searchPlatforms(_artistId: string): AsyncGenerator<FoundOn> {
  for (const found of FOUND_ON) {
    await wait(900);
    yield FoundOnSchema.parse(found);
  }
}

async function connectAccount(
  platform: ConnectPlatform,
  attempt: number
): Promise<
  | { status: "connected"; handle: string; numbers: string }
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
  if (!account) throw new Error(`The demo artist has no ${platform} account`);
  return {
    status: "connected",
    handle: account.handle,
    numbers: ACCOUNT_NUMBERS[platform],
  };
}

async function connectFolder(
  _provider: FolderProvider
): Promise<{ status: "connected" }> {
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

// The rows of step 5's panel, known before anything is read, in the order readSources reads them.
function readingPlan(sources: Source[]): ReadingStep[] {
  return [
    { mark: "soundcharts", name: "SoundCharts" },
    ...sources.map((source): ReadingStep => {
      switch (source.kind) {
        case "account":
          return {
            mark: source.platform,
            name: CONNECT_NAMES[source.platform],
          };
        case "folder":
          return { mark: source.provider, name: FOLDER_NAMES[source.provider] };
        case "files":
          return { mark: "files", name: "Your reports" };
      }
    }),
  ];
}

async function resolveFromAccount(_platform: ConnectPlatform): Promise<Artist> {
  await wait(600);
  return ArtistSchema.parse(DEMO_ARTIST);
}

export {
  ArtistSchema,
  ConnectPlatformSchema,
  FolderProviderSchema,
  PlatformSchema,
  ReadLineSchema,
  FOLDER_NAMES,
  CONNECT_NAMES,
  CONNECT_PLATFORMS,
  connectAccount,
  connectFolder,
  readingPlan,
  readSources,
  resolveFromAccount,
  resolveLink,
  searchPlatforms,
};
export type {
  Artist,
  ConnectPlatform,
  FolderProvider,
  FoundOn,
  Platform,
  ReadingStep,
  ReadLine,
  Source,
};
