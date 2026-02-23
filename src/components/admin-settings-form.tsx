"use client";

import { useState } from "react";

type Props = {
  initialAllowPublicSignup: boolean;
};

export function AdminSettingsForm({ initialAllowPublicSignup }: Props) {
  const [allowPublicSignup, setAllowPublicSignup] = useState(initialAllowPublicSignup);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    setMessage("");

    const response = await fetch("/api/admin/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ allowPublicSignup })
    });

    setIsLoading(false);

    if (!response.ok) {
      setMessage("Falha ao atualizar configuracao.");
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
