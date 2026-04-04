import type { MetadataRoute } from "next";
import { getPlatformSettingsWithFallback } from "@/lib/settings";
import { resolveSiteUrl } from "@/lib/site";

export default async function robots(): Promise<MetadataRoute.Robots> {
  const settings = await getPlatformSettingsWithFallback();
  const siteUrl = resolveSiteUrl(settings.canonicalUrl);

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/admin/"]
    },
    sitemap: `${siteUrl.origin}/sitemap.xml`,
    host: siteUrl.origin
  };
}
