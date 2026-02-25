const RECAPTCHA_SCRIPT_ID = "google-recaptcha-v3-script";
const RECAPTCHA_SCRIPT_BASE_URL = "https://www.google.com/recaptcha/api.js";
const recaptchaSiteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY?.trim() ?? "";

declare global {
  interface Window {
    grecaptcha?: {
      ready(callback: () => void): void;
      execute(siteKey: string, options: { action: string }): Promise<string>;
    };
  }
}

let scriptLoadPromise: Promise<void> | null = null;

export function isCaptchaRequiredOnClient(): boolean {
  return process.env.NODE_ENV === "production" && recaptchaSiteKey.length > 0;
}

function loadRecaptchaScript(): Promise<void> {
  if (window.grecaptcha) {
    return Promise.resolve();
  }

  if (scriptLoadPromise) {
    return scriptLoadPromise;
  }

  scriptLoadPromise = new Promise<void>((resolve, reject) => {
    const existingScript = document.getElementById(RECAPTCHA_SCRIPT_ID) as HTMLScriptElement | null;
    if (existingScript) {
      existingScript.addEventListener("load", () => resolve(), { once: true });
      existingScript.addEventListener("error", () => reject(new Error("captcha-script-load-failed")), {
        once: true
      });
      return;
    }

    const script = document.createElement("script");
    script.id = RECAPTCHA_SCRIPT_ID;
    script.src = `${RECAPTCHA_SCRIPT_BASE_URL}?render=${encodeURIComponent(recaptchaSiteKey)}`;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("captcha-script-load-failed"));

    document.head.appendChild(script);
  });

  return scriptLoadPromise;
}

export async function getCaptchaToken(action: string): Promise<string> {
  if (!isCaptchaRequiredOnClient()) {
    return "";
  }

  if (!recaptchaSiteKey) {
    throw new Error("captcha-site-key-missing");
  }

  await loadRecaptchaScript();

  if (!window.grecaptcha) {
    throw new Error("captcha-script-unavailable");
  }

  return new Promise<string>((resolve, reject) => {
    window.grecaptcha?.ready(() => {
      window.grecaptcha
        ?.execute(recaptchaSiteKey, { action })
        .then((token) => {
          if (!token) {
            reject(new Error("captcha-empty-token"));
            return;
          }

          resolve(token);
        })
        .catch(() => reject(new Error("captcha-execution-failed")));
    });
  });
}

export function cleanupCaptchaArtifacts(): void {
  const script = document.getElementById(RECAPTCHA_SCRIPT_ID);
  if (script) {
    script.remove();
  }

  document.querySelectorAll(".grecaptcha-badge").forEach((element) => element.remove());
  scriptLoadPromise = null;
}
