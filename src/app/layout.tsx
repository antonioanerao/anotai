import type { Metadata } from "next";
import "./globals.css";
import "prismjs/themes/prism.css";
import { AppHeader } from "@/components/app-header";
import { themeInitScript } from "@/lib/theme";

export const metadata: Metadata = {
  title: "AnotAI",
  description: "Compartilhe notas por URL com controle de edicao"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body>
        <AppHeader />
        <main className="mx-auto w-full max-w-5xl px-4 py-8">{children}</main>
      </body>
    </html>
  );
}
