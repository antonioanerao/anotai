import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/password";

const adminCreateUserSchema = z.object({
  name: z.string().trim().max(120).optional(),
  email: z.string().email(),
  password: z.string().min(8).max(200)
});

function normalizeEmail(value: string): string {
  return value.trim().toLowerCase();
}

function isPrimaryAdminEmail(email: string): boolean {
  const target = process.env.PRIMARY_ADMIN_EMAIL?.trim().toLowerCase();
  return Boolean(target && normalizeEmail(email) === target);
}

export async function POST(request: Request) {
  const session = await auth();

  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Acesso negado." }, { status: 403 });
  }

  const body = (await request.json().catch(() => null)) as unknown;
  const parsed = adminCreateUserSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Dados invalidos." }, { status: 400 });
  }

  const email = normalizeEmail(parsed.data.email);
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ error: "Email ja cadastrado." }, { status: 409 });
  }

  const passwordHash = await hashPassword(parsed.data.password);

  const user = await prisma.user.create({
    data: {
      name: parsed.data.name,
      email,
      passwordHash,
      role: isPrimaryAdminEmail(email) ? "ADMIN" : "USER"
    }
  });

  return NextResponse.json({ id: user.id }, { status: 201 });
}
