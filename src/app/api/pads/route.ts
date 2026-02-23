import { NextResponse } from "next/server";
import { z } from "zod";
import { EditMode } from "@prisma/client";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { buildUniqueSlug } from "@/lib/slugs";

const createPadSchema = z.object({
  slug: z.string().min(3).max(80).optional(),
  editMode: z.nativeEnum(EditMode).default(EditMode.OWNER_ONLY)
});

export async function POST(request: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Autenticacao obrigatoria." }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as unknown;
  const parsed = createPadSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Dados invalidos." }, { status: 400 });
  }

  const slug = await buildUniqueSlug(parsed.data.slug);

  const pad = await prisma.pad.create({
    data: {
      slug,
      editMode: parsed.data.editMode,
      ownerId: session.user.id
    }
  });

  return NextResponse.json({ slug: pad.slug }, { status: 201 });
}
