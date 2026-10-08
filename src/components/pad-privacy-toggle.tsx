"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type PadPrivacyToggleProps = {
  slug: string;
  initialIsPrivate: boolean;
};

export function PadPrivacyToggle({ slug, initialIsPrivate }: PadPrivacyToggleProps) {
  const router = useRouter();
  const [isPrivate, setIsPrivate] = useState(initialIsPrivate);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  async function togglePrivacy() {
    setIsSaving(true);
    setError("");

    try {
      const response = await fetch(`/api/pads/${slug}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPrivate: !isPrivate })
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => ({}))) as { error?: string };
        setError(payload.error ?? "Não foi possível alterar a privacidade.");
        return;
      }

      const payload = (await response.json()) as { isPrivate: boolean };
      setIsPrivate(payload.isPrivate);
      router.refresh();
    } catch {
      setError("Não foi possível alterar a privacidade.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="mt-3 flex flex-wrap items-center gap-3 text-sm">
      <span className="font-medium text-slate-700">Acesso: {isPrivate ? "privado" : "público"}</span>
      <button
        type="button"
        onClick={togglePrivacy}
        disabled={isSaving}
        className="rounded-md border border-slate-300 px-3 py-1.5 font-medium text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isSaving ? "Salvando..." : isPrivate ? "Tornar público" : "Tornar privado"}
      </button>
      {isPrivate && <span className="text-slate-600">Só você pode abrir e editar este bloco após entrar na conta.</span>}
      {!isPrivate && <span className="text-slate-600">Enquanto privado, só você poderá editar.</span>}
      {error && <span role="alert" className="text-red-600">{error}</span>}
    </div>
  );
}
