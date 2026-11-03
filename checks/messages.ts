// CI's half of the commit-msg hook: a commit made with the hook skipped, and the pull request's
// title and body (which become the squash commit on main), pass the same message guards.
// Usage: tsx checks/messages.ts <base ref>, with PR_TITLE and PR_BODY in the environment.
import { execFileSync } from "node:child_process";

import { checkMessage } from "./guards";

const base = process.argv[2];
if (!base) {
  process.stderr.write("usage: messages.ts <base ref>\n");
  process.exit(2);
}

const commits = execFileSync(
  "git",
  ["log", "--format=%H%x00%B%x00", `${base}..HEAD`],
  { encoding: "utf8", maxBuffer: 64 * 1024 * 1024 }
)
  .split("\0")
  .map((part) => part.trim())
  .reduce<Array<[string, string]>>((pairs, part, i, parts) => {
    if (i % 2 === 0 && part) pairs.push([part.slice(0, 7), parts[i + 1] ?? ""]);
    return pairs;
  }, []);

const problems = [
  ...commits.flatMap(([sha, message]) =>
    checkMessage(message).map((p) => `${sha} ${p}`)
  ),
  ...checkMessage(process.env.PR_TITLE ?? "").map((p) => `PR title: ${p}`),
  ...checkMessage(process.env.PR_BODY ?? "").map((p) => `PR body: ${p}`),
];
if (problems.length > 0) {
  process.stderr.write(
    ["Message guards failed:", ...problems.map((p) => `  - ${p}`), ""].join(
      "\n"
    )
  );
  process.exit(1);
}
process.stdout.write(
  `Message guards passed (${commits.length} commits, title and body).\n`
);
