"use client";

import { useEffect, useMemo, useState } from "react";

type PadPayload = {
  content: string;
  updatedAt: string;
};

type PadEditorProps = {
  slug: string;
  initialContent: string;
  initialUpdatedAt: string;
  canEdit: boolean;
};

const POLL_MS = 2000;
const SAVE_DEBOUNCE_MS = 700;

export function PadEditor({
  slug,
  initialContent,
  initialUpdatedAt,
  canEdit
}: PadEditorProps) {
  const [content, setContent] = useState(initialContent);
  const [lastSavedContent, setLastSavedContent] = useState(initialContent);
  const [lastUpdatedAt, setLastUpdatedAt] = useState(initialUpdatedAt);
  const [status, setStatus] = useState("Sincronizado");
  const [copyFeedback, setCopyFeedback] = useState("");

  const dirty = useMemo(() => content !== lastSavedContent, [content, lastSavedContent]);

  useEffect(() => {
    const poll = setInterval(async () => {
      const response = await fetch(`/api/pads/${slug}`, { cache: "no-store" });
      if (!response.ok) return;

      const payload = (await response.json()) as PadPayload;
      if (payload.updatedAt === lastUpdatedAt) return;

      setLastUpdatedAt(payload.updatedAt);

      if (!dirty) {
        setContent(payload.content);
        setLastSavedContent(payload.content);
        setStatus("Atualizado ao vivo");
      } else {
        setStatus("Existe nova versao remota");
      }
    }, POLL_MS);

    return () => clearInterval(poll);
  }, [slug, lastUpdatedAt, dirty]);

  useEffect(() => {
    if (!canEdit) return;
    if (!dirty) return;

    const timeout = setTimeout(async () => {
      setStatus("Salvando...");

      const response = await fetch(`/api/pads/${slug}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content })
      });

      if (!response.ok) {
        setStatus("Falha ao salvar");
        return;
      }

      const payload = (await response.json()) as PadPayload;
      setLastSavedContent(payload.content);
      setLastUpdatedAt(payload.updatedAt);
      setStatus("Salvo");
    }, SAVE_DEBOUNCE_MS);

    return () => clearTimeout(timeout);
  }, [canEdit, dirty, content, slug]);

  async function copyContent() {
    await navigator.clipboard.writeText(content);
    setCopyFeedback("Copiado");
    setTimeout(() => setCopyFeedback(""), 1200);
  }

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-600">{canEdit ? status : "Modo leitura"}</p>
        <button
          type="button"
          onClick={copyContent}
          className="rounded-md border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
        >
          {copyFeedback || "Copiar conteudo"}
        </button>
      </div>

      <textarea
        value={content}
        onChange={(event) => setContent(event.target.value)}
        readOnly={!canEdit}
        className="min-h-[65vh] w-full resize-y rounded-lg border border-slate-300 bg-white px-4 py-3 font-mono text-sm leading-6 text-slate-900 outline-none ring-brand-500 focus:ring"
      />
    </section>
  );
}
