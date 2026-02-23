import type { Metadata } from "next";
import "./globals.css";
import "prismjs/themes/prism.css";
import { AppHeader } from "@/components/app-header";

export const metadata: Metadata = {
  title: "Dotpad",
  description: "Compartilhe notas por URL com controle de edicao"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body>
        <AppHeader />
        <main className="mx-auto w-full max-w-5xl px-4 py-8">{children}</main>
      </body>
    </html>
  );
}
