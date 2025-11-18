import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export async function POST(req: Request) {
  const formData = await req.formData();
  const file = formData.get("file") as File;
  const carId = formData.get("carId") as string;

  if (!file) return NextResponse.json({ error: "No file provided" });

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  // Extragem extensia din numele original
  const ext = file.name.split(".").pop() || "pdf";

  // Generăm un nume unic pentru fișier
  const fileName = `${Date.now()}.${ext}`;

  const uploadDir = path.join(process.cwd(), "public", "uploads", carId, "files");
  await mkdir(uploadDir, { recursive: true });

  const filePath = path.join(uploadDir, fileName);
  await writeFile(filePath, buffer);

  const url = `/uploads/${carId}/files/${fileName}`;

  return NextResponse.json({ url });
}
