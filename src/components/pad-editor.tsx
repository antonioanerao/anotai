"use client";

import { useEffect, useMemo, useState } from "react";
import Editor from "react-simple-code-editor";
import Prism from "prismjs";
import "prismjs/components/prism-clike";
import "prismjs/components/prism-javascript";
import "prismjs/components/prism-markup";
import "prismjs/components/prism-markup-templating";
import "prismjs/components/prism-php";
import "prismjs/components/prism-python";

type CodeLanguage = "PLAIN_TEXT" | "PYTHON" | "PHP" | "JAVASCRIPT";

type PadPayload = {
  content: string;
  language: CodeLanguage;
  updatedAt: string;
};

type PadEditorProps = {
  slug: string;
  initialContent: string;
  initialLanguage: CodeLanguage;
  initialUpdatedAt: string;
  canEdit: boolean;
  isOwner: boolean;
};

const POLL_MS = 2000;
const SAVE_DEBOUNCE_MS = 700;

const languageOptions: Array<{ value: CodeLanguage; label: string }> = [
  { value: "PLAIN_TEXT", label: "Texto puro" },
  { value: "PYTHON", label: "Python" },
  { value: "PHP", label: "PHP" },
  { value: "JAVASCRIPT", label: "JavaScript" }
];

const prismLanguageMap: Record<Exclude<CodeLanguage, "PLAIN_TEXT">, string> = {
  PYTHON: "python",
  PHP: "php",
  JAVASCRIPT: "javascript"
};

function escapeHtml(code: string) {
  return code
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function highlightCode(code: string, language: CodeLanguage) {
  if (language === "PLAIN_TEXT") {
    return escapeHtml(code);
  }

  const prismLanguage = prismLanguageMap[language];
  const grammar = Prism.languages[prismLanguage] ?? Prism.languages.javascript;
  return Prism.highlight(code, grammar, prismLanguage);
}

function languageLabel(language: CodeLanguage) {
  return languageOptions.find((option) => option.value === language)?.label ?? "Texto puro";
}

export function PadEditor({
  slug,
  initialContent,
  initialLanguage,
  initialUpdatedAt,
  canEdit,
  isOwner
}: PadEditorProps) {
  const [content, setContent] = useState(initialContent);
  const [language, setLanguage] = useState<CodeLanguage>(initialLanguage);
  const [lastSavedContent, setLastSavedContent] = useState(initialContent);
  const [lastUpdatedAt, setLastUpdatedAt] = useState(initialUpdatedAt);
  const [status, setStatus] = useState("Sincronizado");
  const [copyFeedback, setCopyFeedback] = useState("");
  const [isSavingLanguage, setIsSavingLanguage] = useState(false);

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

      if (!isSavingLanguage) {
        setLanguage(payload.language);
      }
    }, POLL_MS);

    return () => clearInterval(poll);
  }, [slug, lastUpdatedAt, dirty, isSavingLanguage]);

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
      setLanguage(payload.language);
      setStatus("Salvo");
    }, SAVE_DEBOUNCE_MS);

    return () => clearTimeout(timeout);
  }, [canEdit, dirty, content, slug]);

  async function updateLanguage(nextLanguage: CodeLanguage) {
    if (!isOwner || nextLanguage === language) return;

    const previousLanguage = language;
    setLanguage(nextLanguage);
    setIsSavingLanguage(true);
    setStatus("Salvando linguagem...");

    const response = await fetch(`/api/pads/${slug}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ language: nextLanguage })
    });

    setIsSavingLanguage(false);

    if (!response.ok) {
      setLanguage(previousLanguage);
      setStatus("Falha ao salvar linguagem");
      return;
    }

    const payload = (await response.json()) as PadPayload;
    setLanguage(payload.language);
    setLastUpdatedAt(payload.updatedAt);
    setStatus("Linguagem atualizada");
  }

  async function copyContent() {
    await navigator.clipboard.writeText(content);
    setCopyFeedback("Copiado");
    setTimeout(() => setCopyFeedback(""), 1200);
  }

  return (
    <section className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-slate-600">{canEdit ? status : "Modo leitura"}</p>

        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-slate-700">Linguagem:</label>
          {isOwner ? (
            <select
              value={language}
              onChange={(event) => updateLanguage(event.target.value as CodeLanguage)}
              className="rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-sm text-slate-700 outline-none ring-brand-500 transition focus:ring"
            >
              {languageOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          ) : (
            <span className="rounded-md border border-slate-300 bg-slate-100 px-2.5 py-1.5 text-sm text-slate-700">
              {languageLabel(language)}
            </span>
          )}

          <button
            type="button"
            onClick={copyContent}
            className="rounded-md border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
          >
            {copyFeedback || "Copiar conteudo"}
          </button>
        </div>
      </div>

      <Editor
        value={content}
        onValueChange={(code) => setContent(code)}
        highlight={(code) => highlightCode(code, language)}
        padding={16}
        readOnly={!canEdit}
        className="pad-code-editor min-h-[65vh] w-full overflow-auto rounded-lg border border-slate-300 bg-white"
        textareaClassName="font-mono text-sm leading-6 text-slate-900 outline-none"
        preClassName="font-mono text-sm leading-6"
        style={{
          fontFamily:
            "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, Liberation Mono, Courier New, monospace"
        }}
      />
    </section>
  );
}
