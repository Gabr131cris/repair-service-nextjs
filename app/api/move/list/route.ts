import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";

export async function GET() {
  const snap = await adminDb.collection("cars").get();

  const cars = snap.docs.map((d) => ({
    id: d.id,
  }));

  return NextResponse.json({ cars });
}
