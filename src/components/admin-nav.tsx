import Link from "next/link";

type AdminNavProps = {
  current: "dashboard" | "users" | "pads";
};

function navClass(active: boolean): string {
  if (active) {
    return "rounded-md bg-brand-700 px-3 py-1.5 text-sm font-semibold text-white";
  }

  return "rounded-md border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100";
}

export function AdminNav({ current }: AdminNavProps) {
  return (
    <nav className="flex flex-wrap items-center gap-2">
      <Link href="/admin" className={navClass(current === "dashboard")}>
        Dashboard
      </Link>
      <Link href="/admin/users" className={navClass(current === "users")}>
        Usuarios
      </Link>
      <Link href="/admin/pads" className={navClass(current === "pads")}>
        Blocos
      </Link>
    </nav>
  );
}
