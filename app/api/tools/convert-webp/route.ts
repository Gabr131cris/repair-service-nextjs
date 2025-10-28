import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import sharp from "sharp";
import { dbServer } from "@/lib/firebaseServer";
import { collection, getDocs, updateDoc, doc } from "firebase/firestore";

// 🧩 Rulăm pe Node.js, nu Edge
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST() {
  const logs: string[] = [];
  let convertedCount = 0;

  try {
    const uploadsDir = path.join(process.cwd(), "public", "uploads", "pages");

    if (!fs.existsSync(uploadsDir)) {
      return NextResponse.json(
        { error: "❌ Folder /uploads/pages not found." },
        { status: 404 }
      );
    }

    const files = fs.readdirSync(uploadsDir);
    const imageFiles = files.filter((f) => /\.(png|jpg|jpeg)$/i.test(f));

    if (imageFiles.length === 0) {
      logs.push("ℹ️ No .jpg or .png images found in /uploads/pages.");
      return NextResponse.json({ converted: 0, logs });
    }

    logs.push(`🚀 Found ${imageFiles.length} images to convert...`);

    for (const file of imageFiles) {
      const inputPath = path.join(uploadsDir, file);
      const outputName = file.replace(/\.(png|jpg|jpeg)$/i, ".webp");
      const outputPath = path.join(uploadsDir, outputName);

      await sharp(inputPath)
        .resize({ width: 1600, withoutEnlargement: true })
        .webp({ quality: 80 })
        .toFile(outputPath);

      fs.unlinkSync(inputPath); // 🗑️ Delete original
      convertedCount++;
      logs.push(`✅ Converted ${file} → ${outputName}`);
    }

    // 🔹 Update Firestore paths (if any reference old image names)
    try {
      const settingsSnap = await getDocs(collection(dbServer, "settings"));
      for (const docSnap of settingsSnap.docs) {
        const data = docSnap.data();
        let updated = false;

        for (const [key, value] of Object.entries(data)) {
          if (typeof value === "string" && value.includes("/uploads/pages/")) {
            const newValue = value.replace(/\.(png|jpg|jpeg)$/i, ".webp");
            if (newValue !== value) {
              await updateDoc(doc(dbServer, "settings", docSnap.id), {
                [key]: newValue,
              });
              updated = true;
            }
          }
        }

        if (updated) logs.push(`🗂️ Updated Firestore doc: ${docSnap.id}`);
      }
    } catch (err: any) {
      logs.push(`⚠️ Firestore update skipped: ${err.message}`);
    }

    logs.push(`🎉 Conversion complete — ${convertedCount} files processed.`);
    return NextResponse.json({ converted: convertedCount, logs });
  } catch (err: any) {
    console.error("❌ Conversion error:", err);
    logs.push(`❌ Error: ${err.message}`);
    return NextResponse.json({ error: err.message, logs }, { status: 500 });
  }
}
