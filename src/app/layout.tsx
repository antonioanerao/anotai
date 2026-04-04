import type { Metadata } from "next";
import "./globals.css";
import "prismjs/themes/prism.css";
import { AppHeader } from "@/components/app-header";
import { themeInitScript } from "@/lib/theme";
import { GoogleAnalytics } from "@/components/google-analytics";
import { getPlatformSettingsWithFallback } from "@/lib/settings";
import { resolveSiteUrl } from "@/lib/site";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getPlatformSettingsWithFallback();
  const siteUrl = resolveSiteUrl(settings.canonicalUrl);

  return {
    metadataBase: siteUrl,
    title: {
      default: settings.siteTitle,
      template: `%s | ${settings.siteTitle}`
    },
    description: settings.metaDescription,
    applicationName: settings.siteTitle,
    alternates: {
      canonical: settings.canonicalUrl || "/"
    },
    openGraph: {
      type: "website",
      locale: "pt_BR",
      url: settings.canonicalUrl || "/",
      siteName: settings.siteTitle,
      title: settings.siteTitle,
      description: settings.metaDescription,
      images: settings.ogImagePath ? [settings.ogImagePath] : undefined
    },
    twitter: {
      card: settings.ogImagePath ? "summary_large_image" : "summary",
      title: settings.siteTitle,
      description: settings.metaDescription,
      images: settings.ogImagePath ? [settings.ogImagePath] : undefined
    }
  };
}

const googleAnalyticsId = process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID?.trim() ?? "";

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
        {googleAnalyticsId && <GoogleAnalytics measurementId={googleAnalyticsId} />}
        <AppHeader />
        <main className="mx-auto w-full max-w-[76.8rem] px-4 py-8">{children}</main>
      </body>
    </html>
  );
}
