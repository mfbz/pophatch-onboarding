import type { MetadataRoute } from "next";

import { siteUrl } from "@/lib/site-url";

// One page to list: the start. Every other step is reached through the flow.
export default function sitemap(): MetadataRoute.Sitemap {
  return [{ url: siteUrl().href, changeFrequency: "monthly", priority: 1 }];
}
