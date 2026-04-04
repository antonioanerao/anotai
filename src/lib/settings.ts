import { unlink } from "node:fs/promises";
import path from "node:path";
import { prisma } from "@/lib/prisma";
import {
  parseAllowedSignupDomains,
  serializeAllowedSignupDomains
} from "@/lib/signup-domain-policy";

export const defaultPlatformSeoSettings = {
  siteTitle: "AnotAI",
  homeTitle: "Compartilhamento de codigo para treinamentos",
  metaDescription:
    "Crie e compartilhe blocos de codigo por URL com leitura publica, modos de edicao e colaboracao para aulas, treinamentos e suporte tecnico.",
  canonicalUrl: "",
  ogImagePath: "",
  indexHome: true
} as const;

export const defaultPlatformSettings = {
  allowPublicSignup: true,
  allowedSignupDomains: "",
  requireAuthToCreatePad: true,
  ...defaultPlatformSeoSettings
} as const;

export async function getPlatformSettings() {
  const existing = await prisma.platformSettings.findUnique({
    where: { id: 1 }
  });
  if (existing) return existing;

  try {
    return await prisma.platformSettings.create({
      data: {
        id: 1,
        ...defaultPlatformSettings
      }
    });
  } catch {
    return prisma.platformSettings.findUniqueOrThrow({
      where: { id: 1 }
    });
  }
}

export async function updatePlatformSettings(
  params: Partial<{
    allowPublicSignup: boolean;
    allowedSignupDomainsRaw: string;
    requireAuthToCreatePad: boolean;
    siteTitle: string;
    homeTitle: string;
    metaDescription: string;
    canonicalUrl: string;
    ogImagePath: string;
    indexHome: boolean;
  }> & {
    updatedById?: string;
  }
) {
  const existingSettings = await getPlatformSettings();
  let safeUpdatedById: string | undefined;

  if (params.updatedById) {
    const existingUser = await prisma.user.findUnique({
      where: { id: params.updatedById },
      select: { id: true }
    });
    safeUpdatedById = existingUser?.id;
  }

  const data: {
    allowPublicSignup?: boolean;
    allowedSignupDomains?: string;
    requireAuthToCreatePad?: boolean;
    siteTitle?: string;
    homeTitle?: string;
    metaDescription?: string;
    canonicalUrl?: string;
    ogImagePath?: string;
    indexHome?: boolean;
    updatedById?: string;
  } = {
    updatedById: safeUpdatedById
  };

  if (typeof params.allowPublicSignup === "boolean") {
    data.allowPublicSignup = params.allowPublicSignup;
  }

  if (typeof params.requireAuthToCreatePad === "boolean") {
    data.requireAuthToCreatePad = params.requireAuthToCreatePad;
  }

  if (typeof params.allowedSignupDomainsRaw === "string") {
    const parsedDomains = parseAllowedSignupDomains(params.allowedSignupDomainsRaw);
    data.allowedSignupDomains = serializeAllowedSignupDomains(parsedDomains.domains);
  }

  if (typeof params.siteTitle === "string") {
    data.siteTitle = params.siteTitle;
  }

  if (typeof params.homeTitle === "string") {
    data.homeTitle = params.homeTitle;
  }

  if (typeof params.metaDescription === "string") {
    data.metaDescription = params.metaDescription;
  }

  if (typeof params.canonicalUrl === "string") {
    data.canonicalUrl = params.canonicalUrl;
  }

  if (typeof params.ogImagePath === "string") {
    data.ogImagePath = params.ogImagePath;
  }

  if (typeof params.indexHome === "boolean") {
    data.indexHome = params.indexHome;
  }

  const updatedSettings = await prisma.platformSettings.update({
    where: { id: 1 },
    data
  });

  if (
    typeof params.ogImagePath === "string" &&
    existingSettings.ogImagePath &&
    existingSettings.ogImagePath !== params.ogImagePath &&
    existingSettings.ogImagePath.startsWith("/seo/og-image-")
  ) {
    const relativeOgImagePath = existingSettings.ogImagePath.replace(/^\//, "");
    const previousImagePath = path.join(process.cwd(), "public", relativeOgImagePath);
    await unlink(previousImagePath).catch(() => undefined);
  }

  return updatedSettings;
}

export async function getPlatformSettingsWithFallback() {
  return getPlatformSettings().catch(() => defaultPlatformSettings);
}
