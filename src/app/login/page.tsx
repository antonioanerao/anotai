import { LoginForm } from "@/components/login-form";

export default function LoginPage() {
  return (
    <section className="mx-auto w-full max-w-md space-y-4">
      <h1 className="text-2xl font-semibold text-slate-900">Login</h1>
      <LoginForm />
    </section>
  );
}
