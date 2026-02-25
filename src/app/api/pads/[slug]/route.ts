import { NextResponse } from "next/server";
import { z } from "zod";
import { CodeLanguage } from "@prisma/client";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { canEditPad } from "@/lib/authz";

type Params = {
  params: Promise<{ slug: string }>;
};

const updatePadSchema = z.object({
  content: z.string().max(100000).optional(),
  language: z.nativeEnum(CodeLanguage).optional()
});

export async function GET(_: Request, { params }: Params) {
  const { slug } = await params;
  const pad = await prisma.pad.findUnique({ where: { slug } });

  if (!pad) {
    return NextResponse.json({ error: "Bloco nao encontrado." }, { status: 404 });
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

  if (!pad) {
    return NextResponse.json({ error: "Bloco nao encontrado." }, { status: 404 });
  }

  const isOwner = userId === pad.ownerId;
  const editable = canEditPad({
    userId,
    ownerId: pad.ownerId,
    editMode: pad.editMode
  });

  const body = (await request.json().catch(() => null)) as unknown;
  const parsed = updatePadSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Dados invalidos." }, { status: 400 });
  }

  const wantsContentUpdate = typeof parsed.data.content === "string";
  const wantsLanguageUpdate = typeof parsed.data.language === "string";

  if (!wantsContentUpdate && !wantsLanguageUpdate) {
    return NextResponse.json({ error: "Nada para atualizar." }, { status: 400 });
  }

  if (wantsContentUpdate && !editable) {
    if (!userId) {
      return NextResponse.json({ error: "Autenticacao obrigatoria." }, { status: 401 });
    }
    return NextResponse.json({ error: "Sem permissao de edicao." }, { status: 403 });
  }

  if (wantsLanguageUpdate && !userId) {
    return NextResponse.json({ error: "Autenticacao obrigatoria." }, { status: 401 });
  }

  if (wantsLanguageUpdate && !isOwner) {
    return NextResponse.json({ error: "Apenas o dono pode alterar a linguagem." }, { status: 403 });
  }

  const updated = await prisma.pad.update({
    where: { slug },
    data: {
      ...(wantsContentUpdate ? { content: parsed.data.content } : {}),
      ...(wantsLanguageUpdate ? { language: parsed.data.language } : {})
    }
  });

  return NextResponse.json({
    content: updated.content,
    language: updated.language,
    updatedAt: updated.updatedAt.toISOString()
  });
}

export async function DELETE(_: Request, { params }: Params) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Autenticacao obrigatoria." }, { status: 401 });
  }

  const { slug } = await params;
  const pad = await prisma.pad.findUnique({
    where: { slug },
    select: { id: true, ownerId: true }
  });

  if (!pad) {
    return NextResponse.json({ error: "Bloco nao encontrado." }, { status: 404 });
  }

  if (pad.ownerId !== session.user.id) {
    return NextResponse.json({ error: "Apenas o dono pode excluir o bloco." }, { status: 403 });
  }

  await prisma.pad.delete({ where: { id: pad.id } });

  return NextResponse.json({ ok: true });
}
