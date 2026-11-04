// Each preset goal: its pill on step 5, how PopHatch says it back there, and the line the welcome
// plans around. The pill's words are what the flow state keeps, so the three travel together.
const GOALS = [
  {
    value: "My next release landing",
    echo: "your next release landing",
    line: "Get your next release heard",
  },
  {
    value: "More shows, better rooms",
    echo: "more shows, better rooms",
    line: "Book more shows, in better rooms",
  },
  {
    value: "A bigger fanbase",
    echo: "a bigger fanbase",
    line: "Grow the fanbase you already have",
  },
  {
    value: "Making money from this",
    echo: "making money from this",
    line: "Make your music pay",
  },
  {
    value: "Getting noticed by playlists, press and bookers",
    echo: "getting noticed by playlists, press and bookers",
    line: "Get in front of playlists, press and bookers",
  },
];

function presetGoal(value: string) {
  return GOALS.find((goal) => goal.value === value);
}

export { GOALS, presetGoal };
