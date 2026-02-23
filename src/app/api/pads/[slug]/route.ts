import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { canEditPad } from "@/lib/authz";

type Params = {
  params: Promise<{ slug: string }>;
};

const updatePadSchema = z.object({
  content: z.string().max(100000)
});

export async function GET(_: Request, { params }: Params) {
  const { slug } = await params;
  const pad = await prisma.pad.findUnique({ where: { slug } });

  if (!pad) {
    return NextResponse.json({ error: "Bloco nao encontrado." }, { status: 404 });
  }

  return NextResponse.json({
    content: pad.content,
    updatedAt: pad.updatedAt.toISOString()
  });
}

export async function PATCH(request: Request, { params }: Params) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Autenticacao obrigatoria." }, { status: 401 });
  }

  const { slug } = await params;
  const pad = await prisma.pad.findUnique({ where: { slug } });

  if (!pad) {
    return NextResponse.json({ error: "Bloco nao encontrado." }, { status: 404 });
  }

  const editable = canEditPad({
    userId: session.user.id,
    ownerId: pad.ownerId,
    editMode: pad.editMode
  });

  if (!editable) {
    return NextResponse.json({ error: "Sem permissao de edicao." }, { status: 403 });
  }

  const body = (await request.json().catch(() => null)) as unknown;
  const parsed = updatePadSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Conteudo invalido." }, { status: 400 });
  }

  const updated = await prisma.pad.update({
    where: { slug },
    data: { content: parsed.data.content }
  });

  return NextResponse.json({
    content: updated.content,
    updatedAt: updated.updatedAt.toISOString()
  });
}
