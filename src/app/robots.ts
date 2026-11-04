import type { MetadataRoute } from "next";

import { siteUrl } from "@/lib/site-url";

// Every crawler is welcome; the steps after the start keep themselves out of results with their
// own noindex (app/_lib/site-metadata.ts), which a crawler can only read if it is allowed in.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: new URL("/sitemap.xml", siteUrl()).href,
  };
}
