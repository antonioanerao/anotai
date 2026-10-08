import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { canEditPad, canReadPad } from "@/lib/authz";
import { PadEditorClient } from "@/components/pad-editor-client";
import { PadViewCounter } from "@/components/pad-view-counter";
import { PadPrivacyToggle } from "@/components/pad-privacy-toggle";
import { getPlatformSettingsWithFallback } from "@/lib/settings";

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ view?: string | string[] }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;

  const [pad, settings] = await Promise.all([
    prisma.pad.findUnique({
      where: { slug },
      select: {
        slug: true,
        isPrivate: true
      }
    }),
    getPlatformSettingsWithFallback()
  ]);

  if (!pad || pad.isPrivate) {
    return {
      title: "Bloco privado",
      robots: { index: false, follow: false }
    };
  }

  const title = `/${pad.slug}`;
  const description = `Acesse o bloco /${pad.slug} no ${settings.siteTitle}.`;
  const padUrl = settings.canonicalUrl ? `${settings.canonicalUrl.replace(/\/$/, "")}/pads/${pad.slug}` : `/pads/${pad.slug}`;

  return {
    title,
    description,
    alternates: {
      canonical: padUrl
    },
    openGraph: {
      title,
      description,
      url: padUrl,
      images: settings.ogImagePath ? [settings.ogImagePath] : undefined
    },
    twitter: {
      card: settings.ogImagePath ? "summary_large_image" : "summary",
      title,
      description,
      images: settings.ogImagePath ? [settings.ogImagePath] : undefined
    }
  };
}

export default async function PadPage({ params, searchParams }: Props) {
  const { slug } = await params;

  const [session, pad, query] = await Promise.all([
    auth(),
    prisma.pad.findUnique({ where: { slug } }),
    searchParams
  ]);

  if (!pad) {
    notFound();
  }

  if (pad.isPrivate && !session?.user?.id) {
    redirect(`/login?callbackUrl=${encodeURIComponent(`/pads/${slug}`)}`);
  }

  if (!canReadPad({ userId: session?.user?.id, ownerId: pad.ownerId, isPrivate: pad.isPrivate })) {
    notFound();
  }

  const editable = canEditPad({
    userId: session?.user?.id,
    ownerId: pad.ownerId,
    editMode: pad.editMode,
    isPrivate: pad.isPrivate
  });
  const isOwner = session?.user?.id === pad.ownerId;
  const canChangeLanguage = pad.ownerId === null || isOwner;

  return (
    <div className="pad-page-wide space-y-4">
      <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-wrap items-baseline gap-2">
          <h1 className="text-xl font-semibold text-slate-900">/{pad.slug}</h1>
          <PadViewCounter slug={pad.slug} initialViewCount={pad.viewCount} />
        </div>
        <p className="mt-1 text-sm text-slate-600">
          {editable
            ? "Voce pode editar este bloco."
            : "Modo leitura. Para editar, entre com uma conta autorizada."}
        </p>
        {isOwner && (
          <PadPrivacyToggle slug={pad.slug} initialIsPrivate={pad.isPrivate} />
        )}
      </section>

      <PadEditorClient
        slug={pad.slug}
        initialContent={pad.content}
        initialLanguage={pad.language}
        initialMarkdownOnly={pad.language === "MARKDOWN" && query.view === "markdown"}
        initialUpdatedAt={pad.updatedAt.toISOString()}
        canEdit={editable}
        isOwner={isOwner}
        canChangeLanguage={canChangeLanguage}
      />
    </div>
  );
}
