import { prisma } from "@/lib/prisma";

export async function getPlatformSettings() {
  const existing = await prisma.platformSettings.findUnique({
    where: { id: 1 }
  });
  if (existing) return existing;

  try {
    return await prisma.platformSettings.create({
      data: { id: 1, allowPublicSignup: true }
    });
  } catch {
    return prisma.platformSettings.findUniqueOrThrow({
      where: { id: 1 }
    });
  }
}

export async function setAllowPublicSignup(
  allowPublicSignup: boolean,
  updatedById?: string
) {
  await getPlatformSettings();

  return prisma.platformSettings.update({
    where: { id: 1 },
    data: { allowPublicSignup, updatedById }
  });
}
