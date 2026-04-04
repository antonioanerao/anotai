import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { auth } from "@/auth";

const allowedMimeTypes = new Map([
  ["image/png", "png"],
  ["image/jpeg", "jpg"],
  ["image/webp", "webp"]
]);

export async function POST(request: Request) {
  const session = await auth();

  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Acesso negado." }, { status: 403 });
  }

  const formData = await request.formData().catch(() => null);
  const file = formData?.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Arquivo invalido." }, { status: 400 });
  }

  const extension = allowedMimeTypes.get(file.type);
  if (!extension) {
    return NextResponse.json({ error: "Formato nao suportado. Use PNG, JPG ou WEBP." }, { status: 400 });
  }

  if (file.size > 5 * 1024 * 1024) {
    return NextResponse.json({ error: "A imagem deve ter no maximo 5 MB." }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const relativeDirectory = path.join("seo");
  const absoluteDirectory = path.join(process.cwd(), "public", relativeDirectory);
  const fileName = `og-image-${randomUUID()}.${extension}`;
  const relativePath = `/seo/${fileName}`;

  await mkdir(absoluteDirectory, { recursive: true });
  await writeFile(path.join(absoluteDirectory, fileName), buffer);

  return NextResponse.json({
    path: relativePath
  });
}
