"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { PASSWORD_MIN_LENGTH } from "@/lib/password-policy";
import { CAPTCHA_ACTION_LOGIN } from "@/lib/captcha-actions";
import { getCaptchaToken, isCaptchaRequiredOnClient } from "@/lib/captcha-client";

function getSafeCallbackPath(rawCallbackUrl: string | null): string {
  if (!rawCallbackUrl) return "/";

  if (rawCallbackUrl.startsWith("/")) {
    return rawCallbackUrl;
  }

  try {
    const parsed = new URL(rawCallbackUrl);
    if (parsed.origin !== window.location.origin) {
      return "/";
    }
    return `${parsed.pathname}${parsed.search}${parsed.hash}` || "/";
  } catch {
    return "/";
  }
}

export function LoginForm() {
  const captchaRequired = isCaptchaRequiredOnClient();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsLoading(true);
    const callbackPath = getSafeCallbackPath(searchParams.get("callbackUrl"));
    let captchaToken: string | undefined;

    if (captchaRequired) {
      try {
        captchaToken = await getCaptchaToken(CAPTCHA_ACTION_LOGIN);
      } catch {
        setError("Nao foi possivel validar o captcha. Tente novamente.");
        setIsLoading(false);
        return;
      }
    }

    const result = await signIn("credentials", {
      email,
      password,
      captchaToken,
      captchaAction: CAPTCHA_ACTION_LOGIN,
      redirect: false,
      callbackUrl: callbackPath
    });

    setIsLoading(false);

    if (!result || result.error) {
      setError("Credenciais invalidas ou captcha nao validado.");
      return;
    }

    router.replace(callbackPath);
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
      <div>
        <label htmlFor="email" className="mb-1 block text-sm font-medium text-slate-700">
          Email
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none ring-brand-500 transition focus:ring"
        />
      </div>

      <div>
        <label htmlFor="password" className="mb-1 block text-sm font-medium text-slate-700">
          Senha
        </label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
          minLength={PASSWORD_MIN_LENGTH}
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none ring-brand-500 transition focus:ring"
        />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={isLoading}
        className="w-full rounded-md bg-brand-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-900 disabled:cursor-not-allowed disabled:bg-slate-400"
      >
        {isLoading ? "Entrando..." : "Entrar"}
      </button>
    </form>
  );
}
