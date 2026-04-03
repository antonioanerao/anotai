import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type Params = {
  params: Promise<{ slug: string }>;
};

const VIEW_WINDOW_SECONDS = 60;

function buildViewCookieName(slug: string) {
  return `pad-view-${slug}`;
}

export async function POST(request: Request, { params }: Params) {
  const { slug } = await params;
  const pad = await prisma.pad.findUnique({
    where: { slug },
    select: { id: true, viewCount: true }
  });

  if (!pad) {
    return NextResponse.json({ error: "Bloco não encontrado." }, { status: 404 });
  }

  const cookieName = buildViewCookieName(slug);
  const now = Date.now();
  const cookieHeader = request.headers.get("cookie") ?? "";
  const requestCookies = new Map(
    cookieHeader
      .split(";")
      .map((part) => part.trim())
      .filter(Boolean)
      .map((part) => {
        const separatorIndex = part.indexOf("=");
        if (separatorIndex === -1) return [part, ""];
        return [part.slice(0, separatorIndex), decodeURIComponent(part.slice(separatorIndex + 1))];
      })
  );
  const lastViewedAtRaw = Number(requestCookies.get(cookieName) ?? "0");
  const shouldIncrement = !Number.isFinite(lastViewedAtRaw) || now - lastViewedAtRaw >= VIEW_WINDOW_SECONDS * 1000;

  if (!shouldIncrement) {
    return NextResponse.json({ viewCount: pad.viewCount, incremented: false });
  }

  const updatedPad = await prisma.pad.update({
    where: { id: pad.id },
    data: {
      viewCount: {
        increment: 1
      }
    },
    select: { viewCount: true }
  });

  const response = NextResponse.json({
    viewCount: updatedPad.viewCount,
    incremented: true
  });

  response.cookies.set(cookieName, String(now), {
    httpOnly: true,
    maxAge: VIEW_WINDOW_SECONDS,
    path: "/",
    sameSite: "lax"
  });

  return response;
}
