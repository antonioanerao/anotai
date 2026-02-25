const DEFAULT_MIN_SCORE = 0.5;
const RECAPTCHA_VERIFY_URL = "https://www.google.com/recaptcha/api/siteverify";

type RecaptchaVerifyResponse = {
  success?: boolean;
  score?: number;
  action?: string;
};

type CaptchaVerificationResult =
  | {
      ok: true;
      score: number | null;
    }
  | {
      ok: false;
      reason:
        | "missing-secret"
        | "missing-token"
        | "provider-http-error"
        | "provider-unreachable"
        | "provider-rejected"
        | "invalid-action"
        | "low-score";
    };

export function isCaptchaRequired(): boolean {
  return process.env.NODE_ENV === "production" && isCaptchaConfiguredOnServer();
}

export function getCaptchaSecretKey(): string {
  return process.env.RECAPTCHA_SECRET_KEY?.trim() ?? "";
}

function getCaptchaSiteKey(): string {
  return process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY?.trim() ?? "";
}

function isCaptchaConfiguredOnServer(): boolean {
  return getCaptchaSecretKey().length > 0 && getCaptchaSiteKey().length > 0;
}

function getCaptchaMinScore(): number {
  const rawValue = process.env.RECAPTCHA_MIN_SCORE?.trim();
  const parsed = Number(rawValue);

  if (!Number.isFinite(parsed)) {
    return DEFAULT_MIN_SCORE;
  }

  if (parsed < 0 || parsed > 1) {
    return DEFAULT_MIN_SCORE;
  }

  return parsed;
}

export async function verifyCaptchaToken(params: {
  token?: string;
  expectedAction: string;
}): Promise<CaptchaVerificationResult> {
  if (!isCaptchaRequired()) {
    return { ok: true, score: null };
  }

  const secretKey = getCaptchaSecretKey();
  if (!secretKey) {
    return { ok: false, reason: "missing-secret" };
  }

  const token = params.token?.trim();
  if (!token) {
    return { ok: false, reason: "missing-token" };
  }

  const requestBody = new URLSearchParams({
    secret: secretKey,
    response: token
  });

  let payload: RecaptchaVerifyResponse | null = null;

  try {
    const response = await fetch(RECAPTCHA_VERIFY_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: requestBody,
      cache: "no-store"
    });

    if (!response.ok) {
      return { ok: false, reason: "provider-http-error" };
    }

    payload = (await response.json()) as RecaptchaVerifyResponse;
  } catch {
    return { ok: false, reason: "provider-unreachable" };
  }

  if (!payload?.success) {
    return { ok: false, reason: "provider-rejected" };
  }

  if (payload.action !== params.expectedAction) {
    return { ok: false, reason: "invalid-action" };
  }

  const score = typeof payload.score === "number" ? payload.score : 0;
  if (score < getCaptchaMinScore()) {
    return { ok: false, reason: "low-score" };
  }

  return { ok: true, score };
}
