"use client";

import { useEffect, useState } from "react";

type Props = {
  initialSiteTitle: string;
  initialHomeTitle: string;
  initialMetaDescription: string;
  initialCanonicalUrl: string;
  initialOgImagePath: string;
  initialIndexHome: boolean;
};

export function AdminSeoSettingsForm({
  initialSiteTitle,
  initialHomeTitle,
  initialMetaDescription,
  initialCanonicalUrl,
  initialOgImagePath,
  initialIndexHome
}: Props) {
  const [siteTitle, setSiteTitle] = useState(initialSiteTitle);
  const [homeTitle, setHomeTitle] = useState(initialHomeTitle);
  const [metaDescription, setMetaDescription] = useState(initialMetaDescription);
  const [canonicalUrl, setCanonicalUrl] = useState(initialCanonicalUrl);
  const [ogImagePath, setOgImagePath] = useState(initialOgImagePath);
  const [indexHome, setIndexHome] = useState(initialIndexHome);
  const [ogImageFile, setOgImageFile] = useState<File | null>(null);
  const [ogImagePreviewUrl, setOgImagePreviewUrl] = useState(initialOgImagePath);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!ogImageFile) {
      setOgImagePreviewUrl(ogImagePath);
      return;
    }

    const objectUrl = URL.createObjectURL(ogImageFile);
    setOgImagePreviewUrl(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  }, [ogImageFile, ogImagePath]);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    setMessage("");

    let nextOgImagePath = ogImagePath;

    if (ogImageFile) {
      const uploadData = new FormData();
      uploadData.append("file", ogImageFile);

      const uploadResponse = await fetch("/api/admin/settings/og-image", {
        method: "POST",
        body: uploadData
      });

      const uploadPayload = (await uploadResponse.json().catch(() => ({}))) as { error?: string; path?: string };

      if (!uploadResponse.ok || !uploadPayload.path) {
        setIsLoading(false);
        setMessage(uploadPayload.error ?? "Falha ao enviar imagem OG.");
        return;
      }

      nextOgImagePath = uploadPayload.path;
      setOgImagePath(uploadPayload.path);
      setOgImageFile(null);
    }

    const response = await fetch("/api/admin/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        siteTitle,
        homeTitle,
        metaDescription,
        canonicalUrl,
        ogImagePath: nextOgImagePath,
        indexHome
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
      <div className="space-y-1">
        <label htmlFor="siteTitle" className="block text-sm font-medium text-slate-700">
          Site title
        </label>
        <input
          id="siteTitle"
          value={siteTitle}
          onChange={(event) => setSiteTitle(event.target.value)}
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none ring-brand-500 transition focus:ring"
        />
      </div>

      <div className="space-y-1">
        <label htmlFor="homeTitle" className="block text-sm font-medium text-slate-700">
          Home title
        </label>
        <input
          id="homeTitle"
          value={homeTitle}
          onChange={(event) => setHomeTitle(event.target.value)}
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none ring-brand-500 transition focus:ring"
        />
      </div>

      <div className="space-y-1">
        <label htmlFor="metaDescription" className="block text-sm font-medium text-slate-700">
          Meta description
        </label>
        <textarea
          id="metaDescription"
          value={metaDescription}
          onChange={(event) => setMetaDescription(event.target.value)}
          rows={4}
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none ring-brand-500 transition focus:ring"
        />
      </div>

      <div className="space-y-1">
        <label htmlFor="canonicalUrl" className="block text-sm font-medium text-slate-700">
          Canonical URL
        </label>
        <input
          id="canonicalUrl"
          value={canonicalUrl}
          onChange={(event) => setCanonicalUrl(event.target.value)}
          placeholder="https://anotai.exemplo.com"
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none ring-brand-500 transition focus:ring"
        />
        <p className="text-xs text-slate-500">Se ficar vazio, o sistema usa o valor de `NEXTAUTH_URL`.</p>
      </div>

      <div className="space-y-2">
        <label htmlFor="ogImage" className="block text-sm font-medium text-slate-700">
          OG image
        </label>
        <input
          id="ogImage"
          type="file"
          accept="image/png,image/jpeg,image/webp"
          onChange={(event) => setOgImageFile(event.target.files?.[0] ?? null)}
          className="block w-full text-sm text-slate-700"
        />
        {ogImagePreviewUrl && (
          <div className="overflow-hidden rounded-lg border border-slate-200 bg-slate-50 p-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={ogImagePreviewUrl} alt="Preview da imagem OG" className="max-h-40 w-auto rounded-md" />
          </div>
        )}
        <p className="text-xs text-slate-500">Formatos aceitos: PNG, JPG e WEBP. Tamanho maximo: 5 MB.</p>
      </div>

      <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
        <input type="checkbox" checked={indexHome} onChange={(event) => setIndexHome(event.target.checked)} />
        Permitir indexacao da pagina inicial
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
