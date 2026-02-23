import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { ChangePasswordForm } from "@/components/change-password-form";

export default async function AccountPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login?callbackUrl=%2Faccount");
  }

  return (
    <section className="mx-auto w-full max-w-xl space-y-4">
      <h1 className="text-2xl font-semibold text-slate-900">Minha conta</h1>
      <p className="text-sm text-slate-600">Altere sua senha de acesso.</p>
      <ChangePasswordForm />
    </section>
  );
}
