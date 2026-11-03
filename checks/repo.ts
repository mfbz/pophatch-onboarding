import { execFileSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { dirname, join, relative, sep } from "node:path";
import { fileURLToPath } from "node:url";

// Every check resolves paths from this file, never from process.cwd(), so they pass from any folder.
const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
// Gitignored folders (dependencies, build output, local tool state) are not part of the repo's rules.
const SKIP_DIRS = new Set([
  "node_modules",
  ".git",
  ".next",
  "dist",
  "coverage",
  ".superpowers",
  "build",
  "out",
  ".vercel",
  ".secrets",
]);

function toPosix(path: string): string {
  return path.split(sep).join("/");
}

function repoPath(...parts: string[]): string {
  return join(ROOT, ...parts);
}

function readRepoFile(...parts: string[]): string {
  return readFileSync(repoPath(...parts), "utf8");
}

function walkRepo(dir: string = ROOT): string[] {
  const found: string[] = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (SKIP_DIRS.has(entry.name)) continue;
    const full = join(dir, entry.name);
    // An agent's worktree is a second checkout of the repo, so its files would be checked twice.
    if (toPosix(relative(ROOT, full)) === ".claude/worktrees") continue;
    found.push(toPosix(relative(ROOT, full)));
    // Symlinks are listed but not followed: .claude/skills points back into the repo.
    if (entry.isDirectory() && !entry.isSymbolicLink()) {
      found.push(...walkRepo(full));
    }
  }
  return found;
}

// What Git would commit: tracked files plus new ones that aren't ignored. The guards check exactly
// this, so a build output or a local secret that .gitignore keeps out never trips them.
function committableFiles(): string[] {
  return execFileSync(
    "git",
    ["ls-files", "--cached", "--others", "--exclude-standard", "-z"],
    { cwd: ROOT, encoding: "utf8", maxBuffer: 64 * 1024 * 1024 }
  )
    .split("\0")
    .filter((path) => path && existsSync(repoPath(path)));
}

export { committableFiles, readRepoFile, repoPath, walkRepo };
