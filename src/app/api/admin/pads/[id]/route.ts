import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

type Params = {
  params: Promise<{ id: string }>;
};

export async function DELETE(_: Request, { params }: Params) {
  const session = await auth();

  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Acesso negado." }, { status: 403 });
  }

  const { id } = await params;

  const existing = await prisma.pad.findUnique({
    where: { id },
    select: { id: true, ownerId: true, isPrivate: true }
  });

  if (!existing) {
    return NextResponse.json({ error: "Bloco nao encontrado." }, { status: 404 });
  }

  if (existing.isPrivate && existing.ownerId !== session.user.id) {
    return NextResponse.json({ error: "Bloco nao encontrado." }, { status: 404 });
  }

  const deleted = await prisma.pad.deleteMany({
    where: {
      id,
      OR: [{ isPrivate: false }, { ownerId: session.user.id }]
    }
  });

  if (deleted.count === 0) {
    return NextResponse.json({ error: "Bloco nao encontrado." }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
