import Link from "next/link";
import { auth } from "@/auth";
import { getPlatformSettings } from "@/lib/settings";
import { LogoutButton } from "@/components/logout-button";

export async function AppHeader() {
  const [session, settings] = await Promise.all([
    auth(),
    getPlatformSettings().catch(() => ({ allowPublicSignup: true }))
  ]);

  const isLogged = Boolean(session?.user);

  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-center gap-2 text-lg font-semibold text-brand-700">
          <span className="inline-block h-2.5 w-2.5 rounded-full bg-brand-500" />
          Dotpad
        </Link>

        <nav className="flex items-center gap-2">
          <Link
            href="/"
            className="rounded-md border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
          >
            Home
          </Link>

          {isLogged ? (
            <>
              {session?.user.role === "ADMIN" && (
                <Link
                  href="/admin"
                  className="rounded-md border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
                >
                  Admin
                </Link>
              )}
              <LogoutButton />
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="rounded-md border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
              >
                Login
              </Link>
              {settings.allowPublicSignup && (
                <Link
                  href="/signup"
                  className="rounded-md bg-brand-700 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-brand-900"
                >
                  Signup
                </Link>
              )}
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
