import { NextResponse } from "next/server";
import { adminStorage } from "@/lib/firebaseAdmin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const { filePath } = await req.json();

    if (!filePath) {
      return NextResponse.json({ error: "Missing filePath" }, { status: 400 });
    }

    const bucket = adminStorage;

    // 🔥 Extragem path-ul real din URL Firebase Storage
    // Exemplu URL:
    // https://firebasestorage.googleapis.com/v0/b/dariella-motors-storage.appspot.com/o/cars%2F123%2Ffiles%2Fdoc.pdf?alt=media&token=xyz
    const decoded = decodeURIComponent(filePath);
    const startIndex = decoded.indexOf("/o/") + 3;
    const endIndex = decoded.indexOf("?");

    if (startIndex < 3 || endIndex === -1) {
      console.error("❌ Invalid filePath:", filePath);
      return NextResponse.json({ error: "Invalid filePath" }, { status: 400 });
    }

    const storagePath = decoded.substring(startIndex, endIndex).replace(/%2F/g, "/");

    // 🔥 Ștergem fișierul din Firebase Storage
    await bucket.file(storagePath).delete();

    console.log("🗑️ Deleted file:", storagePath);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("DELETE FILE ERROR:", err);
    return NextResponse.json({ error: "Failed to delete file" }, { status: 500 });
  }
}
