import { NextResponse } from "next/server";
import sharp from "sharp";
import { adminStorage } from "@/lib/firebaseAdmin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const carId = formData.get("carId") as string;
    const section = formData.get("section") as string;

    if (!file || !carId || !section) {
      return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
    }

    // 🔹 Fișier în buffer
    const buffer = Buffer.from(await file.arrayBuffer());

    // 🔹 Convertire WebP optimizată
    const optimized = await sharp(buffer)
      .resize({ width: 1600, withoutEnlargement: true })
      .webp({ quality: 80 })
      .toBuffer();

    const filename = `${Date.now()}.webp`;
    const filePath = `cars/${carId}/${section}/${filename}`;

    // 🔥 Upload direct în Firebase Storage
    const fileRef = adminStorage.file(filePath);

    await fileRef.save(optimized, {
      public: true,
      contentType: "image/webp",
    });

    // 🔗 URL public
    const publicUrl = `https://storage.googleapis.com/${adminStorage.name}/${filePath}`;

    console.log("✅ Uploaded:", publicUrl);

    return NextResponse.json({ url: publicUrl });
  } catch (err: any) {
    console.error("❌ Upload error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
