// app/api/delete-car/route.ts
import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin"; // 🔹 folosim versiunea server-side
import fs from "fs";
import path from "path";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const carId = searchParams.get("id");

    if (!carId) {
      console.warn("❌ Missing carId in request");
      return NextResponse.json({ error: "Missing carId" }, { status: 400 });
    }

    // 🔹 Citește documentul Firestore (Admin SDK)
    const carRef = adminDb.collection("cars").doc(carId);
    const snap = await carRef.get();

    if (!snap.exists) {
      console.warn("⚠️ Car not found in Firestore:", carId);
      return NextResponse.json({ error: "Car not found" }, { status: 404 });
    }

    const carData = snap.data();
    const tempId = carData?.tempId || carId;

    // 🔹 Construiește path-urile locale către foldere
    const uploadDirFirestore = path.join(process.cwd(), "public", "uploads", carId);
    const uploadDirTemp = path.join(process.cwd(), "public", "uploads", tempId);

    // 🔹 Helper: șterge folderele dacă există
    const tryDelete = (dir: string) => {
      if (fs.existsSync(dir)) {
        try {
          fs.rmSync(dir, { recursive: true, force: true });
          console.log(`🗑️ Deleted folder: ${dir}`);
        } catch (err) {
          console.error(`⚠️ Failed to delete folder: ${dir}`, err);
        }
      } else {
        console.warn(`⚠️ Folder not found: ${dir}`);
      }
    };

    // 🔹 Ștergem folderele asociate mașinii
    tryDelete(uploadDirFirestore);
    if (tempId !== carId) tryDelete(uploadDirTemp);

    // 🔹 Ștergem documentul Firestore
    await carRef.delete();
    console.log("✅ Firestore doc deleted:", carId);

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("❌ Delete error:", err);
    return NextResponse.json({ error: err.message || "Internal Server Error" }, { status: 500 });
  }
}
