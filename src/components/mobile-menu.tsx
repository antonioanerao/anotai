"use client";

import Link from "next/link";
import { useState } from "react";
import { LogoutButton } from "@/components/logout-button";

type MobileMenuProps = {
  isLogged: boolean;
  isAdmin: boolean;
  allowPublicSignup: boolean;
};

export function MobileMenu({ isLogged, isAdmin, allowPublicSignup }: MobileMenuProps) {
  const [isOpen, setIsOpen] = useState(false);

  function closeMenu() {
    setIsOpen(false);
  }

  return (
    <div className="relative md:hidden">
      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        className="flex items-center gap-2 rounded-md border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
        aria-expanded={isOpen}
        aria-haspopup="menu"
      >
        <span aria-hidden="true" className="flex flex-col gap-1">
          <span className="block h-0.5 w-4 bg-slate-700" />
          <span className="block h-0.5 w-4 bg-slate-700" />
          <span className="block h-0.5 w-4 bg-slate-700" />
        </span>
        Menu
      </button>

      {isOpen && (
        <div className="absolute right-0 z-50 mt-2 w-52 rounded-lg border border-slate-200 bg-white p-2 shadow-lg">
          <nav className="flex flex-col gap-1">
            <Link
              href="/"
              onClick={closeMenu}
              className="rounded-md px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
            >
              Home
            </Link>

            {isLogged ? (
              <>
                <Link
                  href="/my-pads"
                  onClick={closeMenu}
                  className="rounded-md px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
                >
                  Meus blocos
                </Link>
                <Link
                  href="/account"
                  onClick={closeMenu}
                  className="rounded-md px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
                >
                  Conta
                </Link>
                {isAdmin && (
                  <Link
                    href="/admin"
                    onClick={closeMenu}
                    className="rounded-md px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
                  >
                    Admin
                  </Link>
                )}
                <LogoutButton variant="menu" onAction={closeMenu} />
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  onClick={closeMenu}
                  className="rounded-md px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
                >
                  Login
                </Link>
                {allowPublicSignup && (
                  <Link
                    href="/signup"
                    onClick={closeMenu}
                    className="rounded-md bg-brand-700 px-3 py-2 text-sm font-medium text-white transition hover:bg-brand-900"
                  >
                    Signup
                  </Link>
                )}
              </>
            )}
          </nav>
        </div>
      )}
    </div>
  );
}
