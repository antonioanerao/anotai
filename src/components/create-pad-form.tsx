"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type EditMode = "OWNER_ONLY" | "COLLABORATIVE" | "ANONYMOUS";

type CreatePadFormProps = {
  anonymousOnly?: boolean;
};

export function CreatePadForm({ anonymousOnly = false }: CreatePadFormProps) {
  const [slug, setSlug] = useState("");
  const [editMode, setEditMode] = useState<EditMode>(anonymousOnly ? "ANONYMOUS" : "OWNER_ONLY");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsLoading(true);

    const response = await fetch("/api/pads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        slug: slug || undefined,
        editMode: anonymousOnly ? "ANONYMOUS" : editMode
      })
    });

    setIsLoading(false);

    if (!response.ok) {
      const payload = (await response.json().catch(() => ({}))) as { error?: string };
      setError(payload.error ?? "Nao foi possivel criar o pad.");
      return;
    }

    const payload = (await response.json()) as { slug: string };
    router.push(`/pads/${payload.slug}`);
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="space-y-1">
        <label htmlFor="slug" className="block text-sm font-medium text-slate-700">
          Slug (opcional)
        </label>
        <input
          id="slug"
          value={slug}
          onChange={(event) => setSlug(event.target.value)}
          placeholder="ex: sprint-planning"
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none ring-brand-500 transition focus:ring"
        />
      </div>

      {anonymousOnly ? (
        <fieldset className="space-y-2">
          <legend className="text-sm font-medium text-slate-700">Permissao de edicao</legend>
          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input type="radio" name="editMode" checked readOnly />
            Qualquer pessoa pode editar (mesmo sem login)
          </label>
        </fieldset>
      ) : (
        <fieldset className="space-y-2">
          <legend className="text-sm font-medium text-slate-700">Permissao de edicao</legend>
          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input
              type="radio"
              name="editMode"
              checked={editMode === "OWNER_ONLY"}
              onChange={() => setEditMode("OWNER_ONLY")}
            />
            Apenas o criador pode editar
          </label>
          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input
              type="radio"
              name="editMode"
              checked={editMode === "COLLABORATIVE"}
              onChange={() => setEditMode("COLLABORATIVE")}
            />
            Qualquer usuario logado pode editar
          </label>
          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input
              type="radio"
              name="editMode"
              checked={editMode === "ANONYMOUS"}
              onChange={() => setEditMode("ANONYMOUS")}
            />
            Qualquer pessoa pode editar (mesmo sem login)
          </label>
        </fieldset>
      )}

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={isLoading}
        className="rounded-md bg-brand-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-900 disabled:cursor-not-allowed disabled:bg-slate-400"
      >
        {isLoading ? "Criando..." : "Criar bloco"}
      </button>
    </form>
  );
}
