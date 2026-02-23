import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { setAllowPublicSignup } from "@/lib/settings";

const settingsSchema = z.object({
  allowPublicSignup: z.boolean()
});

export async function PATCH(request: Request) {
  const session = await auth();

  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Acesso negado." }, { status: 403 });
  }

  const body = (await request.json().catch(() => null)) as unknown;
  const parsed = settingsSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Dados invalidos." }, { status: 400 });
  }

  const settings = await setAllowPublicSignup(
    parsed.data.allowPublicSignup,
    session.user.id
  );

  return NextResponse.json({
    allowPublicSignup: settings.allowPublicSignup,
    updatedAt: settings.updatedAt.toISOString()
  });
}
