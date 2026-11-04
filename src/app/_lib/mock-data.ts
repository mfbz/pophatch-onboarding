// The demo artist every link resolves to. Invented, like every name and number here.
const DEMO_ARTIST = {
  id: "noor-adeyemi",
  name: "Noor Adeyemi",
  city: "Atlanta, GA",
  photo: "/artist/noor.jpg",
  genres: ["Alt R&B", "Neo-soul", "Late-night"],
  releases: [
    {
      title: "Lantern",
      cover: "/artist/cover-lantern.jpg",
      kind: "Single",
      year: 2025,
      plays: "412K plays",
      tint: "#ffb020",
    },
    {
      title: "Lowlight",
      cover: "/artist/cover-lowlight.jpg",
      kind: "EP",
      year: 2024,
      plays: "96K plays",
      tint: "#ff4fa3",
    },
    {
      title: "Grove",
      cover: "/artist/cover-grove.jpg",
      kind: "Single",
      year: 2024,
      plays: "61K plays",
      tint: "#d4ff3a",
    },
    {
      title: "Slow Water",
      cover: "/artist/cover-slow-water.jpg",
      kind: "Single",
      year: 2023,
      plays: "38K plays",
      tint: "#7fb4ff",
    },
    {
      title: "Early Hours",
      cover: "/artist/cover-early-hours.jpg",
      kind: "Album",
      year: 2022,
      plays: "120K plays",
      tint: "#ffd27a",
    },
  ],
  stats: {
    releases: 11,
    monthlyListeners: 18_400,
    followers: 2_310,
    instagramFollowers: 4_120,
  },
  accounts: [
    { platform: "instagram", handle: "@nooradeyemi", available: true },
    { platform: "tiktok", handle: "@nooradeyemi", available: true },
    { platform: "youtube", handle: "@nooradeyemi", available: true },
    { platform: "facebook", handle: "Noor Adeyemi", available: true },
    {
      platform: "soundcloud",
      handle: "soundcloud.com/nooradeyemi",
      available: false,
    },
  ],
};

const FOUND_ON = [
  { platform: "spotify", detail: "18.4k listeners" },
  { platform: "instagram", detail: "4,120 followers" },
  { platform: "youtube", detail: "860 subscribers" },
  { platform: "tiktok", detail: "1,200 followers" },
];

const SOUNDCHARTS_READ = {
  mark: "soundcharts",
  label: "Reading SoundCharts",
  detail: "11 releases, 18 months of history",
};

const ACCOUNT_READS = {
  instagram: "312 posts, 4,120 followers",
  tiktok: "1,200 followers",
  youtube: "860 subscribers",
  facebook: "1,860 followers",
  soundcloud: "24 tracks",
};

// What each account shows once connected, as the artist would read it on the platform.
const ACCOUNT_NUMBERS = {
  instagram: "312 posts · 4,120 followers",
  tiktok: "1,200 followers",
  youtube: "860 subscribers",
  facebook: "1,860 followers",
  soundcloud: "24 tracks",
};

export {
  ACCOUNT_NUMBERS,
  ACCOUNT_READS,
  DEMO_ARTIST,
  FOUND_ON,
  SOUNDCHARTS_READ,
};
