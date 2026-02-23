"use client";

import { useState } from "react";

export function AdminCreateUserForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    setMessage("");

    const response = await fetch("/api/admin/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password })
    });

    setIsLoading(false);

    const payload = (await response.json().catch(() => ({}))) as { error?: string };

    if (!response.ok) {
      setMessage(payload.error ?? "Falha ao criar usuario.");
      return;
    }

    setMessage("Usuario criado.");
    setName("");
    setEmail("");
    setPassword("");
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div>
        <label htmlFor="admin-create-name" className="mb-1 block text-sm font-medium text-slate-700">
          Nome
        </label>
        <input
          id="admin-create-name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none ring-brand-500 transition focus:ring"
        />
      </div>

      <div>
        <label htmlFor="admin-create-email" className="mb-1 block text-sm font-medium text-slate-700">
          Email
        </label>
        <input
          id="admin-create-email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          type="email"
          required
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none ring-brand-500 transition focus:ring"
        />
      </div>

      <div>
        <label htmlFor="admin-create-password" className="mb-1 block text-sm font-medium text-slate-700">
          Senha
        </label>
        <input
          id="admin-create-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          type="password"
          minLength={8}
          required
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none ring-brand-500 transition focus:ring"
        />
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="rounded-md bg-brand-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-900 disabled:cursor-not-allowed disabled:bg-slate-400"
      >
        {isLoading ? "Criando..." : "Criar usuario"}
      </button>

      {message && <p className="text-sm text-slate-600">{message}</p>}
    </form>
  );
}
