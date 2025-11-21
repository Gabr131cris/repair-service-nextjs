import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import sharp from "sharp";
import { randomUUID } from "crypto";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    // 🧩 Creăm directorul local /public/uploads/pages dacă nu există
    const uploadsDir = path.join(process.cwd(), "public", "uploads", "pages");
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    // 🔹 Citim fișierul și îl convertim în buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 🔹 Generăm nume unic și cale finală
    const webpName = `${randomUUID()}.webp`;
    const outputPath = path.join(uploadsDir, webpName);

    // 🔹 Conversie în WebP (optimizat)
    await sharp(buffer)
      .resize({ width: 1600, withoutEnlargement: true })
      .webp({ quality: 80 })
      .toFile(outputPath);

    // 🔹 Calea publică accesibilă din browser
    const publicPath = `/uploads/pages/${webpName}`;
    console.log("✅ Uploaded and optimized:", publicPath);

    return NextResponse.json({ url: publicPath });
  } catch (err: any) {
    console.error("❌ Upload error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
