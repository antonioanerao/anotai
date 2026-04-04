import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { updatePlatformSettings } from "@/lib/settings";
import { parseAllowedSignupDomains } from "@/lib/signup-domain-policy";

const settingsSchema = z
  .object({
    allowPublicSignup: z.boolean().optional(),
    allowedSignupDomains: z.string().max(4000).optional(),
    requireAuthToCreatePad: z.boolean().optional(),
    siteTitle: z.string().trim().min(1).max(80).optional(),
    homeTitle: z.string().trim().min(1).max(120).optional(),
    metaDescription: z.string().trim().min(1).max(320).optional(),
    canonicalUrl: z
      .string()
      .max(500)
      .transform((value) => value.trim())
      .refine((value) => value === "" || z.string().url().safeParse(value).success, {
        message: "Canonical URL invalida."
      })
      .optional(),
    ogImagePath: z.string().max(500).optional(),
    indexHome: z.boolean().optional()
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "Nenhuma configuracao enviada."
  });

export async function PATCH(request: Request) {
  const session = await auth();

  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Acesso negado." }, { status: 403 });
  }

  const body = (await request.json().catch(() => null)) as unknown;
  const parsed = settingsSchema.safeParse(body);

  if (!parsed.success) {
    const firstIssue = parsed.error.issues[0];
    return NextResponse.json({ error: firstIssue?.message ?? "Dados invalidos." }, { status: 400 });
  }

  if (typeof parsed.data.allowedSignupDomains === "string") {
    const parsedDomains = parseAllowedSignupDomains(parsed.data.allowedSignupDomains);
    if (parsedDomains.invalidDomains.length > 0) {
      return NextResponse.json(
        {
          error: `Dominio(s) invalido(s): ${parsedDomains.invalidDomains.join(", ")}`
        },
        { status: 400 }
      );
    }
  }

  try {
    const settings = await updatePlatformSettings({
      ...(typeof parsed.data.allowPublicSignup === "boolean"
        ? { allowPublicSignup: parsed.data.allowPublicSignup }
        : {}),
      ...(typeof parsed.data.allowedSignupDomains === "string"
        ? { allowedSignupDomainsRaw: parsed.data.allowedSignupDomains }
        : {}),
      ...(typeof parsed.data.requireAuthToCreatePad === "boolean"
        ? { requireAuthToCreatePad: parsed.data.requireAuthToCreatePad }
        : {}),
      ...(typeof parsed.data.siteTitle === "string" ? { siteTitle: parsed.data.siteTitle } : {}),
      ...(typeof parsed.data.homeTitle === "string" ? { homeTitle: parsed.data.homeTitle } : {}),
      ...(typeof parsed.data.metaDescription === "string"
        ? { metaDescription: parsed.data.metaDescription }
        : {}),
      ...(typeof parsed.data.canonicalUrl === "string" ? { canonicalUrl: parsed.data.canonicalUrl } : {}),
      ...(typeof parsed.data.ogImagePath === "string" ? { ogImagePath: parsed.data.ogImagePath } : {}),
      ...(typeof parsed.data.indexHome === "boolean" ? { indexHome: parsed.data.indexHome } : {}),
      updatedById: session.user.id
    });

    return NextResponse.json({
      allowPublicSignup: settings.allowPublicSignup,
      allowedSignupDomains: settings.allowedSignupDomains,
      requireAuthToCreatePad: settings.requireAuthToCreatePad,
      siteTitle: settings.siteTitle,
      homeTitle: settings.homeTitle,
      metaDescription: settings.metaDescription,
      canonicalUrl: settings.canonicalUrl,
      ogImagePath: settings.ogImagePath,
      indexHome: settings.indexHome,
      updatedAt: settings.updatedAt.toISOString()
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Falha ao atualizar configuracao.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
