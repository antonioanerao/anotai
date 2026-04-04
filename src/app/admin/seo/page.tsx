import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getPlatformSettings } from "@/lib/settings";
import { AdminNav } from "@/components/admin-nav";
import { AdminSeoSettingsForm } from "@/components/admin-seo-settings-form";

export default async function AdminSeoPage() {
  const [session, settings] = await Promise.all([auth(), getPlatformSettings()]);

  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/");
  }

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">SEO</h1>
        <p className="mt-1 text-sm text-slate-600">
          Configure o titulo da home, descricao, canonical, indexacao e a imagem usada no compartilhamento.
        </p>
      </div>

      <AdminNav current="seo" />

      <div className="max-w-3xl space-y-3">
        <h2 className="text-lg font-semibold text-slate-900">Configuracoes de SEO</h2>
        <AdminSeoSettingsForm
          initialSiteTitle={settings.siteTitle}
          initialHomeTitle={settings.homeTitle}
          initialMetaDescription={settings.metaDescription}
          initialCanonicalUrl={settings.canonicalUrl}
          initialOgImagePath={settings.ogImagePath}
          initialIndexHome={settings.indexHome}
        />
      </div>
    </section>
  );
}
