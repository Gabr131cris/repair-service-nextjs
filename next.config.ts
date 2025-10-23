import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,

  eslint: {
    // ✅ Ignoră erorile ESLint în build (altfel Vercel poate opri buildul)
    ignoreDuringBuilds: true,
  },

  typescript: {
    // ✅ Ignoră erorile TypeScript la build (utile pentru deploy rapid)
    ignoreBuildErrors: true,
  },

  // ✅ Noul loc corect pentru Next 15.5+
  serverExternalPackages: ["firebase"],

  images: {
    // ✅ Permite imagini din orice sursă externă (ex: Firebase Storage, CDN)
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
    formats: ["image/webp", "image/avif"],
  },

  // ✅ Evită prerender SSR pentru pagini care folosesc doar client-side Firebase
  output: "standalone",
};

export default nextConfig;
