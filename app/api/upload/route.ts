import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import sharp from "sharp";

// 🔹 Forțăm rularea pe Node.js, nu Edge (altfel fs/sharp dau eroare)
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const carId = formData.get("carId") as string;
    const section = formData.get("section") as string;

    if (!file || !carId || !section) {
      console.error("❌ Missing params:", { hasFile: !!file, carId, section });
      return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
    }

    // 🔹 Creează folderul: /public/uploads/<carId>/<section>
    const uploadDir = path.join(process.cwd(), "public", "uploads", carId, section);
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

    // 🔹 Transformăm fișierul în WebP optimizat
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const webpName = `${Date.now()}.webp`;
    const outputPath = path.join(uploadDir, webpName);

    await sharp(buffer)
      .resize({ width: 1600, withoutEnlargement: true })
      .webp({ quality: 80 })
      .toFile(outputPath);

    const relativePath = `/uploads/${carId}/${section}/${webpName}`;

    console.log("✅ Saved image:", relativePath);
    return NextResponse.json({ url: relativePath });
  } catch (err: any) {
    console.error("❌ Upload error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
