import { readFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";

type Params = {
  params: Promise<{ filename: string }>;
};

const contentTypeByExtension: Record<string, string> = {
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  webp: "image/webp"
};

export async function GET(_: Request, { params }: Params) {
  const { filename } = await params;

  if (!/^og-image-[a-f0-9-]+\.(png|jpg|jpeg|webp)$/i.test(filename)) {
    return new NextResponse("Not found", { status: 404 });
  }

  const filePath = path.join(process.cwd(), "public", "seo", filename);

  try {
    const buffer = await readFile(filePath);
    const extension = filename.split(".").pop()?.toLowerCase() ?? "png";

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": contentTypeByExtension[extension] ?? "application/octet-stream",
        "Cache-Control": "public, max-age=31536000, immutable"
      }
    });
  } catch {
    return new NextResponse("Not found", { status: 404 });
  }
}
