import { NextResponse } from "next/server";
import { getPlatformSettings } from "@/lib/settings";
import { parseAllowedSignupDomains } from "@/lib/signup-domain-policy";

export async function GET() {
  const settings = await getPlatformSettings();
  const allowedSignupDomains = parseAllowedSignupDomains(settings.allowedSignupDomains).domains;

  return NextResponse.json({
    allowPublicSignup: settings.allowPublicSignup,
    allowedSignupDomains,
    requireAuthToCreatePad: settings.requireAuthToCreatePad
  });
}
