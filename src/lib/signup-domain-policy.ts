const DOMAIN_SEPARATOR_REGEX = /[\n,;]+/;
const DOMAIN_REGEX = /^(?=.{1,253}$)(?!-)(?:[a-z0-9-]{1,63}\.)+[a-z]{2,63}$/;

export function normalizeDomain(value: string): string {
  return value.trim().toLowerCase().replace(/^@+/, "");
}

export function parseAllowedSignupDomains(rawValue: string): {
  domains: string[];
  invalidDomains: string[];
} {
  const tokens = rawValue
    .split(DOMAIN_SEPARATOR_REGEX)
    .map((token) => normalizeDomain(token))
    .filter(Boolean);

  const uniqueDomains = Array.from(new Set(tokens));
  const invalidDomains = uniqueDomains.filter((domain) => !DOMAIN_REGEX.test(domain));
  const domains = uniqueDomains.filter((domain) => DOMAIN_REGEX.test(domain));

  return { domains, invalidDomains };
}

export function serializeAllowedSignupDomains(domains: string[]): string {
  return domains.join("\n");
}

export function extractEmailDomain(email: string): string {
  const atIndex = email.lastIndexOf("@");
  if (atIndex < 0) return "";
  return normalizeDomain(email.slice(atIndex + 1));
}

export function isEmailAllowedByDomainPolicy(email: string, allowedDomains: string[]): boolean {
  if (allowedDomains.length === 0) {
    return true;
  }

  const emailDomain = extractEmailDomain(email);
  return allowedDomains.includes(emailDomain);
}
