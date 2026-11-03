// The demo artist every link resolves to. Invented, like every name and number here.
const DEMO_ARTIST = {
  id: "noor-adeyemi",
  name: "Noor Adeyemi",
  city: "Atlanta, GA",
  photo: "/artist/noor.jpg",
  releases: [
    { title: "Lantern", cover: "/artist/cover-lantern.jpg" },
    { title: "Lowlight", cover: "/artist/cover-lowlight.jpg" },
    { title: "Grove", cover: "/artist/cover-grove.jpg" },
    { title: "Slow Water", cover: "/artist/cover-slow-water.jpg" },
    { title: "Early Hours", cover: "/artist/cover-early-hours.jpg" },
  ],
  stats: { releases: 11, monthlyListeners: 18_400, followers: 2_310 },
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

const FOUND_ON = ["spotify", "instagram", "youtube", "tiktok"];

const SOUNDCHARTS_READ = {
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

export { ACCOUNT_READS, DEMO_ARTIST, FOUND_ON, SOUNDCHARTS_READ };
