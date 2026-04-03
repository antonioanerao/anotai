"use client";

import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { useRouter } from "next/navigation";
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

export type PadEditorProps = {
  slug: string;
  initialContent: string;
  initialLanguage: CodeLanguage;
  initialUpdatedAt: string;
  canEdit: boolean;
  isOwner: boolean;
  canChangeLanguage: boolean;
};

const POLL_MS = 2000;
const SAVE_DEBOUNCE_MS = 700;
const HIGHLIGHT_MAX_CONTENT_LENGTH = 100_000;
const HIGHLIGHT_MAX_LINE_LENGTH = 1_200;
const HIGHLIGHT_MIN_CONTENT_LENGTH_TO_DEGRADE = 3_000;

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
  isOwner,
  canChangeLanguage
}: PadEditorProps) {
  const router = useRouter();
  const [content, setContent] = useState(initialContent);
  const [language, setLanguage] = useState<CodeLanguage>(initialLanguage);
  const [lastSavedContent, setLastSavedContent] = useState(initialContent);
  const [lastUpdatedAt, setLastUpdatedAt] = useState(initialUpdatedAt);
  const [status, setStatus] = useState("Sincronizado");
  const [copyFeedback, setCopyFeedback] = useState("");
  const [isSavingLanguage, setIsSavingLanguage] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  const [editorScrollTop, setEditorScrollTop] = useState(0);
  const editorWrapperRef = useRef<HTMLDivElement | null>(null);

  const dirty = useMemo(() => content !== lastSavedContent, [content, lastSavedContent]);
  const totalLines = useMemo(() => Math.max(content.split("\n").length, 1), [content]);
  const longestLineLength = useMemo(() => {
    let maxLength = 0;
    for (const line of content.split("\n")) {
      if (line.length > maxLength) maxLength = line.length;
    }
    return maxLength;
  }, [content]);
  const shouldUsePlainTextHighlight = useMemo(() => {
    return (
      content.length > HIGHLIGHT_MAX_CONTENT_LENGTH ||
      (content.length > HIGHLIGHT_MIN_CONTENT_LENGTH_TO_DEGRADE && longestLineLength > HIGHLIGHT_MAX_LINE_LENGTH)
    );
  }, [content.length, longestLineLength]);
  const lineNumberDigits = useMemo(() => String(totalLines).length, [totalLines]);
  const gutterWidth = useMemo(() => `calc(${lineNumberDigits + 2}ch + 8px)`, [lineNumberDigits]);
  const editorContentWidth = useMemo(() => `calc(${Math.max(longestLineLength + 4, 32)}ch)`, [longestLineLength]);
  const editorStyle = useMemo(
    () =>
      ({
        "--pad-editor-content-width": editorContentWidth,
        fontFamily:
          "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, Liberation Mono, Courier New, monospace"
      }) as CSSProperties,
    [editorContentWidth]
  );
  const lineNumbers = useMemo(() => {
    return Array.from({ length: totalLines }, (_, index) => index + 1).join("\n");
  }, [totalLines]);

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

  useEffect(() => {
    const wrapper = editorWrapperRef.current;
    if (!wrapper) return;

    const textarea = wrapper.querySelector("textarea");
    const scrollContainer = wrapper.querySelector<HTMLDivElement>(".pad-code-editor");
    if (!textarea || !scrollContainer) return;

    const syncWidth = () => {
      const pre = scrollContainer.querySelector("pre");
      if (!pre) return;

      const targetWidth = Math.max(pre.scrollWidth, scrollContainer.clientWidth);
      pre.style.width = `${targetWidth}px`;
      textarea.style.width = `${targetWidth}px`;
    };

    const syncFromTextarea = () => {
      setEditorScrollTop(textarea.scrollTop);

      if (scrollContainer.scrollLeft !== textarea.scrollLeft) {
        scrollContainer.scrollLeft = textarea.scrollLeft;
      }
      if (scrollContainer.scrollTop !== textarea.scrollTop) {
        scrollContainer.scrollTop = textarea.scrollTop;
      }
    };

    const syncFromContainer = () => {
      if (textarea.scrollLeft !== scrollContainer.scrollLeft) {
        textarea.scrollLeft = scrollContainer.scrollLeft;
      }
      if (textarea.scrollTop !== scrollContainer.scrollTop) {
        textarea.scrollTop = scrollContainer.scrollTop;
        setEditorScrollTop(scrollContainer.scrollTop);
      }
    };

    const handleInteraction = () => {
      syncWidth();
      syncFromTextarea();
    };

    syncWidth();
    syncFromTextarea();

    window.addEventListener("resize", syncWidth);
    scrollContainer.addEventListener("scroll", syncFromContainer, { passive: true });
    textarea.addEventListener("scroll", syncFromTextarea, { passive: true });
    textarea.addEventListener("keyup", handleInteraction);
    textarea.addEventListener("input", handleInteraction);

    return () => {
      window.removeEventListener("resize", syncWidth);
      scrollContainer.removeEventListener("scroll", syncFromContainer);
      textarea.removeEventListener("scroll", syncFromTextarea);
      textarea.removeEventListener("keyup", handleInteraction);
      textarea.removeEventListener("input", handleInteraction);
    };
  }, [content, language, shouldUsePlainTextHighlight]);

  async function updateLanguage(nextLanguage: CodeLanguage) {
    if (!canChangeLanguage || nextLanguage === language) return;

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

  async function deletePad() {
    setIsDeleting(true);
    setDeleteError("");

    const response = await fetch(`/api/pads/${slug}`, {
      method: "DELETE"
    });

    setIsDeleting(false);

    if (!response.ok) {
      const payload = (await response.json().catch(() => ({}))) as { error?: string };
      setDeleteError(payload.error ?? "Falha ao excluir bloco.");
      return;
    }

    setIsDeleteModalOpen(false);
    router.replace("/");
    router.refresh();
  }

  return (
    <section className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-slate-600">{canEdit ? status : "Modo leitura"}</p>

        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-slate-700">Linguagem:</label>
          {canChangeLanguage ? (
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

          {isOwner && (
            <button
              type="button"
              onClick={() => {
                setDeleteError("");
                setIsDeleteModalOpen(true);
              }}
              className="rounded-md border border-red-300 px-3 py-1.5 text-sm font-medium text-red-700 transition hover:bg-red-50"
            >
              Excluir bloco
            </button>
          )}
        </div>
      </div>

      <div className="min-h-[65vh] w-full overflow-hidden rounded-lg border border-slate-300 bg-white">
        <div className="flex min-h-[65vh] w-full">
          <div
            aria-hidden="true"
            className="shrink-0 overflow-hidden border-r border-slate-300 bg-slate-200 text-slate-600 select-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400"
            style={{ width: gutterWidth }}
          >
            <pre
              className="pointer-events-none select-none font-mono text-sm leading-6 text-right"
              style={{
                transform: `translateY(-${editorScrollTop}px)`,
                paddingTop: "16px",
                paddingBottom: "16px",
                paddingRight: "8px"
              }}
            >
              {lineNumbers}
            </pre>
          </div>

          <div ref={editorWrapperRef} className="min-w-0 flex-1">
            <Editor
              value={content}
              onValueChange={(code) => setContent(code)}
              highlight={(code) => highlightCode(code, shouldUsePlainTextHighlight ? "PLAIN_TEXT" : language)}
              padding={16}
              readOnly={!canEdit}
              className="pad-code-editor min-h-[65vh] w-full overflow-auto bg-transparent"
              textareaClassName="font-mono text-sm leading-6 text-slate-900 outline-none"
              preClassName="font-mono text-sm leading-6"
              style={editorStyle}
            />
          </div>
        </div>
      </div>

      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 px-4">
          <div className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-5 shadow-lg">
            <h2 className="text-lg font-semibold text-slate-900">Confirmar exclusao</h2>
            <p className="mt-2 text-sm text-slate-700">
              Voce tem certeza que deseja excluir o bloco <span className="font-semibold">/{slug}</span>?
            </p>
            <p className="mt-1 text-sm text-slate-700">Essa acao nao pode ser desfeita.</p>

            {deleteError && <p className="mt-3 text-sm text-red-600">{deleteError}</p>}

            <div className="mt-5 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  if (isDeleting) return;
                  setDeleteError("");
                  setIsDeleteModalOpen(false);
                }}
                className="rounded-md border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={deletePad}
                className="rounded-md bg-red-700 px-3 py-1.5 text-sm font-semibold text-white transition hover:bg-red-800 disabled:cursor-not-allowed disabled:bg-red-400"
              >
                {isDeleting ? "Excluindo..." : "Confirmar exclusao"}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
