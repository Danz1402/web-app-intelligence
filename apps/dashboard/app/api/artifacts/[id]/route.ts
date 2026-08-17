import { NextResponse } from "next/server";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { getArtifactById } from "@wai/storage";
import { db } from "../../../../lib/db";

const repoRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../../../../../../",
);
const artifactsRoot = path.resolve(repoRoot, "artifacts");

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const row = await getArtifactById(db(), id);
  if (!row) return new NextResponse("Not found", { status: 404 });

  const abs = path.resolve(repoRoot, row.path);
  if (!abs.startsWith(artifactsRoot + path.sep) && abs !== artifactsRoot) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  const buf = await fs.readFile(abs).catch(() => null);
  if (!buf) return new NextResponse("File missing", { status: 404 });

  const type =
    row.kind === "screenshot"
      ? "image/png"
      : row.kind === "trace"
        ? "application/zip"
        : "application/octet-stream";
  return new NextResponse(buf, {
    headers: { "Content-Type": type },
  });
}