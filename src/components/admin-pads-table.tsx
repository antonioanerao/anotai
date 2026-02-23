"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

type PadRow = {
  id: string;
  slug: string;
  editMode: "OWNER_ONLY" | "COLLABORATIVE" | "ANONYMOUS";
  language: "PLAIN_TEXT" | "PYTHON" | "PHP" | "JAVASCRIPT";
  updatedAt: string;
  owner: {
    email: string;
    name: string | null;
  };
};

type AdminPadsTableProps = {
  initialPads: PadRow[];
};

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short"
  }).format(new Date(value));
}

export function AdminPadsTable({ initialPads }: AdminPadsTableProps) {
  const [pads, setPads] = useState(initialPads);
  const [selectedPad, setSelectedPad] = useState<PadRow | null>(null);
  const [error, setError] = useState<string>("");
  const [isDeleting, setIsDeleting] = useState(false);

  const hasPads = useMemo(() => pads.length > 0, [pads.length]);

  async function confirmDelete() {
    if (!selectedPad) return;

    setIsDeleting(true);
    setError("");

    const response = await fetch(`/api/admin/pads/${selectedPad.id}`, {
      method: "DELETE"
    });

    setIsDeleting(false);

    if (!response.ok) {
      const payload = (await response.json().catch(() => ({}))) as { error?: string };
      setError(payload.error ?? "Falha ao excluir bloco.");
      return;
    }

    setPads((current) => current.filter((item) => item.id !== selectedPad.id));
    setSelectedPad(null);
  }

  return (
    <>
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
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
                Acoes
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
                <td className="px-4 py-3 text-sm text-slate-700">{formatDate(pad.updatedAt)}</td>
                <td className="px-4 py-3 text-sm text-slate-700">
                  <button
                    type="button"
                    onClick={() => {
                      setError("");
                      setSelectedPad(pad);
                    }}
                    className="rounded-md border border-red-300 px-3 py-1.5 text-sm font-medium text-red-700 transition hover:bg-red-50"
                  >
                    Excluir
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {!hasPads && (
          <div className="px-4 py-8 text-center text-sm text-slate-500">Nenhum bloco criado ate o momento.</div>
        )}
      </div>

      {selectedPad && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 px-4">
          <div className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-5 shadow-lg">
            <h2 className="text-lg font-semibold text-slate-900">Confirmar exclusao</h2>
            <p className="mt-2 text-sm text-slate-700">
              Voce tem certeza que deseja excluir o bloco <span className="font-semibold">/{selectedPad.slug}</span>?
            </p>
            <p className="mt-1 text-sm text-slate-700">Essa acao nao pode ser desfeita.</p>

            {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

            <div className="mt-5 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  if (isDeleting) return;
                  setSelectedPad(null);
                  setError("");
                }}
                className="rounded-md border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={confirmDelete}
                className="rounded-md bg-red-700 px-3 py-1.5 text-sm font-semibold text-white transition hover:bg-red-800 disabled:cursor-not-allowed disabled:bg-red-400"
              >
                {isDeleting ? "Excluindo..." : "Confirmar exclusao"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
