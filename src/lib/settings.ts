import { prisma } from "@/lib/prisma";
import {
  parseAllowedSignupDomains,
  serializeAllowedSignupDomains
} from "@/lib/signup-domain-policy";

export async function getPlatformSettings() {
  const existing = await prisma.platformSettings.findUnique({
    where: { id: 1 }
  });
  if (existing) return existing;

  try {
    return await prisma.platformSettings.create({
      data: { id: 1, allowPublicSignup: true, allowedSignupDomains: "" }
    });
  } catch {
    return prisma.platformSettings.findUniqueOrThrow({
      where: { id: 1 }
    });
  }
}

export async function setSignupPolicy(
  params: {
    allowPublicSignup: boolean;
    allowedSignupDomainsRaw: string;
    updatedById?: string;
  }
) {
  await getPlatformSettings();
  const parsedDomains = parseAllowedSignupDomains(params.allowedSignupDomainsRaw);
  const serializedDomains = serializeAllowedSignupDomains(parsedDomains.domains);

  return prisma.platformSettings.update({
    where: { id: 1 },
    data: {
      allowPublicSignup: params.allowPublicSignup,
      allowedSignupDomains: serializedDomains,
      updatedById: params.updatedById
    }
  });
}
