import { NextResponse } from "next/server";
import { getPlatformSettings } from "@/lib/settings";

export async function GET() {
  const settings = await getPlatformSettings();

  return NextResponse.json({
    allowPublicSignup: settings.allowPublicSignup
  });
}
