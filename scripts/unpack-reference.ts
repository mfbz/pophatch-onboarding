// Decodes docs/design/reference/onboarding-prototype.html into readable files under
// docs/design/reference/unpacked/ (gitignored): one HTML file per screen, in flow order, plus the
// images and fonts it embeds. The export is a self-unpacking bundle (gzip + base64 resources, one
// level per screen), which no agent or person can read as it is.
import { mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { gunzipSync } from "node:zlib";

import { repoPath } from "../checks/repo";

type Resource = { mime: string; compressed?: boolean; data: string };

const SOURCE = repoPath(
  "docs",
  "design",
  "reference",
  "onboarding-prototype.html"
);
const OUT = repoPath("docs", "design", "reference", "unpacked");
const EXTENSIONS: Record<string, string> = {
  "text/html": "html",
  "text/javascript": "js",
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/svg+xml": "svg",
  "font/woff2": "woff2",
};

function block(html: string, type: string): string {
  const match = new RegExp(
    `<script type="__bundler/${type}">([\\s\\S]*?)</script>`
  ).exec(html);
  if (!match?.[1]) throw new Error(`no __bundler/${type} block`);
  return match[1];
}

function decode(resource: Resource): Buffer {
  const bytes = Buffer.from(resource.data, "base64");
  return resource.compressed ? gunzipSync(bytes) : bytes;
}

function slug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

// Writes a bundle's assets beside its page and points the page at them, so it opens in a browser.
function unpackBundle(html: string, dir: string, name: string): void {
  const manifest = JSON.parse(block(html, "manifest")) as Record<
    string,
    Resource
  >;
  let page = JSON.parse(block(html, "template")) as string;
  mkdirSync(join(dir, "assets"), { recursive: true });
  for (const [id, resource] of Object.entries(manifest)) {
    // The runtime scripts (React, the prototype's renderer) are the same in every screen and say
    // nothing about the design.
    if (resource.mime === "text/javascript") continue;
    const file = `assets/${id}.${EXTENSIONS[resource.mime] ?? "bin"}`;
    writeFileSync(join(dir, file), decode(resource));
    page = page.replaceAll(id, file);
  }
  writeFileSync(join(dir, `${name}.html`), page);
}

function main(): void {
  const outer = readFileSync(SOURCE, "utf8");
  const manifest = JSON.parse(block(outer, "manifest")) as Record<
    string,
    Resource
  >;
  const order = JSON.parse(block(outer, "page_order")) as string[];
  const board = JSON.parse(block(outer, "template")) as string;
  rmSync(OUT, { recursive: true, force: true });
  mkdirSync(OUT, { recursive: true });
  order.forEach((id, index) => {
    const resource = manifest[id];
    if (!resource) throw new Error(`screen ${id} is missing`);
    const title =
      new RegExp(`title="([^"]+)"[^>]*#?${id}|#${id}" title="([^"]+)"`)
        .exec(board)
        ?.slice(1)
        .find(Boolean) ?? `screen ${index + 1}`;
    const name = `${String(index + 1).padStart(2, "0")}-${slug(title.replace(/^Onboarding · \d+ /, ""))}`;
    unpackBundle(decode(resource).toString("utf8"), OUT, name);
    console.log(`docs/design/reference/unpacked/${name}.html`);
  });
}

main();
