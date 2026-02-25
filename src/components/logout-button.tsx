"use client";

import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";

type LogoutButtonProps = {
  variant?: "default" | "menu";
  onAction?: () => void;
};

function getButtonClassName(variant: "default" | "menu"): string {
  if (variant === "menu") {
    return "w-full rounded-md px-3 py-2 text-left text-sm font-medium text-slate-700 transition hover:bg-slate-100";
  }

  return "rounded-md bg-slate-900 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-slate-700";
}

export function LogoutButton({ variant = "default", onAction }: LogoutButtonProps) {
  const router = useRouter();

  async function handleLogout() {
    onAction?.();
    await signOut({ redirect: false });
    router.replace("/");
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      className={getButtonClassName(variant)}
    >
      Logout
    </button>
  );
}
