import { NextResponse } from "next/server";
import { adminStorage } from "@/lib/firebaseAdmin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const carId = formData.get("carId") as string;
    const section = (formData.get("section") as string) || "files";

    if (!file || !carId) {
      return NextResponse.json(
        { error: "Missing file or carId" },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    // 🔹 Extragem extensia
    const ext = file.name.split(".").pop() || "pdf";

    // 🔹 Generăm nume unic
    const filename = `${Date.now()}.${ext}`;

    // 🔹 Path în Firebase Storage
    const filePath = `cars/${carId}/${section}/${filename}`;
    const fileRef = adminStorage.file(filePath);

    // 🔹 Upload direct în Firebase Storage
    await fileRef.save(buffer, {
      public: true,
      contentType: file.type || "application/octet-stream",
    });

    // 🔗 Link public
    const publicUrl = `https://storage.googleapis.com/${adminStorage.name}/${filePath}`;

    console.log("📄 Uploaded file:", publicUrl);

    return NextResponse.json({ url: publicUrl });
  } catch (error: any) {
    console.error("❌ upload-file error:", error);
    return NextResponse.json(
      { error: error.message || "Upload failed" },
      { status: 500 }
    );
  }
}
