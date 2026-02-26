import { NextResponse } from "next/server";
import { z } from "zod";
import { EditMode } from "@prisma/client";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { buildUniqueSlug } from "@/lib/slugs";
import { getPlatformSettings } from "@/lib/settings";

const createPadSchema = z.object({
  slug: z.string().min(3).max(80).optional(),
  editMode: z.nativeEnum(EditMode).default(EditMode.OWNER_ONLY)
});

export async function POST(request: Request) {
  const [session, settings] = await Promise.all([auth(), getPlatformSettings()]);
  const isAuthenticated = Boolean(session?.user?.id);

  if (!isAuthenticated && settings.requireAuthToCreatePad) {
    return NextResponse.json({ error: "Autenticacao obrigatoria." }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as unknown;
  const parsed = createPadSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Dados invalidos." }, { status: 400 });
  }

  const slug = await buildUniqueSlug(parsed.data.slug);
  const editMode = !isAuthenticated ? EditMode.ANONYMOUS : parsed.data.editMode;

  const pad = await prisma.pad.create({
    data: {
      slug,
      editMode,
      ownerId: session?.user?.id ?? null
    }
  });

  return NextResponse.json({ slug: pad.slug }, { status: 201 });
}
