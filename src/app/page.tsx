import Link from "next/link";
import { auth } from "@/auth";
import { CreatePadForm } from "@/components/create-pad-form";
import { getPlatformSettings } from "@/lib/settings";

export default async function HomePage() {
  const [session, settings] = await Promise.all([
    auth(),
    getPlatformSettings().catch(() => ({
      allowPublicSignup: true,
      requireAuthToCreatePad: true
    }))
  ]);

  return (
    <div className="space-y-8">
      <section className="p-3 text-center">
        <h1 className="mx-auto text-2xl max-w-2xl text-slate-700">
          Um jeito simples de compartilhar código online em treinamentos
        </h1>
      </section>

      {session?.user ? (
        <section className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-lg font-semibold text-slate-700">Criar novo bloco</h2>
            <Link href="/my-pads" className="text-sm font-medium text-brand-700 hover:underline">
              Ver meus blocos
            </Link>
          </div>
          <CreatePadForm />
        </section>
      ) : !settings.requireAuthToCreatePad ? (
        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-slate-700">Criar novo bloco</h2>
          <CreatePadForm anonymousOnly />
        </section>
      ) : (
        <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-700">Acesse sua conta para criar blocos</h2>
          <p className="mt-2 text-sm text-slate-600">
            Com login, voce consegue gerenciar seus blocos e definir regras de edicao com mais controle.
          </p>
            <p className="text-sm font-medium text-amber-700">
              Blocos anonimos nao ficam vinculados a uma conta.
            </p>
          <p className="mt-1 text-sm text-slate-600">
            Voce ainda pode abrir qualquer URL existente para leitura publica.
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

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-slate-700">Modos de edicao</h2>
        <div className="grid gap-3 md:grid-cols-3">
          <article className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <h3 className="text-sm font-semibold text-slate-700">Apenas dono</h3>
            <p className="mt-1 text-sm text-slate-600">Somente quem criou o bloco pode editar. Requer uma conta</p>
          </article>
          <article className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <h3 className="text-sm font-semibold text-slate-700">Colaborativo</h3>
            <p className="mt-1 text-sm text-slate-600">Qualquer usuario logado pode editar. Requer uma conta</p>
          </article>
          <article className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <h3 className="text-sm font-semibold text-slate-700">Anonimo</h3>
            <p className="mt-1 text-sm text-slate-600">Qualquer pessoa pode editar, mesmo sem login.</p>
          </article>
        </div>
      </section>
    </div>
  );
}
