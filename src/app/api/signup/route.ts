import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/password";
import { getPlatformSettings } from "@/lib/settings";
import { CAPTCHA_ACTION_SIGNUP } from "@/lib/captcha-actions";
import { verifyCaptchaToken } from "@/lib/captcha";
import {
  isEmailAllowedByDomainPolicy,
  parseAllowedSignupDomains
} from "@/lib/signup-domain-policy";
import {
  EMAIL_ALREADY_REGISTERED_MESSAGE,
  INVALID_DATA_MESSAGE,
  PASSWORD_CONFIRMATION_MISMATCH_MESSAGE,
  PASSWORD_MAX_LENGTH,
  PASSWORD_MIN_LENGTH
} from "@/lib/password-policy";

const signupSchema = z
  .object({
    name: z.string().trim().max(120).optional(),
    email: z.string().email(),
    password: z.string().min(PASSWORD_MIN_LENGTH).max(PASSWORD_MAX_LENGTH),
    confirmPassword: z.string().min(PASSWORD_MIN_LENGTH).max(PASSWORD_MAX_LENGTH),
    captchaToken: z.string().optional(),
    captchaAction: z.string().optional()
  })
  .superRefine((data, ctx) => {
    if (data.password !== data.confirmPassword) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["confirmPassword"],
        message: PASSWORD_CONFIRMATION_MISMATCH_MESSAGE
      });
    }
  });

function normalizeEmail(value: string): string {
  return value.trim().toLowerCase();
}

function isPrimaryAdminEmail(email: string): boolean {
  const target = process.env.PRIMARY_ADMIN_EMAIL?.trim().toLowerCase();
  return Boolean(target && normalizeEmail(email) === target);
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as unknown;
  const parsed = signupSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? INVALID_DATA_MESSAGE }, { status: 400 });
  }
  if (parsed.data.captchaAction && parsed.data.captchaAction !== CAPTCHA_ACTION_SIGNUP) {
    return NextResponse.json({ error: "Falha na validacao do captcha." }, { status: 403 });
  }

  const captchaValidation = await verifyCaptchaToken({
    token: parsed.data.captchaToken,
    expectedAction: CAPTCHA_ACTION_SIGNUP
  });

  if (!captchaValidation.ok) {
    const statusCode = captchaValidation.reason === "missing-secret" ? 503 : 403;
    return NextResponse.json({ error: "Falha na validacao do captcha." }, { status: statusCode });
  }

  const session = await auth();
  const settings = await getPlatformSettings();

  const isAdminRequest = session?.user?.role === "ADMIN";
  if (!settings.allowPublicSignup && !isAdminRequest) {
    return NextResponse.json({ error: "Cadastro publico desativado." }, { status: 403 });
  }

  const email = normalizeEmail(parsed.data.email);
  const allowedSignupDomains = parseAllowedSignupDomains(settings.allowedSignupDomains).domains;
  if (!isAdminRequest && !isEmailAllowedByDomainPolicy(email, allowedSignupDomains)) {
    return NextResponse.json(
      { error: "Dominio de email nao permitido para cadastro publico." },
      { status: 403 }
    );
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ error: EMAIL_ALREADY_REGISTERED_MESSAGE }, { status: 409 });
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
