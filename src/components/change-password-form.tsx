"use client";

import { useState } from "react";
import {
  PASSWORD_MAX_LENGTH,
  PASSWORD_MIN_LENGTH
} from "@/lib/password-policy";

const MAX_PASSWORD_MESSAGE = `Limite de ${PASSWORD_MAX_LENGTH} caracteres atingido.`;

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

type PasswordFormState = {
  currentPassword: string;
  newPassword: string;
  confirmNewPassword: string;
};

const initialState: PasswordFormState = {
  currentPassword: "",
  newPassword: "",
  confirmNewPassword: ""
};

export function ChangePasswordForm() {
  const [form, setForm] = useState<PasswordFormState>(initialState);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [limitWarning, setLimitWarning] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  function updateField(field: keyof PasswordFormState, value: string) {
    if (value.length < PASSWORD_MAX_LENGTH) {
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

    const field = target.name as keyof PasswordFormState;
    updateField(field, nextValue);
    setLimitWarning(MAX_PASSWORD_MESSAGE);
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (form.newPassword !== form.confirmNewPassword) {
      setError("A confirmacao da nova senha nao confere.");
      return;
    }

    if (form.newPassword === form.currentPassword) {
      setError("A nova senha deve ser diferente da senha atual.");
      return;
    }

    setIsLoading(true);

    const response = await fetch("/api/account/password", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form)
    });

    setIsLoading(false);

    if (!response.ok) {
      const payload = (await response.json().catch(() => ({}))) as { error?: string };
      setError(payload.error ?? "Nao foi possivel alterar sua senha.");
      return;
    }

    setForm(initialState);
    setSuccess("Senha atualizada com sucesso.");
    setLimitWarning("");
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
      <div>
        <label htmlFor="currentPassword" className="mb-1 block text-sm font-medium text-slate-700">
          Senha atual
        </label>
        <input
          id="currentPassword"
          name="currentPassword"
          type="password"
          value={form.currentPassword}
          onChange={(event) => updateField("currentPassword", event.target.value)}
          onKeyDown={onPasswordKeyDown}
          onPaste={onPasswordPaste}
          required
          minLength={PASSWORD_MIN_LENGTH}
          maxLength={PASSWORD_MAX_LENGTH}
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none ring-brand-500 transition focus:ring"
        />
      </div>

      <div>
        <label htmlFor="newPassword" className="mb-1 block text-sm font-medium text-slate-700">
          Nova senha
        </label>
        <input
          id="newPassword"
          name="newPassword"
          type="password"
          value={form.newPassword}
          onChange={(event) => updateField("newPassword", event.target.value)}
          onKeyDown={onPasswordKeyDown}
          onPaste={onPasswordPaste}
          required
          minLength={PASSWORD_MIN_LENGTH}
          maxLength={PASSWORD_MAX_LENGTH}
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none ring-brand-500 transition focus:ring"
        />
      </div>

      <div>
        <label htmlFor="confirmNewPassword" className="mb-1 block text-sm font-medium text-slate-700">
          Confirmar nova senha
        </label>
        <input
          id="confirmNewPassword"
          name="confirmNewPassword"
          type="password"
          value={form.confirmNewPassword}
          onChange={(event) => updateField("confirmNewPassword", event.target.value)}
          onKeyDown={onPasswordKeyDown}
          onPaste={onPasswordPaste}
          required
          minLength={PASSWORD_MIN_LENGTH}
          maxLength={PASSWORD_MAX_LENGTH}
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none ring-brand-500 transition focus:ring"
        />
      </div>

      <p className="text-xs text-slate-500">
        Sua senha deve ter entre {PASSWORD_MIN_LENGTH} e {PASSWORD_MAX_LENGTH} caracteres.
      </p>

      {limitWarning && <p className="text-sm text-amber-700">{limitWarning}</p>}
      {error && <p className="text-sm text-red-600">{error}</p>}
      {success && <p className="text-sm text-emerald-700">{success}</p>}

      <button
        type="submit"
        disabled={isLoading}
        className="rounded-md bg-brand-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-900 disabled:cursor-not-allowed disabled:bg-slate-400"
      >
        {isLoading ? "Salvando..." : "Alterar senha"}
      </button>
    </form>
  );
}
