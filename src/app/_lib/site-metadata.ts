import type { Metadata } from "next";

import { siteUrl } from "@/lib/site-url";

// The start's title: what a search result and a shared link show first.
const SITE_TITLE = "PopHatch · Your manager, from one link";

const DESCRIPTION =
  "A manager for musical artists. Paste one link to your music and PopHatch finds your pages, reads your streams and fans, and plans what to do next.";

// What every page says about itself to a browser, a search engine and an app a link is shared in.
// Each step adds only its own title, read out when the step changes. A shared link of any step
// previews the start and points to it as the canonical page, because a step opened on its own
// sends the artist to the start anyway. The preview image is `app/opengraph-image.png`.
const siteMetadata: Metadata = {
  metadataBase: siteUrl(),
  title: { default: SITE_TITLE, template: "%s · PopHatch" },
  description: DESCRIPTION,
  applicationName: "PopHatch",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: "PopHatch",
    locale: "en_US",
    url: "/",
    title: SITE_TITLE,
    description: DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description: DESCRIPTION,
  },
};

// The steps after the start, which only make sense on the way through the flow.
const STEP_ROBOTS: Metadata["robots"] = { index: false, follow: true };

export { SITE_TITLE, siteMetadata, STEP_ROBOTS };
