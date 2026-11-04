import { describe, expect, it } from "vitest";

import manifest from "./manifest";
import robots from "./robots";
import sitemap from "./sitemap";

describe("site files", () => {
  it("lets crawlers in and points them at the sitemap", () => {
    expect(robots()).toEqual({
      rules: { userAgent: "*", allow: "/" },
      sitemap: "http://localhost:3000/sitemap.xml",
    });
  });

  it("lists only the start", () => {
    expect(sitemap().map((page) => page.url)).toEqual([
      "http://localhost:3000/",
    ]);
  });

  it("installs on a home screen with the name, colours and logo", () => {
    expect(manifest()).toMatchObject({
      name: "PopHatch",
      start_url: "/",
      theme_color: "#0A2EB0",
      icons: [{ src: "/icon.png", sizes: "512x512" }],
    });
  });
});
