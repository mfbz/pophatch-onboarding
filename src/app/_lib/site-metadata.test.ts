import type { Metadata } from "next";
import { describe, expect, it } from "vitest";

import * as connect from "@/app/connect/page";
import * as finding from "@/app/finding/page";
import * as found from "@/app/found/page";
import * as home from "@/app/page";
import * as together from "@/app/together/page";
import * as welcome from "@/app/welcome/page";

import { SITE_TITLE, siteMetadata } from "./site-metadata";

describe("site metadata", () => {
  it("names the product and what it does, within what a search result shows", () => {
    expect(siteMetadata.title).toEqual({
      default: SITE_TITLE,
      template: "%s · PopHatch",
    });
    expect(SITE_TITLE.length).toBeLessThanOrEqual(60);
    const description = siteMetadata.description ?? "";
    expect(description.length).toBeGreaterThanOrEqual(70);
    expect(description.length).toBeLessThanOrEqual(160);
  });

  it("gives a shared link a large preview with the same words", () => {
    expect(siteMetadata.openGraph).toMatchObject({
      type: "website",
      siteName: "PopHatch",
      title: SITE_TITLE,
      description: siteMetadata.description,
      url: "/",
    });
    expect(siteMetadata.twitter).toMatchObject({
      card: "summary_large_image",
      title: SITE_TITLE,
    });
  });

  it("points every step at the start, where a shared link should land", () => {
    expect(siteMetadata.metadataBase).toBeInstanceOf(URL);
    expect(siteMetadata.alternates?.canonical).toBe("/");
  });

  it("keeps the start in search results and the steps after it out", () => {
    expect((home as { metadata?: Metadata }).metadata).toBeUndefined();
    for (const step of [finding, found, connect, together, welcome]) {
      expect(step.metadata.robots).toEqual({ index: false, follow: true });
    }
  });
});
