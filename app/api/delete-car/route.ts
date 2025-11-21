// app/api/delete-car/route.ts
import { NextResponse } from "next/server";
import { adminDb, adminStorage } from "@/lib/firebaseAdmin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const carId = searchParams.get("id");

    if (!carId) {
      return NextResponse.json({ error: "Missing carId" }, { status: 400 });
    }

    // 🔹 Citește documentul Firestore
    const carRef = adminDb.collection("cars").doc(carId);
    const snap = await carRef.get();

    if (!snap.exists) {
      return NextResponse.json({ error: "Car not found" }, { status: 404 });
    }

    const carData = snap.data();
    const schemaData = carData?.schemaData || {};

    const bucket = adminStorage.bucket();

    // 🔥 Colectăm toate imaginile + fișierele referite în schemaData
    const filesToDelete: string[] = [];

    for (const section of Object.values(schemaData)) {
      if (!section || typeof section !== "object") continue;

      // 🔹 IMAGES
      if (Array.isArray(section.images)) {
        section.images.forEach((img: any) => {
          if (img.src) filesToDelete.push(img.src);
        });
      }

      // 🔹 FILES (PDF / DOC)
      if (Array.isArray(section.files)) {
        section.files.forEach((f: any) => {
          if (f.src) filesToDelete.push(f.src);
        });
      }
    }

    // 🔥 Ștergem toate fișierele din Firebase Storage
    for (const url of filesToDelete) {
      try {
        // extragem path-ul din URL-ul public
        const decoded = decodeURIComponent(url);
        const startIndex = decoded.indexOf("/o/") + 3;
        const endIndex = decoded.indexOf("?");

        const storagePath = decoded.substring(startIndex, endIndex).replace("%2F", "/");

        await bucket.file(storagePath).delete();

        console.log("🗑️ Deleted from Storage:", storagePath);
      } catch (err) {
        console.error("⚠️ Failed to delete:", url, err);
      }
    }

    // 🔹 Ștergem documentul Firestore
    await carRef.delete();
    console.log("✅ Firestore doc deleted:", carId);

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("❌ Delete error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
