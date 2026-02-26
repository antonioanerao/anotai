import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getPlatformSettings } from "@/lib/settings";
import { AdminSettingsForm } from "@/components/admin-settings-form";
import { AdminCreateUserForm } from "@/components/admin-create-user-form";
import { AdminNav } from "@/components/admin-nav";

export default async function AdminPage() {
  const [session, settings] = await Promise.all([auth(), getPlatformSettings()]);

  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/");
  }

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Painel admin</h1>
        <p className="mt-1 text-sm text-slate-600">
          Gerencie cadastro publico e navegue pelas paginas de visualizacao de usuarios e blocos.
        </p>
      </div>

      <AdminNav current="dashboard" />

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-slate-900">Cadastro publico</h2>
          <AdminSettingsForm
            initialAllowPublicSignup={settings.allowPublicSignup}
            initialAllowedSignupDomains={settings.allowedSignupDomains}
          />
        </div>

        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-slate-900">Criar conta</h2>
          <AdminCreateUserForm />
        </div>
      </div>
    </section>
  );
}
