import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";

export async function GET() {
  const snap = await adminDb.collection("cars").get();

  const cars = snap.docs.map((doc) => ({
    id: doc.id,
    moved: doc.data().moved || false,
    tempId: doc.data().tempId || null,
    name:
      doc.data()?.schemaData?.General?.Title ||
      doc.data()?.schemaData?.General?.Make +
        " " +
        doc.data()?.schemaData?.General?.Model ||
      "Unnamed Car"
  }));

  return NextResponse.json({ cars });
}
