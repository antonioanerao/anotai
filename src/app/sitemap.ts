import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";
import { getPlatformSettingsWithFallback } from "@/lib/settings";
import { resolveSiteUrl } from "@/lib/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const settings = await getPlatformSettingsWithFallback();
  const siteUrl = resolveSiteUrl(settings.canonicalUrl);
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: siteUrl.origin,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1
    },
    {
      url: `${siteUrl.origin}/login`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.4
    },
    {
      url: `${siteUrl.origin}/signup`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5
    }
  ];

  try {
    const pads = await prisma.pad.findMany({
      select: {
        slug: true,
        updatedAt: true
      },
      orderBy: {
        updatedAt: "desc"
      }
    });

    const padPages: MetadataRoute.Sitemap = pads.map((pad) => ({
      url: `${siteUrl.origin}/pads/${pad.slug}`,
      lastModified: pad.updatedAt,
      changeFrequency: "daily",
      priority: 0.7
    }));

    return [...staticPages, ...padPages];
  } catch {
    return staticPages;
  }
}
