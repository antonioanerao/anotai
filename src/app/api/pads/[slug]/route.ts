import { NextResponse } from "next/server";
import { z } from "zod";
import { CodeLanguage } from "@prisma/client";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { canEditPad, canReadPad } from "@/lib/authz";

type Params = {
  params: Promise<{ slug: string }>;
};

const updatePadSchema = z.object({
  content: z.string().max(100000).optional(),
  language: z.nativeEnum(CodeLanguage).optional(),
  isPrivate: z.boolean().optional()
});

export async function GET(_: Request, { params }: Params) {
  const session = await auth();
  const { slug } = await params;
  const pad = await prisma.pad.findUnique({ where: { slug } });

  if (!pad || !canReadPad({ userId: session?.user?.id, ownerId: pad.ownerId, isPrivate: pad.isPrivate })) {
    return NextResponse.json({ error: "Bloco não encontrado." }, { status: 404 });
  }

  return NextResponse.json({
    content: pad.content,
    language: pad.language,
    updatedAt: pad.updatedAt.toISOString()
  });
}

export async function PATCH(request: Request, { params }: Params) {
  const session = await auth();
  const userId = session?.user?.id;

  const { slug } = await params;
  const pad = await prisma.pad.findUnique({ where: { slug } });

  if (!pad || !canReadPad({ userId, ownerId: pad.ownerId, isPrivate: pad.isPrivate })) {
    return NextResponse.json({ error: "Bloco não encontrado." }, { status: 404 });
  }

  const isOwner = userId === pad.ownerId;
  const editable = canEditPad({
    userId,
    ownerId: pad.ownerId,
    editMode: pad.editMode,
    isPrivate: pad.isPrivate
  });

  const body = (await request.json().catch(() => null)) as unknown;
  const parsed = updatePadSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Dados inválidos." }, { status: 400 });
  }

  const wantsContentUpdate = typeof parsed.data.content === "string";
  const wantsLanguageUpdate = typeof parsed.data.language === "string";
  const wantsPrivacyUpdate = typeof parsed.data.isPrivate === "boolean";
  const hasOwner = pad.ownerId !== null;

  if (!wantsContentUpdate && !wantsLanguageUpdate && !wantsPrivacyUpdate) {
    return NextResponse.json({ error: "Nada para atualizar." }, { status: 400 });
  }

  if (wantsContentUpdate && !editable) {
    if (!userId) {
      return NextResponse.json({ error: "Autenticação obrigatória." }, { status: 401 });
    }
    return NextResponse.json({ error: "Sem permissão de edição." }, { status: 403 });
  }

  if (wantsLanguageUpdate && hasOwner && !userId) {
    return NextResponse.json({ error: "Autenticação obrigatória." }, { status: 401 });
  }

  if (wantsLanguageUpdate && hasOwner && !isOwner) {
    return NextResponse.json({ error: "Apenas o dono pode alterar a linguagem." }, { status: 403 });
  }

  if (wantsPrivacyUpdate && !isOwner) {
    return NextResponse.json({ error: "Apenas o dono pode alterar a privacidade." }, { status: 403 });
  }

  const update = await prisma.pad.updateMany({
    where: {
      id: pad.id,
      ...(isOwner ? { ownerId: userId } : { isPrivate: false })
    },
    data: {
      ...(wantsContentUpdate ? { content: parsed.data.content } : {}),
      ...(wantsLanguageUpdate ? { language: parsed.data.language } : {}),
      ...(wantsPrivacyUpdate
        ? {
            isPrivate: parsed.data.isPrivate
          }
        : {})
    }
  });

  if (update.count === 0) {
    return NextResponse.json({ error: "Bloco não encontrado." }, { status: 404 });
  }

  const updated = await prisma.pad.findUniqueOrThrow({ where: { id: pad.id } });

  if (!canReadPad({ userId, ownerId: updated.ownerId, isPrivate: updated.isPrivate })) {
    return NextResponse.json({ error: "Bloco não encontrado." }, { status: 404 });
  }

  return NextResponse.json({
    content: updated.content,
    language: updated.language,
    isPrivate: updated.isPrivate,
    updatedAt: updated.updatedAt.toISOString()
  });
}

export async function DELETE(_: Request, { params }: Params) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Autenticação obrigatória." }, { status: 401 });
  }

  const { slug } = await params;
  const pad = await prisma.pad.findUnique({
    where: { slug },
    select: { id: true, ownerId: true }
  });

  if (!pad) {
    return NextResponse.json({ error: "Bloco não encontrado." }, { status: 404 });
  }

  if (pad.ownerId !== session.user.id) {
    return NextResponse.json({ error: "Apenas o dono pode excluir o bloco." }, { status: 403 });
  }

  await prisma.pad.delete({ where: { id: pad.id } });

  return NextResponse.json({ ok: true });
}
