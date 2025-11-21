import { NextResponse } from "next/server";
import path from "path";
import fs from "fs";
import { adminDb, adminStorage } from "@/lib/firebaseAdmin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const carId = searchParams.get("id");

    if (!carId)
      return NextResponse.json({ error: "Missing carId" }, { status: 400 });

    const snap = await adminDb.collection("cars").doc(carId).get();
    if (!snap.exists)
      return NextResponse.json({ error: "Car not found" }, { status: 404 });

    const carData = snap.data();
    const schema = carData?.schemaData || {};
    const tempId = carData?.tempId;

    const carName =
      schema?.General?.Title ||
      (schema?.General?.Make + " " + schema?.General?.Model) ||
      "Unnamed Car";

    if (!tempId)
      return NextResponse.json({
        error: "This car does not have tempId → cannot match local folder",
      });

    const localFolder = path.join(
      process.cwd(),
      "public",
      "uploads",
      tempId.toString()
    );

    if (!fs.existsSync(localFolder)) {
      return NextResponse.json({
        message: "Local folder not found",
        expectedFolder: localFolder,
        carId,
        tempId,
        carName,
      });
    }

    const log: string[] = [];
    const files: { fullPath: string; filename: string; section: string }[] = [];

    const walk = (dir: string, sections: string[] = []) => {
      const entries = fs.readdirSync(dir);

      for (const entry of entries) {
        const full = path.join(dir, entry);
        const stat = fs.statSync(full);

        if (stat.isDirectory()) {
          walk(full, [...sections, entry]);
        } else {
          files.push({
            fullPath: full,
            filename: entry,
            section: sections[sections.length - 1] || "unknown",
          });
        }
      }
    };

    walk(localFolder);

    const uploadedPaths: Record<string, string> = {};

    for (const f of files) {
      const buffer = fs.readFileSync(f.fullPath);
      const storagePath = `cars/${tempId}/${f.section}/${f.filename}`;
      const fileRef = adminStorage.file(storagePath);

      await fileRef.save(buffer, { public: true });

      const newUrl = `https://storage.googleapis.com/${adminStorage.name}/${storagePath}`;
      uploadedPaths[f.filename] = newUrl;

      log.push(`Uploaded: ${f.filename} → ${storagePath}`);
    }

    function updateLinks(obj: any) {
      for (const key in obj) {
        if (typeof obj[key] === "string") {
          for (const filename of Object.keys(uploadedPaths)) {
            if (obj[key].includes(filename)) {
              obj[key] = uploadedPaths[filename];
            }
          }
        } else if (typeof obj[key] === "object") {
          updateLinks(obj[key]);
        }
      }
    }

    updateLinks(schema);

    await adminDb.collection("cars").doc(carId).update({
      schemaData: schema,
      moved: true,        // <-- ADĂUGAT
      movedAt: Date.now() // <-- OPTIONAL
    });

    fs.rmSync(localFolder, { recursive: true, force: true });

    return NextResponse.json({
      success: true,
      moved: files.length,
      firebaseFolder: tempId.toString(),
      carId,
      tempId,
      carName,
      localFolder,
      log,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Migration failed" },
      { status: 500 }
    );
  }
}
