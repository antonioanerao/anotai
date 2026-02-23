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
    select: { id: true }
  });

  if (!existing) {
    return NextResponse.json({ error: "Bloco nao encontrado." }, { status: 404 });
  }

  await prisma.pad.delete({ where: { id } });

  return NextResponse.json({ ok: true });
}
