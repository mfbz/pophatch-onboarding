import { z } from "zod";

type Env = Record<string, string | undefined>;

const SiteUrlSchema = z.url({ protocol: /^https?$/ });

// The address the app is served from, which a shared link's preview, the canonical link and the
// sitemap all need in full. SITE_URL names it outright; on Vercel it is the production domain,
// then the deployment's own address; anywhere else, localhost.
function siteUrl(env: Env = process.env): URL {
  if (env.SITE_URL) return new URL(SiteUrlSchema.parse(env.SITE_URL));
  const host = env.VERCEL_PROJECT_PRODUCTION_URL ?? env.VERCEL_URL;
  if (host) return new URL(`https://${host}`);
  return new URL(`http://localhost:${env.PORT ?? 3000}`);
}

export { siteUrl };
