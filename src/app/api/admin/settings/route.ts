import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { setSignupPolicy } from "@/lib/settings";
import { parseAllowedSignupDomains } from "@/lib/signup-domain-policy";

const settingsSchema = z.object({
  allowPublicSignup: z.boolean(),
  allowedSignupDomains: z.string().max(4000)
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

  const parsedDomains = parseAllowedSignupDomains(parsed.data.allowedSignupDomains);
  if (parsedDomains.invalidDomains.length > 0) {
    return NextResponse.json(
      {
        error: `Dominio(s) invalido(s): ${parsedDomains.invalidDomains.join(", ")}`
      },
      { status: 400 }
    );
  }

  const settings = await setSignupPolicy({
    allowPublicSignup: parsed.data.allowPublicSignup,
    allowedSignupDomainsRaw: parsed.data.allowedSignupDomains,
    updatedById: session.user.id
  });

  return NextResponse.json({
    allowPublicSignup: settings.allowPublicSignup,
    allowedSignupDomains: settings.allowedSignupDomains,
    updatedAt: settings.updatedAt.toISOString()
  });
}
