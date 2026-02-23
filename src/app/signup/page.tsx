import Link from "next/link";
import { SignupForm } from "@/components/signup-form";
import { getPlatformSettings } from "@/lib/settings";

export default async function SignupPage() {
  const settings = await getPlatformSettings();

  if (!settings.allowPublicSignup) {
    return (
      <section className="mx-auto w-full max-w-md rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-xl font-semibold text-slate-900">Cadastro desativado</h1>
        <p className="mt-2 text-sm text-slate-600">
          O cadastro publico esta temporariamente desligado pelo administrador da plataforma.
        </p>
        <Link
          href="/login"
          className="mt-4 inline-flex rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
        >
          Ir para login
        </Link>
      </section>
    );
  }

  return (
    <section className="mx-auto w-full max-w-md space-y-4">
      <h1 className="text-2xl font-semibold text-slate-900">Criar conta</h1>
      <SignupForm />
    </section>
  );
}
