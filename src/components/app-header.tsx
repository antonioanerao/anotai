import Link from "next/link";
import { auth } from "@/auth";
import { getPlatformSettings } from "@/lib/settings";
import { MobileMenu } from "@/components/mobile-menu";
import { LogoutButton } from "@/components/logout-button";
import { ThemeToggleButton } from "@/components/theme-toggle-button";
import { AccountNavMenu } from "@/components/account-nav-menu";

const REPOSITORY_URL = "https://github.com/antonioanerao/anotai";

function GitHubRepoButton() {
  return (
    <a
      href={REPOSITORY_URL}
      target="_blank"
      rel="noreferrer noopener"
      aria-label="Repositorio do projeto no GitHub"
      title="Repositorio no GitHub"
      className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-slate-300 text-slate-700 transition hover:bg-slate-100"
    >
      <svg viewBox="0 0 16 16" aria-hidden="true" className="h-4 w-4 fill-current">
        <path d="M8 0a8 8 0 0 0-2.53 15.59c.4.07.55-.17.55-.38l-.01-1.35c-2.01.44-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.5-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.01.08-2.11 0 0 .67-.21 2.2.82a7.59 7.59 0 0 1 4 0c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.91.08 2.11.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48l-.01 2.2c0 .21.15.46.55.38A8 8 0 0 0 8 0Z" />
      </svg>
    </a>
  );
}

export async function AppHeader() {
  const [session, settings] = await Promise.all([
    auth(),
    getPlatformSettings().catch(() => ({ allowPublicSignup: true }))
  ]);

  const isLogged = Boolean(session?.user);
  const isAdmin = session?.user.role === "ADMIN";

  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-center gap-2 text-lg font-semibold text-brand-700">
          <span className="inline-block h-2.5 w-2.5 rounded-full bg-brand-500" />
          AnotAI
        </Link>

        <div className="flex items-center gap-2">
          <nav className="hidden items-center gap-2 md:flex">
            <Link
              href="/"
              className="rounded-md border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
            >
              Home
            </Link>

            {isLogged ? (
              <>
                <AccountNavMenu />
                {isAdmin && (
                  <Link
                    href="/admin"
                    className="rounded-md border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
                  >
                    Admin
                  </Link>
                )}
                <GitHubRepoButton />
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
                <GitHubRepoButton />
              </>
            )}
          </nav>

          <ThemeToggleButton />

          <MobileMenu
            isLogged={isLogged}
            isAdmin={isAdmin}
            allowPublicSignup={settings.allowPublicSignup}
          />
        </div>
      </div>
    </header>
  );
}
