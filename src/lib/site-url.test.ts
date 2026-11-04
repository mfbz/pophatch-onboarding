import { describe, expect, it } from "vitest";

import { siteUrl } from "./site-url";

describe("siteUrl", () => {
  it("takes the address it is given", () => {
    expect(
      siteUrl({
        SITE_URL: "https://pophatch.example.com",
        VERCEL_PROJECT_PRODUCTION_URL: "pophatch.vercel.app",
      }).href
    ).toBe("https://pophatch.example.com/");
  });

  it("falls back to the production domain, then the deployment, on Vercel", () => {
    expect(
      siteUrl({
        VERCEL_PROJECT_PRODUCTION_URL: "pophatch.vercel.app",
        VERCEL_URL: "pophatch-abc123.vercel.app",
      }).href
    ).toBe("https://pophatch.vercel.app/");
    expect(siteUrl({ VERCEL_URL: "pophatch-abc123.vercel.app" }).href).toBe(
      "https://pophatch-abc123.vercel.app/"
    );
  });

  it("is localhost anywhere else", () => {
    expect(siteUrl({}).href).toBe("http://localhost:3000/");
    expect(siteUrl({ PORT: "3100" }).href).toBe("http://localhost:3100/");
  });

  it("refuses an address that is not a URL", () => {
    expect(() => siteUrl({ SITE_URL: "pophatch" })).toThrow();
  });
});
