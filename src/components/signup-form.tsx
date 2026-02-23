"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  PASSWORD_CONFIRMATION_MISMATCH_MESSAGE,
  SIGNUP_FAILED_MESSAGE,
  PASSWORD_MAX_LENGTH,
  PASSWORD_MIN_LENGTH,
  PASSWORD_LENGTH_HINT,
  PASSWORD_LIMIT_REACHED_MESSAGE
} from "@/lib/password-policy";

const MAX_PASSWORD_MESSAGE = PASSWORD_LIMIT_REACHED_MESSAGE;

function isTextInsertionKey(event: React.KeyboardEvent<HTMLInputElement>): boolean {
  if (event.ctrlKey || event.metaKey || event.altKey) return false;
  return event.key.length === 1;
}

function shouldBlockByMaxLength(event: React.KeyboardEvent<HTMLInputElement>): boolean {
  const target = event.currentTarget;
  const selectionStart = target.selectionStart ?? 0;
  const selectionEnd = target.selectionEnd ?? 0;
  const hasSelection = selectionStart !== selectionEnd;
  return target.value.length >= PASSWORD_MAX_LENGTH && !hasSelection;
}

type SignupFormState = {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
};

const initialFormState: SignupFormState = {
  name: "",
  email: "",
  password: "",
  confirmPassword: ""
};

export function SignupForm() {
  const [form, setForm] = useState<SignupFormState>(initialFormState);
  const [error, setError] = useState<string | null>(null);
  const [limitWarning, setLimitWarning] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  function updateField(field: keyof SignupFormState, value: string) {
    const isPasswordField = field === "password" || field === "confirmPassword";
    if (isPasswordField && value.length < PASSWORD_MAX_LENGTH) {
      setLimitWarning("");
    }
    setForm((current) => ({ ...current, [field]: value }));
  }

  function onPasswordKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (!isTextInsertionKey(event)) return;
    if (!shouldBlockByMaxLength(event)) return;

    event.preventDefault();
    setLimitWarning(MAX_PASSWORD_MESSAGE);
  }

  function onPasswordPaste(event: React.ClipboardEvent<HTMLInputElement>) {
    const target = event.currentTarget;
    const pastedText = event.clipboardData.getData("text");
    const selectionStart = target.selectionStart ?? 0;
    const selectionEnd = target.selectionEnd ?? 0;
    const nextLength =
      target.value.length - (selectionEnd - selectionStart) + pastedText.length;

    if (nextLength <= PASSWORD_MAX_LENGTH) return;

    event.preventDefault();
    const allowedChars = PASSWORD_MAX_LENGTH - (target.value.length - (selectionEnd - selectionStart));
    const safeChunk = pastedText.slice(0, Math.max(0, allowedChars));
    const nextValue =
      target.value.slice(0, selectionStart) + safeChunk + target.value.slice(selectionEnd);

    const field = target.name as keyof SignupFormState;
    updateField(field, nextValue);
    setLimitWarning(MAX_PASSWORD_MESSAGE);
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    setError(null);

    if (form.password !== form.confirmPassword) {
      setError(PASSWORD_CONFIRMATION_MISMATCH_MESSAGE);
      setIsLoading(false);
      return;
    }

    const response = await fetch("/api/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.name,
        email: form.email,
        password: form.password,
        confirmPassword: form.confirmPassword
      })
    });

    if (!response.ok) {
      const payload = (await response.json().catch(() => ({}))) as { error?: string };
      setError(payload.error ?? SIGNUP_FAILED_MESSAGE);
      setIsLoading(false);
      return;
    }

    await signIn("credentials", {
      email: form.email,
      password: form.password,
      redirect: false
    });

    setIsLoading(false);
    setForm(initialFormState);
    setLimitWarning("");
    router.push("/");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
      <div>
        <label htmlFor="name" className="mb-1 block text-sm font-medium text-slate-700">
          Nome
        </label>
        <input
          id="name"
          type="text"
          value={form.name}
          onChange={(event) => updateField("name", event.target.value)}
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none ring-brand-500 transition focus:ring"
        />
      </div>

      <div>
        <label htmlFor="email" className="mb-1 block text-sm font-medium text-slate-700">
          Email
        </label>
        <input
          id="email"
          type="email"
          value={form.email}
          onChange={(event) => updateField("email", event.target.value)}
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
          name="password"
          type="password"
          value={form.password}
          onChange={(event) => updateField("password", event.target.value)}
          onKeyDown={onPasswordKeyDown}
          onPaste={onPasswordPaste}
          required
          minLength={PASSWORD_MIN_LENGTH}
          maxLength={PASSWORD_MAX_LENGTH}
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none ring-brand-500 transition focus:ring"
        />
      </div>

      <div>
        <label htmlFor="confirmPassword" className="mb-1 block text-sm font-medium text-slate-700">
          Confirmar senha
        </label>
        <input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          value={form.confirmPassword}
          onChange={(event) => updateField("confirmPassword", event.target.value)}
          onKeyDown={onPasswordKeyDown}
          onPaste={onPasswordPaste}
          required
          minLength={PASSWORD_MIN_LENGTH}
          maxLength={PASSWORD_MAX_LENGTH}
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none ring-brand-500 transition focus:ring"
        />
      </div>

      <p className="text-xs text-slate-500">{PASSWORD_LENGTH_HINT}</p>

      {limitWarning && <p className="text-sm text-amber-700">{limitWarning}</p>}
      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={isLoading}
        className="w-full rounded-md bg-brand-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-900 disabled:cursor-not-allowed disabled:bg-slate-400"
      >
        {isLoading ? "Criando conta..." : "Criar conta"}
      </button>
    </form>
  );
}
