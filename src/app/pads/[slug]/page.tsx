import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { canEditPad } from "@/lib/authz";
import { PadEditorClient } from "@/components/pad-editor-client";
import { PadViewCounter } from "@/components/pad-view-counter";
import { getPlatformSettingsWithFallback } from "@/lib/settings";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;

  const [pad, settings] = await Promise.all([
    prisma.pad.findUnique({
      where: { slug },
      select: {
        slug: true
      }
    }),
    getPlatformSettingsWithFallback()
  ]);

  if (!pad) {
    return {
      title: "Bloco nao encontrado"
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

export default async function PadPage({ params }: Props) {
  const { slug } = await params;

  const [session, pad] = await Promise.all([
    auth(),
    prisma.pad.findUnique({ where: { slug } })
  ]);

  if (!pad) {
    notFound();
  }

  const editable = canEditPad({
    userId: session?.user?.id,
    ownerId: pad.ownerId,
    editMode: pad.editMode
  });
  const isOwner = session?.user?.id === pad.ownerId;
  const canChangeLanguage = pad.ownerId === null || isOwner;

  return (
    <div className="space-y-4">
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
      </section>

      <PadEditorClient
        slug={pad.slug}
        initialContent={pad.content}
        initialLanguage={pad.language}
        initialUpdatedAt={pad.updatedAt.toISOString()}
        canEdit={editable}
        isOwner={isOwner}
        canChangeLanguage={canChangeLanguage}
      />
    </div>
  );
}
