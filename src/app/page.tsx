import Link from "next/link";
import { auth } from "@/auth";
import { CreatePadForm } from "@/components/create-pad-form";
import { getPlatformSettings } from "@/lib/settings";

export default async function HomePage() {
  const [session, settings] = await Promise.all([
    auth(),
    getPlatformSettings().catch(() => ({ allowPublicSignup: true }))
  ]);

  return (
    <div className="space-y-8">
      <section className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Dotpad</h1>
        <p className="max-w-2xl text-slate-600">
          Compartilhe texto por URL. Quem estiver deslogado pode apenas acompanhar e copiar. Quem estiver
          logado pode editar conforme as permissoes do bloco.
        </p>
      </section>

      {session?.user ? (
        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-slate-900">Criar novo bloco</h2>
          <CreatePadForm />
        </section>
      ) : (
        <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Acesse sua conta para criar blocos</h2>
          <p className="mt-2 text-sm text-slate-600">
            Você ainda pode abrir qualquer URL de bloco existente para leitura publica.
          </p>
          <div className="mt-4 flex gap-2">
            <Link
              href="/login"
              className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
            >
              Login
            </Link>
            {settings.allowPublicSignup && (
              <Link
                href="/signup"
                className="rounded-md bg-brand-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-900"
              >
                Signup
              </Link>
            )}
          </div>
        </section>
      )}
    </div>
  );
}
