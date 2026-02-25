import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/password";
import { PASSWORD_MIN_LENGTH } from "@/lib/password-policy";
import { CAPTCHA_ACTION_LOGIN } from "@/lib/captcha-actions";
import { verifyCaptchaToken } from "@/lib/captcha";

const credentialSchema = z.object({
  email: z.string().email(),
  password: z.string().min(PASSWORD_MIN_LENGTH),
  captchaToken: z.string().optional(),
  captchaAction: z.string().optional()
});

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function isPrimaryAdminEmail(email: string): boolean {
  const primaryAdminEmail = process.env.PRIMARY_ADMIN_EMAIL?.trim().toLowerCase();
  return Boolean(primaryAdminEmail && normalizeEmail(email) === primaryAdminEmail);
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  trustHost: true,
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        captchaToken: { label: "CaptchaToken", type: "text" },
        captchaAction: { label: "CaptchaAction", type: "text" }
      },
      async authorize(rawCredentials) {
        const parsed = credentialSchema.safeParse(rawCredentials);
        if (!parsed.success) return null;
        const captchaValidation = await verifyCaptchaToken({
          token: parsed.data.captchaToken,
          expectedAction: CAPTCHA_ACTION_LOGIN
        });
        if (!captchaValidation.ok) return null;
        if (parsed.data.captchaAction && parsed.data.captchaAction !== CAPTCHA_ACTION_LOGIN) return null;

        const email = normalizeEmail(parsed.data.email);
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user?.passwordHash) return null;

        const valid = await verifyPassword(user.passwordHash, parsed.data.password);
        if (!valid) return null;

        let role = user.role;
        if (isPrimaryAdminEmail(user.email) && role !== "ADMIN") {
          await prisma.user.update({
            where: { id: user.id },
            data: { role: "ADMIN" }
          });
          role = "ADMIN";
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role
        };
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id;
        const userRole = (user as { role?: "USER" | "ADMIN" }).role;
        token.role = userRole ?? "USER";
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub ?? "";
        session.user.role = (token.role as "USER" | "ADMIN") ?? "USER";
      }

      return session;
    }
  }
});
