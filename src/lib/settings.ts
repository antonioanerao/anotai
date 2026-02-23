import { prisma } from "@/lib/prisma";

export async function getPlatformSettings() {
  return prisma.platformSettings.upsert({
    where: { id: 1 },
    update: {},
    create: { id: 1, allowPublicSignup: true }
  });
}

export async function setAllowPublicSignup(
  allowPublicSignup: boolean,
  updatedById?: string
) {
  return prisma.platformSettings.upsert({
    where: { id: 1 },
    update: { allowPublicSignup, updatedById },
    create: { id: 1, allowPublicSignup, updatedById }
  });
}
