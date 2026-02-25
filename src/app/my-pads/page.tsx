import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

const editModeLabels = {
  OWNER_ONLY: "Apenas dono",
  COLLABORATIVE: "Colaborativo",
  ANONYMOUS: "Anonimo"
} as const;

const languageLabels = {
  PLAIN_TEXT: "Texto puro",
  PYTHON: "Python",
  PHP: "PHP",
  JAVASCRIPT: "JavaScript"
} as const;

export default async function MyPadsPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login?callbackUrl=%2Fmy-pads");
  }

  const pads = await prisma.pad.findMany({
    where: { ownerId: session.user.id },
    orderBy: { updatedAt: "desc" },
    select: {
      id: true,
      slug: true,
      editMode: true,
      language: true,
      createdAt: true,
      updatedAt: true
    }
  });

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Meus blocos</h1>
        <p className="mt-1 text-sm text-slate-600">
          Lista dos blocos criados por voce, com acesso rapido para abrir e continuar editando.
        </p>
      </div>

      <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
                Bloco
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
                Edicao
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
                Linguagem
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
                Criado em
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
                Atualizado em
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {pads.map((pad) => (
              <tr key={pad.id}>
                <td className="px-4 py-3 text-sm text-brand-700">
                  <Link href={`/pads/${pad.slug}`} className="hover:underline">
                    /{pad.slug}
                  </Link>
                </td>
                <td className="px-4 py-3 text-sm text-slate-700">{editModeLabels[pad.editMode]}</td>
                <td className="px-4 py-3 text-sm text-slate-700">{languageLabels[pad.language]}</td>
                <td className="px-4 py-3 text-sm text-slate-700">
                  {new Intl.DateTimeFormat("pt-BR", {
                    dateStyle: "short",
                    timeStyle: "short"
                  }).format(pad.createdAt)}
                </td>
                <td className="px-4 py-3 text-sm text-slate-700">
                  {new Intl.DateTimeFormat("pt-BR", {
                    dateStyle: "short",
                    timeStyle: "short"
                  }).format(pad.updatedAt)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {pads.length === 0 && (
          <div className="px-4 py-8 text-center text-sm text-slate-500">
            Voce ainda nao criou nenhum bloco.
            <div className="mt-3">
              <Link href="/" className="text-brand-700 hover:underline">
                Criar meu primeiro bloco
              </Link>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
