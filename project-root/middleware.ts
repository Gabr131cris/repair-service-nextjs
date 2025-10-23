import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getFirebaseAuth } from "@/lib/firebase";

const auth = await getFirebaseAuth();

import { getAuth } from "firebase/auth";

// 🔹 Rute publice — fără autentificare
const PUBLIC_PATHS = [
  "/",
  "/about",
  "/contact",
  "/faq",
  "/auth",
  "/listings",
  "/_next",
  "/favicon.ico",
  "/images",
];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // ✅ Permitem accesul liber la rutele publice
  if (PUBLIC_PATHS.some((path) => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  // ✅ Verificăm dacă userul este logat (folosim cookie Firebase)
  const authInstance = getAuth();
  const user = authInstance.currentUser;

  // Dacă userul NU e logat → redirect către login
  if (!user) {
    const loginUrl = new URL("/auth/login", req.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // ✅ Dacă e logat, acces permis
  return NextResponse.next();
}

// 🔧 Specificăm ce rute interceptează middleware-ul
export const config = {
  matcher: [
    "/dashboard/:path*", // toate subrutele dashboard
  ],
};
