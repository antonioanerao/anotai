import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { AdminNav } from "@/components/admin-nav";

export default async function AdminPadsPage() {
  const session = await auth();

  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/");
  }

  const pads = await prisma.pad.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      slug: true,
      editMode: true,
      language: true,
      createdAt: true,
      updatedAt: true,
      owner: {
        select: {
          email: true,
          name: true
        }
      }
    }
  });

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Blocos criados</h1>
        <p className="mt-1 text-sm text-slate-600">Visualizacao somente leitura dos blocos da plataforma.</p>
      </div>

      <AdminNav current="pads" />

      <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
                Slug
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
                Dono
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
                Edicao
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
                Linguagem
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
                  <Link
                    href={`/pads/${pad.slug}`}
                    className="hover:underline"
                    target="_blank"
                    rel="noreferrer"
                  >
                    /{pad.slug}
                  </Link>
                </td>
                <td className="px-4 py-3 text-sm text-slate-700">{pad.owner.name || pad.owner.email}</td>
                <td className="px-4 py-3 text-sm text-slate-700">{pad.editMode}</td>
                <td className="px-4 py-3 text-sm text-slate-700">{pad.language}</td>
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
          <div className="px-4 py-8 text-center text-sm text-slate-500">Nenhum bloco criado ate o momento.</div>
        )}
      </div>
    </section>
  );
}
