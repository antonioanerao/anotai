export function getFallbackSiteUrl() {
  const rawUrl = process.env.NEXTAUTH_URL?.trim() || "http://localhost:3000";

  try {
    return new URL(rawUrl);
  } catch {
    return new URL("http://localhost:3000");
  }
}

export function resolveSiteUrl(canonicalUrl?: string) {
  if (canonicalUrl?.trim()) {
    try {
      return new URL(canonicalUrl.trim());
    } catch {
      return getFallbackSiteUrl();
    }
  }

  return getFallbackSiteUrl();
}
