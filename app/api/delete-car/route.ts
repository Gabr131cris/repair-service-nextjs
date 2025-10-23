import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { doc, getDoc, deleteDoc } from "firebase/firestore";
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

    // 🔹 Citește documentul Firestore ca să aflăm tempId
    const carRef = doc(db, "cars", carId);
    const snap = await getDoc(carRef);

    if (!snap.exists()) {
      console.warn("⚠️ Car not found in Firestore:", carId);
      return NextResponse.json({ error: "Car not found" }, { status: 404 });
    }

    const carData = snap.data();
    const tempId = carData?.tempId || carId; // dacă nu există tempId, folosește carId

    // 🔹 Path pentru ambele posibile foldere
    const uploadDirFirestore = path.join(process.cwd(), "public", "uploads", carId);
    const uploadDirTemp = path.join(process.cwd(), "public", "uploads", tempId);

    console.log("🧾 CWD:", process.cwd());
    console.log("📁 Upload dir (Firestore):", uploadDirFirestore);
    console.log("📁 Upload dir (Temp):", uploadDirTemp);

    // 🔹 Funcție de ștergere sigură
    const tryDelete = (dir: string) => {
      if (fs.existsSync(dir)) {
        fs.rmSync(dir, { recursive: true, force: true });
        console.log(`🗑️ Deleted folder: ${dir}`);
      } else {
        console.warn(`⚠️ Folder not found: ${dir}`);
      }
    };

    // 🔹 Ștergem ambele variante, în caz că există
    tryDelete(uploadDirFirestore);
    if (tempId !== carId) tryDelete(uploadDirTemp);

    // 🔹 Șterge documentul din Firestore
    await deleteDoc(carRef);
    console.log("✅ Firestore doc deleted:", carId);

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("❌ Delete error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
