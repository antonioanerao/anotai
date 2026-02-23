import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { AdminNav } from "@/components/admin-nav";
import { AdminPadsTable } from "@/components/admin-pads-table";

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
        <p className="mt-1 text-sm text-slate-600">
          Visualize todos os blocos e exclua aqueles que forem necessarios.
        </p>
      </div>

      <AdminNav current="pads" />

      <AdminPadsTable
        initialPads={pads.map((pad) => ({
          ...pad,
          updatedAt: pad.updatedAt.toISOString()
        }))}
      />
    </section>
  );
}
