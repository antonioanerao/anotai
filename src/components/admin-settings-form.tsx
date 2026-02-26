"use client";

import { useState } from "react";

type Props = {
  initialAllowPublicSignup: boolean;
  initialAllowedSignupDomains: string;
  initialRequireAuthToCreatePad: boolean;
};

export function AdminSettingsForm({
  initialAllowPublicSignup,
  initialAllowedSignupDomains,
  initialRequireAuthToCreatePad
}: Props) {
  const [allowPublicSignup, setAllowPublicSignup] = useState(initialAllowPublicSignup);
  const [allowedSignupDomains, setAllowedSignupDomains] = useState(initialAllowedSignupDomains);
  const [requireAuthToCreatePad, setRequireAuthToCreatePad] = useState(initialRequireAuthToCreatePad);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    setMessage("");

    const response = await fetch("/api/admin/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        allowPublicSignup,
        allowedSignupDomains,
        requireAuthToCreatePad
      })
    });
    const payload = (await response.json().catch(() => ({}))) as { error?: string };

    setIsLoading(false);

    if (!response.ok) {
      setMessage(payload.error ?? "Falha ao atualizar configuracao.");
      return;
    }

    setMessage("Configuracao atualizada.");
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
        <input
          type="checkbox"
          checked={allowPublicSignup}
          onChange={(event) => setAllowPublicSignup(event.target.checked)}
        />
        Permitir cadastro publico
      </label>

      <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
        <input
          type="checkbox"
          checked={requireAuthToCreatePad}
          onChange={(event) => setRequireAuthToCreatePad(event.target.checked)}
        />
        Exigir login para criar blocos
      </label>

      <div className="space-y-1">
        <label htmlFor="allowedSignupDomains" className="block text-sm font-medium text-slate-700">
          Dominios permitidos para cadastro
        </label>
        <textarea
          id="allowedSignupDomains"
          value={allowedSignupDomains}
          onChange={(event) => setAllowedSignupDomains(event.target.value)}
          placeholder={"mpac.mp.br\nmpro.mp.br"}
          rows={4}
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none ring-brand-500 transition focus:ring"
        />
        <p className="text-xs text-slate-500">
          Informe um dominio por linha (ou separados por virgula). Deixe vazio para aceitar qualquer dominio.
        </p>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="rounded-md bg-brand-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-900 disabled:cursor-not-allowed disabled:bg-slate-400"
      >
        {isLoading ? "Salvando..." : "Salvar"}
      </button>

      {message && <p className="text-sm text-slate-600">{message}</p>}
    </form>
  );
}
