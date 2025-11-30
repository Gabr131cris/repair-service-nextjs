import { NextResponse } from "next/server";
import { adminAuth } from "@/lib/firebaseAdmin";

export async function POST(req: Request) {
  try {
    const { uid } = await req.json();

    if (!uid) {
      return NextResponse.json({ error: "Missing UID" }, { status: 400 });
    }

    await adminAuth.deleteUser(uid);

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Error deleting user from Auth:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
