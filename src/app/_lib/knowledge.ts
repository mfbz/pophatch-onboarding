import { CONNECT_NAMES } from "@/app/_lib/mock-api";
import type { OnboardingState } from "@/app/_lib/onboarding-state";

type MeterMark = "spotify" | "instagram" | "tiktok" | "youtube" | "facebook";

type Segment = { mark: MeterMark; state: "filled" | "empty" | "failed" };

type Knowledge = { percent: number; segments: Segment[]; line: string };

const ACCOUNTS = ["instagram", "tiktok", "youtube", "facebook"] as const;

// What the manager says as the card fills, one line per account connected (0 to 4).
const LINES = [
  "Spotify got me started. Each account fills in more.",
  "Good start. Now I can see your fans, not just your listeners.",
  "Getting clearer. Every account adds something new.",
  "Nearly the whole picture.",
  "That's everything I can read for now.",
];

const MANUAL_FIRST_LINE = "You're in my books. Each account fills in more.";

const MANUAL_WAITING = "Connect an account and I'll find you.";

const FINDING = "Got it. Finding you from there.";

// How well PopHatch knows the artist, as step 4's meter shows it. Spotify is where any link leads
// (SoundCharts reads from it), so it counts once the artist is known; each connected account adds a
// fifth. Files and folders are read in step 5 but say nothing about the artist's audience, so they
// do not move the meter.
function knowledge(state: OnboardingState): Knowledge {
  const known = state.path === "link" || state.artist !== null;
  const states = ACCOUNTS.map((platform) => state.accounts[platform]?.status);
  const connected = states.filter((status) => status === "connected").length;
  const failed = ACCOUNTS.find(
    (platform) => state.accounts[platform]?.status === "failed"
  );

  const segments: Segment[] = [
    { mark: "spotify", state: known ? "filled" : "empty" },
    ...ACCOUNTS.map((platform, index): Segment => ({
      mark: platform,
      state:
        states[index] === "connected"
          ? "filled"
          : states[index] === "failed"
            ? "failed"
            : "empty",
    })),
  ];

  const filled = segments.filter((segment) => segment.state === "filled");
  // A failure is the news only until an account gets through; after that the line follows the
  // progress and the failure stays on its segment and its row.
  const line =
    failed && connected === 0
      ? `${CONNECT_NAMES[failed]} didn't answer. Try it again whenever you like.`
      : !known
        ? connected > 0
          ? FINDING
          : MANUAL_WAITING
        : connected === 1 && state.path === "manual"
          ? MANUAL_FIRST_LINE
          : (LINES[connected] ?? "");

  return { percent: filled.length * 20, segments, line };
}

export { knowledge };
export type { Knowledge, MeterMark, Segment };
