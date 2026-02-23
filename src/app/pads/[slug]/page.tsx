import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { canEditPad } from "@/lib/authz";
import { PadEditor } from "@/components/pad-editor";

type Props = {
  params: Promise<{ slug: string }>;
};

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

  return (
    <div className="space-y-4">
      <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <h1 className="text-xl font-semibold text-slate-900">/{pad.slug}</h1>
        <p className="mt-1 text-sm text-slate-600">
          {editable
            ? "Voce pode editar este bloco."
            : "Modo leitura. Para editar, entre com uma conta autorizada."}
        </p>
      </section>

      <PadEditor
        slug={pad.slug}
        initialContent={pad.content}
        initialUpdatedAt={pad.updatedAt.toISOString()}
        canEdit={editable}
      />
    </div>
  );
}
