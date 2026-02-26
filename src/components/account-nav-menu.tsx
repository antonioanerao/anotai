"use client";

import Link from "next/link";
import { useRef } from "react";

type AccountNavMenuProps = {
  mobile?: boolean;
  onNavigate?: () => void;
};

export function AccountNavMenu({ mobile = false, onNavigate }: AccountNavMenuProps) {
  const detailsRef = useRef<HTMLDetailsElement | null>(null);

  function handleNavigate() {
    if (detailsRef.current) {
      detailsRef.current.open = false;
    }
    onNavigate?.();
  }

  if (mobile) {
    return (
      <details className="rounded-md">
        <summary className="cursor-pointer rounded-md px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 dark:text-slate-100 dark:hover:bg-slate-700">
          Minha conta
        </summary>
        <div className="mt-1 space-y-1 border-l border-slate-200 pl-3 dark:border-slate-700">
          <Link
            href="/account"
            onClick={handleNavigate}
            className="block rounded-md px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 dark:text-slate-100 dark:hover:bg-slate-700"
          >
            Trocar senha
          </Link>
          <Link
            href="/my-pads"
            onClick={handleNavigate}
            className="block rounded-md px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 dark:text-slate-100 dark:hover:bg-slate-700"
          >
            Meus blocos
          </Link>
        </div>
      </details>
    );
  }

  return (
    <details ref={detailsRef} className="group relative">
      <summary className="list-none cursor-pointer rounded-md border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100 [&::-webkit-details-marker]:hidden">
        Minha conta
      </summary>
      <div className="absolute right-0 z-50 mt-2 w-44 rounded-lg border border-slate-200 bg-white p-1 shadow-lg">
        <Link
          href="/account"
          onClick={handleNavigate}
          className="block rounded-md px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
        >
          Trocar senha
        </Link>
        <Link
          href="/my-pads"
          onClick={handleNavigate}
          className="block rounded-md px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
        >
          Meus blocos
        </Link>
      </div>
    </details>
  );
}
