import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { canReadPad } from "@/lib/authz";

type Params = {
  params: Promise<{ slug: string }>;
};

const VIEW_WINDOW_SECONDS = 60;

function buildViewCookieName(slug: string) {
  return `pad-view-${slug}`;
}

export async function POST(request: Request, { params }: Params) {
  const session = await auth();
  const { slug } = await params;
  const pad = await prisma.pad.findUnique({
    where: { slug },
    select: { id: true, viewCount: true, ownerId: true, isPrivate: true }
  });

  if (!pad || !canReadPad({ userId: session?.user?.id, ownerId: pad.ownerId, isPrivate: pad.isPrivate })) {
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

  const update = await prisma.pad.updateMany({
    where: {
      id: pad.id,
      OR: [{ isPrivate: false }, { ownerId: session?.user?.id ?? "" }]
    },
    data: {
      viewCount: {
        increment: 1
      }
    }
  });

  if (update.count === 0) {
    return NextResponse.json({ error: "Bloco não encontrado." }, { status: 404 });
  }

  const updatedPad = await prisma.pad.findUniqueOrThrow({
    where: { id: pad.id },
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
