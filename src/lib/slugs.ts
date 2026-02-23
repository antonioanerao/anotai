import { customAlphabet } from "nanoid";
import { prisma } from "@/lib/prisma";

const randomSlug = customAlphabet("abcdefghijkmnopqrstuvwxyz0123456789", 10);

export function normalizeSlug(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-{2,}/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function buildUniqueSlug(preferred?: string): Promise<string> {
  const base = preferred ? normalizeSlug(preferred) : randomSlug();

  if (base.length < 3) {
    return buildUniqueSlug();
  }

  const exists = await prisma.pad.findUnique({ where: { slug: base } });
  if (!exists) return base;

  for (let index = 0; index < 5; index += 1) {
    const fallback = `${base}-${randomSlug().slice(0, 4)}`;
    const fallbackExists = await prisma.pad.findUnique({ where: { slug: fallback } });
    if (!fallbackExists) return fallback;
  }

  return buildUniqueSlug();
}
